/** Validate first; --write explicitly copies the authorized archive into PostgreSQL. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { load } from "cheerio";
import { ensureBlogTable } from "../lib/blog-store";
import { sanitizeBlogHtml } from "../lib/blog-html";
import type { ArchivedPost } from "./lib/panlabo";

const cacheDir = resolve(process.env.PANLABO_CACHE_DIR || ".cache/panlabo");
async function main() {
  const posts: ArchivedPost[] = JSON.parse(await readFile(join(cacheDir, "posts.json"), "utf8"));
  const manifest = JSON.parse(await readFile(join(cacheDir, "manifest.json"), "utf8"));
  const assets: Record<string, { url: string }> = JSON.parse(await readFile(join(cacheDir, "assets.json"), "utf8"));
  const failures: Record<string, string> = JSON.parse(await readFile(join(cacheDir, "asset-failures.json"), "utf8"));
  if (posts.length !== manifest.articleCount || manifest.pages.length !== manifest.pageCount || manifest.pages.reduce((n: number, p: { count: number }) => n + p.count, 0) !== posts.length) throw new Error("Archive manifest count mismatch");
  const ids = new Set(posts.map((p) => p.id));
  const unavailableSourceMedia: { postId: number; src: string }[] = [];
  if (ids.size !== posts.length) throw new Error("Duplicate source IDs");
  for (const post of posts) {
    if (post.slug !== `panlabo-${post.id}` || post.sourceUrl !== `https://panlabo.jugem.jp/?eid=${post.id}` || post.needsContinuation || !post.title.trim()) throw new Error(`Invalid post ${post.id}`);
    const dateParts = post.originalDate.match(/^(\d{4})\.(\d{2})\.(\d{2})\s+\w+\s+(\d{2}):(\d{2})$/);
    if (!dateParts) throw new Error(`Invalid source date ${post.id}`);
    const [, y, m, d, h, min] = dateParts;
    if (new Date(`${y}-${m}-${d}T${h}:${min}:00+09:00`).toISOString() !== post.publishedAt) throw new Error(`Changed date ${post.id}`);
    const hash = createHash("sha256").update(JSON.stringify({ title: post.title, publishedAt: post.publishedAt, sourceHtml: post.sourceHtml })).digest("hex");
    if (hash !== post.sourceHash) throw new Error(`Changed source content ${post.id}`);
    const original = load(post.sourceHtml, {}, false);
    original('img[src^="blob:"]').each((_, element) => {
      unavailableSourceMedia.push({ postId: post.id, src: original(element).attr("src")! });
    });
    const $ = load(post.contentHtml, {}, false);
    $("img[src]").each((_, element) => {
      const src = $(element).attr("src")!;
      if (assets[src]) $(element).attr("src", assets[src].url);
      else if (["img-cdn.jg.jugem.jp", "img.jugem.jp"].includes(new URL(src).hostname) && !failures[src]) throw new Error(`Photo not yet processed: ${src}`);
    });
    $("a[href]").each((_, element) => {
      const href = $(element).attr("href")!;
      try {
        const url = new URL(href);
        const id = Number(url.searchParams.get("eid"));
        if (url.hostname === "panlabo.jugem.jp" && ids.has(id) && (!url.hash || url.hash === "#sequel")) $(element).attr("href", `/blog/panlabo-${id}`);
      } catch {}
    });
    post.contentHtml = sanitizeBlogHtml($.html());
    post.heroImageUrl = assets[post.heroImageUrl]?.url || post.heroImageUrl;
  }
  console.log(JSON.stringify({ validated: posts.length, earliest: manifest.earliest, latest: manifest.latest, mirroredPhotos: Object.keys(assets).length, unavailablePhotos: Object.keys(failures).length, mode: process.argv.includes("--write") ? "write" : "validate-only" }));
  if (!process.argv.includes("--write")) return;
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const sql = neon(process.env.DATABASE_URL);
  // Back up all old rows once before any schema or data changes.
  const backupPath = join(cacheDir, "blog-posts-before-import.json");
  try { await readFile(backupPath); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const old = await sql`SELECT * FROM blog_posts`;
    await writeFile(backupPath, JSON.stringify(old, null, 2), { flag: "wx" });
  }
  await ensureBlogTable();
  const collisions = await sql`SELECT slug FROM blog_posts WHERE slug = ANY(${posts.map((p) => p.slug)}) AND source_url IS DISTINCT FROM ('https://panlabo.jugem.jp/?eid=' || substring(slug from 9))`;
  if (collisions.length) throw new Error(`Existing unrelated slugs would be overwritten: ${collisions.map((p) => p.slug).join(", ")}`);
  let changed = 0;
  for (let i = 0; i < posts.length; i += 40) {
    const results = await sql.transaction(posts.slice(i, i + 40).map((post) => sql`
      INSERT INTO blog_posts (slug, title, excerpt, hero_image_url, content_html, published,
        published_at, created_at, updated_at, source_url, author_name, category, source_html, source_hash, original_date)
      VALUES (${post.slug}, ${post.title}, ${post.excerpt}, ${post.heroImageUrl}, ${post.contentHtml}, TRUE,
        ${post.publishedAt}, ${post.publishedAt}, ${post.publishedAt}, ${post.sourceUrl}, ${post.authorName},
        ${post.category}, ${post.sourceHtml}, ${post.sourceHash}, ${post.originalDate})
      ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, excerpt = EXCLUDED.excerpt,
        hero_image_url = EXCLUDED.hero_image_url, content_html = EXCLUDED.content_html,
        published = EXCLUDED.published, published_at = EXCLUDED.published_at,
        source_url = EXCLUDED.source_url, author_name = EXCLUDED.author_name, category = EXCLUDED.category,
        source_html = EXCLUDED.source_html, source_hash = EXCLUDED.source_hash, original_date = EXCLUDED.original_date
      WHERE blog_posts.source_hash IS DISTINCT FROM EXCLUDED.source_hash
        OR blog_posts.content_html IS DISTINCT FROM EXCLUDED.content_html
        OR blog_posts.hero_image_url IS DISTINCT FROM EXCLUDED.hero_image_url
        OR blog_posts.title IS DISTINCT FROM EXCLUDED.title
        OR blog_posts.excerpt IS DISTINCT FROM EXCLUDED.excerpt
        OR blog_posts.published IS DISTINCT FROM EXCLUDED.published
        OR blog_posts.published_at IS DISTINCT FROM EXCLUDED.published_at
        OR blog_posts.original_date IS DISTINCT FROM EXCLUDED.original_date
        OR blog_posts.author_name IS DISTINCT FROM EXCLUDED.author_name
        OR blog_posts.category IS DISTINCT FROM EXCLUDED.category
      RETURNING slug
    `));
    changed += results.reduce((n, rows) => n + rows.length, 0);
    if (i % 200 === 0) console.log(`Imported ${Math.min(i + 40, posts.length)}/${posts.length}`);
  }
  const rows = await sql`SELECT slug, title, published_at, source_url, source_hash, original_date, published,
    hero_image_url, md5(content_html) AS content_checksum, md5(source_html) AS source_checksum
    FROM blog_posts WHERE source_url LIKE 'https://panlabo.jugem.jp/?eid=%'`;
  if (rows.length !== posts.length) throw new Error(`Database count mismatch: ${rows.length} vs ${posts.length}`);
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  for (const post of posts) {
    const row = bySlug.get(post.slug);
    // MD5 is a compact transport checksum here; source provenance uses SHA-256.
    const checksum = (value: string) => createHash("md5").update(value).digest("hex");
    if (!row || !row.published || row.title !== post.title || new Date(row.published_at).toISOString() !== post.publishedAt || row.source_url !== post.sourceUrl || row.source_hash !== post.sourceHash || row.original_date !== post.originalDate || row.hero_image_url !== post.heroImageUrl || row.content_checksum !== checksum(post.contentHtml) || row.source_checksum !== checksum(post.sourceHtml)) throw new Error(`Database verification failed: ${post.slug}`);
  }
  const report = { verifiedAt: new Date().toISOString(), source: manifest.source, articles: posts.length, changedRows: changed, sourcePages: manifest.pageCount, originalDatesVerified: posts.length, originalBodiesVerified: posts.length, renderedBodiesVerified: posts.length, earliest: manifest.earliest, latest: manifest.latest, mirroredPhotos: Object.keys(assets).length, unavailablePhotos: failures, unavailableSourceMedia };
  await writeFile(join(cacheDir, "import-report.json"), JSON.stringify(report, null, 2));
  console.log(`Verified all ${posts.length} original dates, source URLs and content hashes; ${changed} rows changed.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
