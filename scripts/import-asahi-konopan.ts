import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { neon, neonConfig } from "@neondatabase/serverless";
import { load } from "cheerio";
import {
  ASAHI_KONOPAN as A,
  articleHash,
  compact,
  isAsahiImage,
  type AsahiPost,
} from "./lib/asahi-konopan";
import { sanitizeBlogHtml } from "../lib/blog-html";
const dir = resolve(process.env.ASAHI_CACHE_DIR || ".cache/asahi");
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
neonConfig.fetchFunction = async (
  input: RequestInfo | URL,
  init?: RequestInit,
) => {
  for (let attempt = 0; ; attempt++)
    try {
      const r = await fetch(input, {
        ...init,
        signal: AbortSignal.timeout(45_000),
      });
      if (r.status < 500 || attempt >= 4) {
        const bytes = await r.arrayBuffer();
        const headers = new Headers(r.headers);
        headers.delete("content-encoding");
        headers.delete("content-length");
        return new Response(bytes, {
          status: r.status,
          statusText: r.statusText,
          headers,
        });
      }
      await r.body?.cancel();
    } catch (e) {
      if (attempt >= 4) throw e;
    } finally {
      if (attempt) await wait(1000 * attempt);
    }
};
const checksum = (s: string) => createHash("md5").update(s).digest("hex");
async function main() {
  const posts: AsahiPost[] = JSON.parse(
    await readFile(join(dir, "posts.json"), "utf8"),
  );
  const manifest = JSON.parse(
    await readFile(join(dir, "manifest.json"), "utf8"),
  );
  const listing = JSON.parse(await readFile(join(dir, "listing.json"), "utf8"));
  const allAssets: Record<string, { url: string; bytes: number }> = JSON.parse(
    await readFile(join(dir, "assets.json"), "utf8"),
  );
  const allFailures: Record<string, string> = JSON.parse(
    await readFile(join(dir, "asset-failures.json"), "utf8"),
  );
  const wanted = new Set(posts.flatMap((p) => p.images));
  const assets = Object.fromEntries(
    Object.entries(allAssets).filter(([src]) => wanted.has(src)),
  );
  const failures = Object.fromEntries(
    Object.entries(allFailures).filter(([src]) => wanted.has(src)),
  );
  if (
    posts.length !== manifest.articleCount ||
    posts.length !== listing.articleCount ||
    manifest.pages.reduce(
      (n: number, p: { count: number }) => n + p.count,
      0,
    ) !== posts.length
  )
    throw Error("Archive count mismatch");
  const ids = new Set(posts.map((p) => p.id));
  if (ids.size !== posts.length) throw Error("Duplicate article IDs");
  const prepared = posts.map((post) => {
    if (
      post.slug !== `asahi-konopan-${post.id}` ||
      post.sourceUrl !== `${A.origin}/and/w/article/${post.id}` ||
      !post.authorName.trim() ||
      post.category !== A.category ||
      articleHash(post) !== post.sourceHash
    )
      throw Error(`Invalid source: ${post.id}`);
    const day = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .format(new Date(post.publishedAt))
      .replace(/-/g, ".");
    if (
      day !== post.originalDate ||
      listing.articles.find((a: { id: number }) => a.id === post.id)?.day !==
        day
    )
      throw Error(`Wrong original date: ${post.id}`);
    const $ = load(post.contentHtml, {}, false);
    $("img[src]").each((_, e) => {
      const src = $(e).attr("src")!;
      if (assets[src]) $(e).attr("src", assets[src].url);
      else if (
        isAsahiImage(src) &&
        !failures[src] &&
        !process.argv.includes("--source-images")
      )
        throw Error(`Image not processed: ${src}`);
    });
    $("a[href]").each((_, e) => {
      try {
        const u = new URL($(e).attr("href")!);
        const id = Number(u.pathname.match(/^\/and\/w\/article\/(\d+)$/)?.[1]);
        if (u.origin === A.origin && ids.has(id))
          $(e).attr("href", `/blog/asahi-konopan-${id}${u.hash}`);
      } catch {}
    });
    const contentHtml = sanitizeBlogHtml($.html());
    const rendered = compact(load(contentHtml, {}, false).text());
    const original = load(post.sourceHtml, {}, false);
    original('[id^="kiji_"],script,style').remove();
    original("p,h2,h3,h4,h5,h6,li,figcaption").each((_, e) => {
      const text = compact(original(e).text());
      if (text.length > 1 && !rendered.includes(text))
        throw Error(`Source text omitted: ${post.id}`);
    });
    if (load(contentHtml, {}, false)("script,object,embed").length)
      throw Error("Unsafe article HTML");
    return {
      ...post,
      contentHtml,
      heroImageUrl: assets[post.heroImageUrl]?.url || post.heroImageUrl,
    };
  });
  console.log(
    JSON.stringify({
      validated: prepared.length,
      photos: Object.keys(assets).length,
      missingPhotos: Object.keys(failures).length,
      earliest: manifest.earliest,
      latest: manifest.latest,
      mode: process.argv.includes("--write") ? "write" : "validate",
    }),
  );
  if (!process.argv.includes("--write")) return;
  if (!process.env.DATABASE_URL) throw Error("DATABASE_URL required");
  const sql = neon(process.env.DATABASE_URL);
  const baselinePath = join(dir, "existing-before-import.json");
  const existingQuery = () =>
    sql`SELECT slug,title,published,published_at,source_url,source_hash,md5(content_html) AS content_checksum,md5(source_html) AS source_checksum FROM blog_posts WHERE source_url IS NULL OR source_url NOT LIKE 'https://www.asahi.com/and/w/article/%' ORDER BY slug`;
  try {
    await readFile(baselinePath);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    await writeFile(baselinePath, JSON.stringify(await existingQuery()), {
      flag: "wx",
    });
  }
  try {
    await readFile(join(dir, "asahi-before-import.json"));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    const before =
      await sql`SELECT * FROM blog_posts WHERE source_url LIKE 'https://www.asahi.com/and/w/article/%'`;
    await writeFile(
      join(dir, "asahi-before-import.json"),
      JSON.stringify(before),
      { flag: "wx" },
    );
  }
  const collision =
    await sql`SELECT slug FROM blog_posts WHERE slug=ANY(${prepared.map((p) => p.slug)}) AND source_url IS DISTINCT FROM ('https://www.asahi.com/and/w/article/'||substring(slug from 15))`;
  if (collision.length) throw Error("Unrelated existing slug collision");
  let changed = 0;
  for (let offset = 0; offset < prepared.length;) {
    const batch: typeof prepared = [];
    let size = 0;
    while (offset < prepared.length && batch.length < 5) {
      const p = prepared[offset],
        bytes = Buffer.byteLength(JSON.stringify(p));
      if (batch.length && size + bytes > 180_000) break;
      batch.push(p);
      size += bytes;
      offset++;
    }
    const payload = batch.map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      hero_image_url: p.heroImageUrl,
      content_html: p.contentHtml,
      published_at: p.publishedAt,
      source_url: p.sourceUrl,
      author_name: p.authorName,
      category: p.category,
      source_html: p.sourceHtml,
      source_hash: p.sourceHash,
      original_date: p.originalDate,
    }));
    const rows =
      await sql`INSERT INTO blog_posts(slug,title,excerpt,hero_image_url,content_html,published,published_at,created_at,updated_at,source_url,author_name,category,source_html,source_hash,original_date)
      SELECT x.slug,x.title,x.excerpt,x.hero_image_url,x.content_html,TRUE,x.published_at,x.published_at,x.published_at,x.source_url,x.author_name,x.category,x.source_html,x.source_hash,x.original_date FROM jsonb_to_recordset(${JSON.stringify(payload)}::jsonb) AS x(slug text,title text,excerpt text,hero_image_url text,content_html text,published_at timestamptz,source_url text,author_name text,category text,source_html text,source_hash text,original_date text)
      ON CONFLICT(slug) DO UPDATE SET title=EXCLUDED.title,excerpt=EXCLUDED.excerpt,hero_image_url=EXCLUDED.hero_image_url,content_html=EXCLUDED.content_html,published=TRUE,published_at=EXCLUDED.published_at,source_url=EXCLUDED.source_url,author_name=EXCLUDED.author_name,category=EXCLUDED.category,source_html=EXCLUDED.source_html,source_hash=EXCLUDED.source_hash,original_date=EXCLUDED.original_date
      WHERE blog_posts.source_hash IS DISTINCT FROM EXCLUDED.source_hash OR blog_posts.content_html IS DISTINCT FROM EXCLUDED.content_html OR blog_posts.hero_image_url IS DISTINCT FROM EXCLUDED.hero_image_url OR blog_posts.published IS DISTINCT FROM TRUE
      RETURNING slug`;
    changed += rows.length;
    if (offset % 50 < 5 || offset === prepared.length)
      console.log(`Imported ${offset}/${prepared.length}`);
  }
  const actual =
    await sql`SELECT slug,title,published,published_at,source_url,source_hash,original_date,hero_image_url,author_name,category,md5(content_html) AS content_checksum,md5(source_html) AS source_checksum FROM blog_posts WHERE source_url LIKE 'https://www.asahi.com/and/w/article/%'`;
  if (actual.length !== prepared.length)
    throw Error("Imported database count differs");
  const bySlug = new Map(actual.map((p) => [p.slug, p]));
  for (const p of prepared) {
    const r = bySlug.get(p.slug);
    if (
      !r ||
      !r.published ||
      r.title !== p.title ||
      new Date(r.published_at).toISOString() !== p.publishedAt ||
      r.source_url !== p.sourceUrl ||
      r.source_hash !== p.sourceHash ||
      r.original_date !== p.originalDate ||
      r.hero_image_url !== p.heroImageUrl ||
      r.author_name !== p.authorName ||
      r.category !== p.category ||
      r.content_checksum !== checksum(p.contentHtml) ||
      r.source_checksum !== checksum(p.sourceHtml)
    )
      throw Error(`Database differs: ${p.slug}`);
  }
  const old = JSON.parse(await readFile(baselinePath, "utf8"));
  const current = await existingQuery();
  if (JSON.stringify(current) !== JSON.stringify(old))
    throw Error("Existing articles changed");
  const report = {
    verifiedAt: new Date().toISOString(),
    source: A.series,
    articles: prepared.length,
    changedRows: changed,
    originalDatesVerified: prepared.length,
    sourceBodiesVerified: prepared.length,
    renderedBodiesVerified: prepared.length,
    existingArticlesPreserved: current.length,
    earliest: manifest.earliest,
    latest: manifest.latest,
    mirroredPhotos: Object.keys(assets).length,
    mirroredBytes: Object.values(assets).reduce((n, a) => n + a.bytes, 0),
    unavailablePhotos: failures,
  };
  await writeFile(
    join(dir, "import-report.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify({
      ...report,
      unavailablePhotos: Object.keys(failures).length,
    }),
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
