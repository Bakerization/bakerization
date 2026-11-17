/** Resumable, low-concurrency copy of JUGEM article photos into our own Blob store. */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import { put, BlobPreconditionFailedError } from "@vercel/blob";
import { parseArchive, decodePage, PANLABO_ORIGIN } from "./lib/panlabo";

type Asset = { url: string; bytes: number; sha256: string; contentType: string };
const cacheDir = resolve(process.env.PANLABO_CACHE_DIR || ".cache/panlabo");
const mapPath = join(cacheDir, "assets.json");
const failedPath = join(cacheDir, "asset-failures.json");
const watch = process.argv.includes("--watch");
const dryRun = process.argv.includes("--dry-run");
const concurrency = Math.max(1, Math.min(12, Number(process.env.PANLABO_IMAGE_CONCURRENCY) || 8));
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const sha256 = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");
let assets: Record<string, Asset> = {};
let failures: Record<string, string> = {};
let written = 0;
let stopping = false;
process.on("SIGINT", () => { stopping = true; });
process.on("SIGTERM", () => { stopping = true; });

async function copyImage(src: string) {
  if (assets[src]) return;
  // Only copy this archive's own CDN photos. Third-party embeds stay at source.
  const url = new URL(src);
  if (!["img-cdn.jg.jugem.jp", "img.jugem.jp"].includes(url.hostname)) return;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(src, { redirect: "error", signal: AbortSignal.timeout(30_000) });
      if (!res.ok) {
        if ([403, 404, 410].includes(res.status)) { failures[src] = `HTTP ${res.status}`; return; }
        throw new Error(`HTTP ${res.status}`);
      }
      const contentType = (res.headers.get("content-type") || "").split(";")[0];
      const ext = ({ "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp" } as Record<string, string>)[contentType];
      if (!ext) throw new Error(`Unexpected media type ${contentType}`);
      const bytes = new Uint8Array(await res.arrayBuffer());
      if (!bytes.length || bytes.length > 20 * 1024 * 1024) throw new Error("Unexpected image size");
      const hash = sha256(bytes);
      const pathname = `blog-assets/panlabo/${sha256(src).slice(0, 20)}-${hash.slice(0, 20)}.${ext}`;
      if (!dryRun) {
        try { await put(pathname, Buffer.from(bytes), { access: "private", token: process.env.BLOB_READ_WRITE_TOKEN, addRandomSuffix: false, allowOverwrite: false, contentType }); }
        catch (error) { if (!(error instanceof BlobPreconditionFailedError) && !(error instanceof Error && /already exists/i.test(error.message))) throw error; }
        assets[src] = { url: `/api/blob/${pathname}`, bytes: bytes.length, sha256: hash, contentType };
        delete failures[src];
        written++;
        if (written % 25 === 0) {
          await writeFile(mapPath, JSON.stringify(assets, null, 2));
          console.log(`Photos saved: ${Object.keys(assets).length}; unavailable: ${Object.keys(failures).length}`);
        }
      }
      return;
    } catch (error) {
      if (attempt === 2) { failures[src] = String(error); return; }
      await delay(1000 * (attempt + 1));
    }
  }
}

async function main() {
  if (!dryRun && !process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is required");
  await mkdir(cacheDir, { recursive: true });
  try { assets = JSON.parse(await readFile(mapPath, "utf8")); } catch {}
  try { failures = JSON.parse(await readFile(failedPath, "utf8")); } catch {}
  const scanned = new Set<string>();
  const seen = new Set(Object.keys(assets));
  while (true) {
    const files = (await readdir(cacheDir)).filter((name) => /^(page|entry)-\d+\.html$/.test(name) && !scanned.has(name));
    const pending: string[] = [];
    for (const name of files) {
      const posts = parseArchive(decodePage(await readFile(join(cacheDir, name))), `${PANLABO_ORIGIN}/`);
      for (const post of posts) {
        const $ = load(post.contentHtml);
        $("img[src]").each((_, e) => {
          const src = $(e).attr("src")!;
          if (!seen.has(src)) { seen.add(src); pending.push(src); }
        });
      }
      scanned.add(name);
    }
    let index = 0;
    await Promise.all(Array.from({ length: concurrency }, async () => {
      while (index < pending.length && !stopping) await copyImage(pending[index++]);
    }));
    await writeFile(mapPath, JSON.stringify(assets, null, 2));
    await writeFile(failedPath, JSON.stringify(failures, null, 2));
    if (!watch || stopping) break;
    // Once the complete text manifest exists, scan once more to pick up continuations.
    let complete = false;
    try { await readFile(join(cacheDir, "manifest.json")); complete = true; } catch {}
    if (complete) {
      const remaining = (await readdir(cacheDir)).some((name) => /^(page|entry)-\d+\.html$/.test(name) && !scanned.has(name));
      if (!remaining) break;
    }
    await delay(5000);
  }
  const bytes = Object.values(assets).reduce((sum, asset) => sum + asset.bytes, 0);
  console.log(JSON.stringify({ mirrored: Object.keys(assets).length, bytes, unavailable: Object.keys(failures).length }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
