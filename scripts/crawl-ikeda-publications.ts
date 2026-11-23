import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { load } from "cheerio";
import {
  PUBLICATIONS,
  articleLinks,
  continuationPages,
  parsePublication,
  digest,
  type Publication,
  type PublicationPost,
} from "./lib/ikeda-publications";
const dir = resolve(
  process.env.IKEDA_PUBLICATIONS_CACHE_DIR || ".cache/other-sources",
);
const offline = process.argv.includes("--offline"),
  wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function page(url: string) {
  const file = join(dir, "pages", digest(url) + ".html");
  try {
    return await readFile(file, "utf8");
  } catch {}
  if (offline) throw Error("Missing cached page: " + url);
  for (let n = 0; ; n++) {
    try {
      const r = await fetch(url, {
        headers: {
          "User-Agent":
            "Bakerization-Authorized-Republication/1.0 (+https://www.bakerization.com)",
        },
        signal: AbortSignal.timeout(40000),
      });
      if (!r.ok) throw Error("HTTP " + r.status);
      const h = await r.text();
      await writeFile(file, h);
      await wait(1100);
      return h;
    } catch (e) {
      if (n >= 3) throw e;
      await wait(1500 * (n + 1));
    }
  }
}
async function main() {
  await mkdir(join(dir, "pages"), { recursive: true });
  await mkdir(join(dir, "posts"), { recursive: true });
  const listings: Record<string, string[]> = {},
    posts: PublicationPost[] = [],
    excluded: { url: string; publication: string; reason: string }[] = [];
  const queue = Object.keys(PUBLICATIONS) as Publication[];
  let cursor = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (cursor < queue.length) {
        const key = queue[cursor++],
          pub = PUBLICATIONS[key];
        const index = await page(pub.index);
        if (!/池田|HIROAKI IKEDA/i.test(load(index)("body").text()))
          throw Error("Wrong author index");
        let urls =
          key === "kurashi" ? [pub.index] : articleLinks(index, key, pub.index);
        if (key === "hanako") {
          const next = "https://hanako.tokyo/tags/bakery/";
          urls.push(...articleLinks(await page(next), key, next));
          urls.push("https://hanako.tokyo/food/71216/");
        }
        if (key === "kurashi") {
          const x = load(index);
          x(".sentence a[href]")
            .filter((_, e) => /その２/.test(x(e).text()))
            .each((_, e) => {
              urls.push(new URL(x(e).attr("href")!, pub.index).href);
            });
        }
        urls = [...new Set(urls)];
        if (!urls.length) throw Error("Empty author listing: " + key);
        listings[key] = urls;
        console.log(key + " discovered " + urls.length);
        for (const url of urls) {
          try {
            const html = await page(url),
              numbers = continuationPages(html, url);
            if (numbers.length && numbers.some((n, i) => n !== i + 2))
              throw Error("Non-contiguous pages");
            if (numbers.length > 30) throw Error("Too many pages");
            const pages = [{ url, html }];
            for (const n of numbers) {
              const u = new URL(url);
              u.searchParams.set("page", String(n));
              pages.push({ url: u.href, html: await page(u.href) });
            }
            for (const page of pages)
              if (
                continuationPages(page.html, url).some(
                  (n) => !numbers.includes(n),
                )
              )
                throw Error("Unfetched continuation");
            const p = parsePublication(pages, key);
            posts.push(p);
            await writeFile(
              join(dir, "posts", p.slug + ".json"),
              JSON.stringify(p),
            );
            console.log(
              p.slug +
                " " +
                p.originalDate +
                " " +
                p.bodyText.length +
                " chars " +
                pages.length +
                " pages",
            );
          } catch (e) {
            excluded.push({ url, publication: key, reason: String(e) });
            console.log("REVIEW " + url + " " + e);
          }
        }
      }
    }),
  );
  try {
    const pdf: PublicationPost = JSON.parse(
      await readFile(join(dir, "posts", "ikeda-seifun-64021.json"), "utf8"),
    );
    posts.push(pdf);
    listings.seifun = [pdf.sourceUrl];
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
  posts.sort((a, b) => a.sourceUrl.localeCompare(b.sourceUrl));
  if (
    new Set(posts.map((p) => p.slug)).size !== posts.length ||
    new Set(posts.map((p) => p.sourceUrl)).size !== posts.length
  )
    throw Error("Duplicate articles");
  await writeFile(join(dir, "posts.json"), JSON.stringify(posts));
  await writeFile(
    join(dir, "manifest.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        articleCount: posts.length,
        listings,
        excluded,
        counts: Object.fromEntries(
          [...queue, "seifun"].map((k) => [
            k,
            posts.filter((p) => p.publication === k).length,
          ]),
        ),
        earliest: posts.map((p) => p.originalDate).sort()[0],
        latest: posts
          .map((p) => p.originalDate)
          .sort()
          .at(-1),
      },
      null,
      2,
    ),
  );
  console.log("Completed " + posts.length + "; review " + excluded.length);
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
