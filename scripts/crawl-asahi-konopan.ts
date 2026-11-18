import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import {
  ASAHI_KONOPAN as A,
  parseSeries,
  parseArticle,
  type AsahiPost,
} from "./lib/asahi-konopan";
const dir = resolve(process.env.ASAHI_CACHE_DIR || ".cache/asahi");
let lastFetch = 0;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function page(key: string, url: string) {
  const path = join(dir, key + ".html");
  try {
    return await readFile(path, "utf8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  if (process.argv.includes("--offline"))
    throw Error(`Missing cached source: ${key}`);
  for (let attempt = 0; ; attempt++) {
    await delay(Math.max(0, A.crawlIntervalMs - (Date.now() - lastFetch)));
    lastFetch = Date.now();
    try {
      const r = await fetch(url, {
        headers: {
          "User-Agent":
            "Bakerization-Authorized-Republication/1.0 (+https://www.bakerization.com)",
        },
        signal: AbortSignal.timeout(A.requestTimeoutMs),
      });
      if (!r.ok) throw Error(`HTTP ${r.status}: ${url}`);
      if (new URL(r.url).origin !== A.origin)
        throw Error("Unexpected publisher redirect");
      const html = await r.text();
      if (!html.includes("<main") || !html.includes("このパンがすごい"))
        throw Error("Not a series page");
      await writeFile(path, html);
      return html;
    } catch (e) {
      if (attempt >= 3) throw e;
      await delay(1500 * (attempt + 1));
    }
  }
}
async function main() {
  await mkdir(dir, { recursive: true });
  const first = parseSeries(await page("series", A.series));
  const listed = first.posts.map((p) => ({ ...p, page: 1 }));
  const pages = [
    { page: 1, count: first.posts.length, ids: first.posts.map((p) => p.id) },
  ];
  for (let n = 2; n <= first.lastPage; n++) {
    const parsed = parseSeries(
      await page(`page-${n}`, `${A.series}/page/${n}`),
    );
    pages.push({
      page: n,
      count: parsed.posts.length,
      ids: parsed.posts.map((p) => p.id),
    });
    listed.push(...parsed.posts.map((p) => ({ ...p, page: n })));
  }
  if (new Set(listed.map((p) => p.id)).size !== listed.length)
    throw Error("Duplicate article across source pages");
  await writeFile(
    join(dir, "listing.json"),
    JSON.stringify(
      {
        series: A.series,
        pageCount: first.lastPage,
        articleCount: listed.length,
        pages,
        articles: listed,
      },
      null,
      2,
    ),
  );
  console.log(`Found ${listed.length} articles in ${first.lastPage} pages`);
  const posts: AsahiPost[] = [];
  for (const listing of listed) {
    const post = parseArticle(
      await page(`article-${listing.id}`, listing.url),
      listing,
    );
    posts.push(post);
    await writeFile(join(dir, `${post.slug}.json`), JSON.stringify(post));
    await writeFile(
      join(dir, "progress.json"),
      JSON.stringify({
        total: listed.length,
        parsed: posts.length,
        last: post.id,
        at: new Date().toISOString(),
      }),
    );
    if (posts.length % 20 === 0 || posts.length === listed.length)
      console.log(`Parsed ${posts.length}/${listed.length}`);
  }
  posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  await writeFile(join(dir, "posts.json"), JSON.stringify(posts));
  const manifest = {
    source: A.series,
    crawledAt: new Date().toISOString(),
    pageCount: first.lastPage,
    articleCount: posts.length,
    pages,
    earliest: posts.at(-1)?.publishedAt,
    latest: posts[0].publishedAt,
    images: new Set(posts.flatMap((p) => p.images)).size,
  };
  await writeFile(
    join(dir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  console.log(JSON.stringify(manifest));
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
