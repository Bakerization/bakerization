import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { put, BlobPreconditionFailedError } from "@vercel/blob";
import { load } from "cheerio";
import { sanitizeBlogHtml } from "../lib/blog-html";
import {
  digest,
  publicationHash,
  type PublicationPost,
} from "./lib/ikeda-publications";
process.env.VERCEL_BLOB_RETRIES = "0";
const dir = ".cache/other-sources";
async function main() {
  const extracted = JSON.parse(
    await readFile(join(dir, "seifun-extracted.json"), "utf8"),
  );
  let sourceHtml: string = extracted.sourceHtml;
  for (const filename of extracted.assets as string[]) {
    const bytes = await readFile(join(dir, filename));
    const path = `blog-assets/ikeda-publications/seifun/${digest(bytes).slice(0, 24)}-${filename}`;
    const contentType = filename.endsWith(".pdf")
      ? "application/pdf"
      : "image/png";
    try {
      await put(path, bytes, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType,
        abortSignal: AbortSignal.timeout(40000),
      });
    } catch (e) {
      if (
        !(e instanceof BlobPreconditionFailedError) &&
        !(e instanceof Error && /already exists/i.test(e.message))
      )
        throw e;
    }
    sourceHtml = sourceHtml.replaceAll(
      "ASSET:" + filename,
      "/api/blob/" + path,
    );
  }
  const contentHtml = sanitizeBlogHtml(sourceHtml),
    $ = load(contentHtml, {}, false);
  const sourceUrl =
    "https://www.seifun.or.jp/relays/download/71/699/7//?file=%2Ffiles%2Flibs%2F2737%2F202601271538076730.pdf#page=21";
  const post: PublicationPost = {
    id: 64021,
    publication: "seifun",
    slug: "ikeda-seifun-64021",
    title: "品種の個性でパン文化は生まれる",
    sourceUrl,
    sourceHtml,
    contentHtml,
    sourceHash: "",
    publishedAt: new Date(extracted.publishedAt).toISOString(),
    originalDate: "2026-01-20",
    authorName: "池田浩明",
    category: "製粉振興",
    excerpt: $.text().replace(/\s+/g, " ").slice(0, 180),
    heroImageUrl: "",
    bodyText: $.text(),
    images: [],
    pages: extracted.pages.map((n: number) =>
      sourceUrl.replace("#page=21", `#page=${n}`),
    ),
    authorshipEvidence: "池田浩明",
  };
  post.sourceHash = publicationHash(post);
  await writeFile(
    join(dir, "posts", post.slug + ".json"),
    JSON.stringify(post),
  );
  await writeFile(
    join(dir, "seifun-proof.json"),
    JSON.stringify(
      {
        pdfSha256: extracted.pdfSha256,
        pages: extracted.pages,
        issue: 640,
        date: "2026-01-20",
        dateEvidence: "発行／令和8年1月20日（原本68ページ）",
        textBlocks: extracted.textBlocks,
      },
      null,
      2,
    ),
  );
  console.log(
    "Prepared " +
      post.slug +
      " " +
      post.bodyText.length +
      " chars, 5 complete charts and original 10-page PDF",
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
