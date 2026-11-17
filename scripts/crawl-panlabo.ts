/** Download the complete public archive, honoring JUGEM's 10 second crawl delay. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { archivePageCount, decodePage, parseArchive, PANLABO_ORIGIN, type ArchivedPost } from "./lib/panlabo";

const cacheDir = resolve(process.env.PANLABO_CACHE_DIR || ".cache/panlabo");
const offline = process.argv.includes("--offline");
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lastFetch = 0;

async function getPage(key: string, url: string) {
  const path = join(cacheDir, `${key}.html`);
  try { return decodePage(await readFile(path)); } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  if (offline) throw new Error(`Missing cached page: ${key}`);
  for (let attempt = 0; attempt < 4; attempt++) {
    await delay(Math.max(0, 10_100 - (Date.now() - lastFetch)));
    lastFetch = Date.now();
    try {
      const response = await fetch(url, { headers: { "User-Agent": "Bakerization-Authorized-Archive-Migration/1.0 (+https://www.bakerization.com)" }, signal: AbortSignal.timeout(30_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status} at ${url}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      const html = decodePage(bytes);
      parseArchive(html, url); // Do not cache error or challenge pages as articles.
      await writeFile(path, bytes);
      return html;
    } catch (error) {
      if (attempt === 3) throw error;
      console.warn(`Retrying ${key}: ${String(error)}`);
    }
  }
  throw new Error(`Failed: ${url}`);
}

async function main() {
  await mkdir(cacheDir, { recursive: true });
  const first = await getPage("page-0", `${PANLABO_ORIGIN}/`);
  const pageCount = archivePageCount(first);
  const posts = new Map<number, ArchivedPost>();
  const pages: { page: number; count: number; ids: number[] }[] = [];
  for (let page = 0; page < pageCount; page++) {
    const url = `${PANLABO_ORIGIN}/?page=${page}`;
    const html = page === 0 ? first : await getPage(`page-${page}`, url);
    if (archivePageCount(html) !== pageCount) throw new Error("Source archive changed during crawl; rerun against a consistent snapshot");
    const entries = parseArchive(html, url);
    for (const entry of entries) {
      if (posts.has(entry.id)) throw new Error(`Duplicate source entry: ${entry.id}`);
      posts.set(entry.id, entry);
    }
    pages.push({ page, count: entries.length, ids: entries.map((entry) => entry.id) });
    await writeFile(join(cacheDir, "progress.json"), JSON.stringify({ pagesDone: page + 1, pageCount, articles: posts.size, updatedAt: new Date().toISOString() }, null, 2));
    if (page % 5 === 0 || page === pageCount - 1) console.log(`Archive ${page + 1}/${pageCount}: ${posts.size} articles`);
  }
  const continuations = [...posts.values()].filter((post) => post.needsContinuation);
  console.log(`Fetching ${continuations.length} full-text continuations`);
  for (const post of continuations) {
    const full = parseArchive(await getPage(`entry-${post.id}`, post.sourceUrl), post.sourceUrl);
    if (full.length !== 1 || full[0].id !== post.id || full[0].needsContinuation) throw new Error(`Incomplete continuation: ${post.id}`);
    posts.set(post.id, full[0]);
  }
  const sorted = [...posts.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || b.id - a.id);
  await writeFile(join(cacheDir, "posts.json"), JSON.stringify(sorted, null, 2));
  await writeFile(join(cacheDir, "manifest.json"), JSON.stringify({ source: PANLABO_ORIGIN, crawledAt: new Date().toISOString(), pageCount, articleCount: sorted.length, continuationCount: continuations.length, earliest: sorted.at(-1)?.publishedAt, latest: sorted[0]?.publishedAt, pages }, null, 2));
  console.log(`Complete: ${sorted.length} articles, ${sorted.at(-1)?.publishedAt} – ${sorted[0]?.publishedAt}`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
