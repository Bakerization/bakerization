import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { put, BlobPreconditionFailedError } from "@vercel/blob";
import { digest, type PublicationPost } from "./lib/ikeda-publications";
// Retry at the article migration layer; do not stack the SDK's ten exponential retries.
process.env.VERCEL_BLOB_RETRIES = "0";
const dir = resolve(
  process.env.IKEDA_PUBLICATIONS_CACHE_DIR || ".cache/other-sources",
);
type Asset = {
  url: string;
  bytes: number;
  sha256: string;
  contentType: string;
};
let assets: Record<string, Asset> = {},
  failures: Record<string, string> = {};
let processed = 0;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function copy(src: string) {
  if (assets[src] || !/^https?:/.test(src)) return;
  for (let attempt = 0; ; attempt++)
    try {
      const r = await fetch(src, {
        headers: {
          "User-Agent":
            "Bakerization-Authorized-Republication/1.0 (+https://www.bakerization.com)",
          Referer:
            new URL(src).hostname === "bunshun.ismcdn.jp"
              ? "https://bunshun.jp/"
              : new URL(src).origin + "/",
        },
        signal: AbortSignal.timeout(40_000),
      });
      if (!r.ok) {
        if ([403, 404, 410].includes(r.status)) {
          failures[src] = `HTTP ${r.status}`;
          return;
        }
        throw Error(`HTTP ${r.status}`);
      }
      const bytes = new Uint8Array(await r.arrayBuffer());
      if (!bytes.length || bytes.length > 20 * 1024 * 1024)
        throw Error("Unexpected image size");
      const prefix = Buffer.from(bytes.subarray(0, 12));
      const format =
        bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
          ? ["image/jpeg", "jpg"]
          : prefix
                .subarray(0, 8)
                .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
            ? ["image/png", "png"]
            : /^GIF8[79]a/.test(prefix.toString("ascii"))
              ? ["image/gif", "gif"]
              : prefix.toString("ascii", 0, 4) === "RIFF" &&
                  prefix.toString("ascii", 8, 12) === "WEBP"
                ? ["image/webp", "webp"]
                : prefix.toString("ascii", 4, 12) === "ftypavif"
                  ? ["image/avif", "avif"]
                  : null;
      if (!format)
        throw Error(`Not a supported image: ${r.headers.get("content-type")}`);
      const [contentType, ext] = format;
      const hash = digest(bytes),
        path = `blog-assets/ikeda-publications/${digest(src).slice(0, 20)}-${hash.slice(0, 20)}.${ext}`;
      try {
        await put(path, Buffer.from(bytes), {
          access: "private",
          token: process.env.BLOB_READ_WRITE_TOKEN,
          addRandomSuffix: false,
          allowOverwrite: false,
          contentType,
          abortSignal: AbortSignal.timeout(40_000),
        });
      } catch (e) {
        if (
          !(e instanceof BlobPreconditionFailedError) &&
          !(e instanceof Error && /already exists/i.test(e.message))
        )
          throw e;
      }
      assets[src] = {
        url: `/api/blob/${path}`,
        bytes: bytes.length,
        sha256: hash,
        contentType,
      };
      delete failures[src];
      return;
    } catch (e) {
      if (attempt >= 3) {
        failures[src] = String(e);
        return;
      }
      await wait(1000 * (attempt + 1));
    }
}
async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    throw Error("BLOB_READ_WRITE_TOKEN required");
  await mkdir(dir, { recursive: true });
  try {
    assets = JSON.parse(await readFile(join(dir, "assets.json"), "utf8"));
  } catch {}
  try {
    failures = JSON.parse(
      await readFile(join(dir, "asset-failures.json"), "utf8"),
    );
  } catch {}
  const scanned = new Set<string>(),
    seen = new Set(Object.keys(assets));
  while (true) {
    const files = (await readdir(join(dir, "posts"))).filter(
      (n) => /^ikeda-[a-z]+-\d+\.json$/.test(n) && !scanned.has(n),
    );
    const pending: string[] = [];
    for (const file of files) {
      const post: PublicationPost = JSON.parse(
        await readFile(join(dir, "posts", file), "utf8"),
      );
      for (const src of post.images)
        if (!seen.has(src)) {
          seen.add(src);
          pending.push(src);
        }
      scanned.add(file);
    }
    let cursor = 0;
    await Promise.all(
      Array.from({ length: 8 }, async () => {
        while (cursor < pending.length) {
          const src = pending[cursor++];
          await copy(src);
          processed++;
          if (processed % 20 === 0) {
            await writeFile(join(dir, "assets.json"), JSON.stringify(assets));
            await writeFile(
              join(dir, "asset-failures.json"),
              JSON.stringify(failures),
            );
            console.log(
              `Processed ${processed}; saved ${Object.keys(assets).length}; unavailable ${Object.keys(failures).length}`,
            );
          }
        }
      }),
    );
    await writeFile(join(dir, "assets.json"), JSON.stringify(assets));
    await writeFile(join(dir, "asset-failures.json"), JSON.stringify(failures));
    console.log(
      `Images ${Object.keys(assets).length}; unavailable ${Object.keys(failures).length}; articles ${scanned.size}`,
    );
    let complete = false;
    try {
      await readFile(join(dir, "manifest.json"));
      complete = true;
    } catch {}
    if (complete) {
      const remaining = (await readdir(join(dir, "posts"))).some(
        (n) => /^ikeda-[a-z]+-\d+\.json$/.test(n) && !scanned.has(n),
      );
      if (!remaining) break;
    }
    if (!process.argv.includes("--watch")) break;
    await wait(3000);
  }
  // A reparse can remove decorative assets. Report only current article references.
  try {
    const posts: PublicationPost[] = JSON.parse(
      await readFile(join(dir, "posts.json"), "utf8"),
    );
    const wanted = new Set(posts.flatMap((p) => p.images));
    assets = Object.fromEntries(
      Object.entries(assets).filter(([src]) => wanted.has(src)),
    );
    failures = Object.fromEntries(
      Object.entries(failures).filter(([src]) => wanted.has(src)),
    );
    await writeFile(join(dir, "assets.json"), JSON.stringify(assets));
    await writeFile(join(dir, "asset-failures.json"), JSON.stringify(failures));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  console.log(
    JSON.stringify({
      mirrored: Object.keys(assets).length,
      bytes: Object.values(assets).reduce((n, a) => n + a.bytes, 0),
      unavailable: Object.keys(failures).length,
    }),
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
