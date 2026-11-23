import { mkdir, writeFile } from "node:fs/promises";
import { ikedaSql } from "../lib/ikeda-schema";
import {
  translateBlogTexts,
  translationSource,
  translateBlogArticle,
  claimBlogTranslation,
  saveBlogTranslation,
  releaseBlogTranslation,
} from "../lib/blog-translations";
import { BLOG_TRANSLATION as C } from "../lib/blog-translation-config";
import { isTranslationLanguage } from "../lib/blog-language";
async function main() {
  const language =
    process.argv.find((a) => a.startsWith("--language="))?.slice(11) || "en";
  if (!isTranslationLanguage(language))
    throw Error("Unsupported translation language");
  const sql = ikedaSql();
  const full = process.argv.find((a) => a.startsWith("--article="))?.slice(10);
  if (full) {
    const source = await translationSource(full);
    if (!source) throw Error("Missing article");
    if (!(await claimBlogTranslation(full, source.source_hash, language)))
      throw Error("Already processing");
    try {
      const t = await translateBlogArticle(source, undefined, language);
      await saveBlogTranslation(full, t, language);
      console.log(
        JSON.stringify({
          slug: full,
          title: t.title,
          characters: t.contentHtml.length,
          inputTokens: t.inputTokens,
          outputTokens: t.outputTokens,
        }),
      );
    } catch (e) {
      await releaseBlogTranslation(full, source.source_hash, language);
      throw e;
    }
    return;
  }
  const refreshRecent =
    Number(
      process.argv.find((a) => a.startsWith("--refresh-recent="))?.slice(17),
    ) || 0;
  if (
    !Number.isInteger(refreshRecent) ||
    refreshRecent < 0 ||
    refreshRecent > 100
  )
    throw Error("Invalid recent limit");
  const rows = refreshRecent
    ? await sql`SELECT slug,title,excerpt,COALESCE(NULLIF(source_hash,''),md5(title||content_html)) AS source_hash FROM blog_posts WHERE published=TRUE ORDER BY published_at DESC,slug DESC LIMIT ${refreshRecent}`
    : await sql`SELECT p.slug,p.title,p.excerpt,COALESCE(NULLIF(p.source_hash,''),md5(p.title||p.content_html)) AS source_hash FROM blog_posts p LEFT JOIN blog_translations t ON t.post_slug=p.slug AND t.language=${language}
 WHERE p.published=TRUE AND (${language}<>'en' OR btrim(p.title_en)='') AND (t.post_slug IS NULL OR t.source_hash<>COALESCE(NULLIF(p.source_hash,''),md5(p.title||p.content_html)) OR btrim(t.title)='') ORDER BY p.published_at DESC`;
  const batches: (typeof rows)[] = [];
  for (let i = 0; i < rows.length; i += 20) batches.push(rows.slice(i, i + 20));
  let cursor = 0,
    done = 0,
    inputTokens = 0,
    outputTokens = 0;
  const failures: string[] = [];
  await Promise.all(
    Array.from({ length: 3 }, async () => {
      while (cursor < batches.length) {
        const batch = batches[cursor++];
        try {
          const result = await translateBlogTexts(
            batch.flatMap((p) => [p.title, p.excerpt]),
            undefined,
            language,
          );
          inputTokens += result.inputTokens;
          outputTokens += result.outputTokens;
          const payload = batch.map((p, i) => ({
            slug: p.slug,
            hash: p.source_hash,
            title: result.texts[2 * i],
            excerpt: result.texts[2 * i + 1],
          }));
          await sql`INSERT INTO blog_translations(post_slug,language,source_hash,title,excerpt,model)
   SELECT x.slug,${language},x.hash,x.title,x.excerpt,${C.model} FROM jsonb_to_recordset(${JSON.stringify(payload)}::jsonb) AS x(slug text,hash text,title text,excerpt text) JOIN blog_posts p ON p.slug=x.slug AND p.published=TRUE AND x.hash=COALESCE(NULLIF(p.source_hash,''),md5(p.title||p.content_html))
   ON CONFLICT(post_slug,language) DO UPDATE SET title=EXCLUDED.title,excerpt=EXCLUDED.excerpt,source_hash=EXCLUDED.source_hash,model=EXCLUDED.model,
   content_html=CASE WHEN blog_translations.source_hash=EXCLUDED.source_hash THEN blog_translations.content_html ELSE '' END,generated_at=NOW()`;
          done += batch.length;
          console.log(`Translated summaries ${done}/${rows.length}`);
        } catch (e) {
          failures.push(...batch.map((p) => p.slug));
          console.error(
            "Batch failed",
            e instanceof Error ? e.message : "Error",
          );
        }
      }
    }),
  );
  await mkdir(".cache/translations", { recursive: true });
  const report = {
    at: new Date().toISOString(),
    language,
    processed: done,
    requested: rows.length,
    inputTokens,
    outputTokens,
    failures,
  };
  await writeFile(
    `.cache/translations/summaries-${language}.json`,
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify({ ...report, failures: failures.length }));
  if (failures.length) process.exitCode = 1;
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
