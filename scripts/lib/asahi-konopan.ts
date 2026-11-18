import { createHash } from "node:crypto";
import { load } from "cheerio";
import { sanitizeBlogHtml } from "../../lib/blog-html";

export const ASAHI_KONOPAN = {
  origin: "https://www.asahi.com",
  series: "https://www.asahi.com/and/w/serialstory/konopan",
  category: "このパンがすごい！",
  publisher: "朝日新聞デジタルマガジン＆",
  author: "池田浩明",
  crawlIntervalMs: 1100,
  imageConcurrency: 12,
  requestTimeoutMs: 40_000,
  maxImageBytes: 20 * 1024 * 1024,
} as const;
export type AsahiListing = {
  id: number;
  url: string;
  title: string;
  day: string;
};
export type AsahiPost = {
  id: number;
  slug: string;
  title: string;
  sourceUrl: string;
  sourceHtml: string;
  contentHtml: string;
  sourceHash: string;
  publishedAt: string;
  originalDate: string;
  authorName: string;
  category: string;
  excerpt: string;
  heroImageUrl: string;
  bodyText: string;
  heroCaption: string;
  images: string[];
};
export const digest = (value: string | Uint8Array) =>
  createHash("sha256").update(value).digest("hex");
export const compact = (value: string) =>
  value.normalize("NFKC").replace(/\s+/g, "");
export function originalImage(
  src: string,
  base: string = ASAHI_KONOPAN.origin,
) {
  let url = new URL(src, base);
  if (
    url.hostname === "next-image.potaufeu.asahi.com" &&
    url.pathname === "/and/_next/image"
  ) {
    const original = url.searchParams.get("url");
    if (!original) throw Error("Image has no source");
    url = new URL(original, ASAHI_KONOPAN.origin);
  }
  if (!["http:", "https:"].includes(url.protocol))
    throw Error("Invalid image scheme");
  return url.href;
}
export function isAsahiImage(src: string) {
  const host = new URL(src).hostname;
  return (
    host === "asahi.com" ||
    host.endsWith(".asahi.com") ||
    host === "asahicom.jp" ||
    host.endsWith(".asahicom.jp")
  );
}
export function parseSeries(html: string) {
  const $ = load(html);
  if ($("h1").text().trim() !== ASAHI_KONOPAN.category)
    throw Error("Not the authorized series index");
  const section = $("main article").first().closest("section");
  const posts: AsahiListing[] = [];
  section.find("article").each((_, e) => {
    const card = $(e);
    const link = card
      .find('a[href*="/article/"]')
      .filter((_, a) =>
        /^\/and\/w\/article\/\d+$/.test($(a).attr("href") || ""),
      )
      .filter((_, a) => $(a).text().trim().length > 0)
      .first();
    const url = new URL(link.attr("href") || "", ASAHI_KONOPAN.origin);
    const id = Number(url.pathname.match(/\/(\d+)$/)?.[1]);
    const day = card
      .find("span")
      .map((_, s) => $(s).text().trim())
      .get()
      .find((s) => /^\d{4}\.\d{2}\.\d{2}$/.test(s));
    const title = link
      .text()
      .replace(/^＆[wM]\s*/, "")
      .trim();
    if (!id || !day || !title) throw Error("Incomplete series card");
    posts.push({ id, url: url.href, title, day });
  });
  if (!posts.length || new Set(posts.map((p) => p.id)).size !== posts.length)
    throw Error("Empty or duplicate series listing");
  const pages = $("a[href]")
    .map((_, e) =>
      Number(
        $(e)
          .attr("href")
          ?.match(/^\/and\/w\/serialstory\/konopan\/page\/(\d+)$/)?.[1] || 1,
      ),
    )
    .get();
  return { posts, lastPage: Math.max(1, ...pages) };
}
export function articleHash(
  post: Pick<
    AsahiPost,
    | "title"
    | "publishedAt"
    | "sourceHtml"
    | "authorName"
    | "heroImageUrl"
    | "heroCaption"
  >,
) {
  return digest(
    JSON.stringify({
      title: post.title,
      publishedAt: post.publishedAt,
      sourceHtml: post.sourceHtml,
      authorName: post.authorName,
      heroImageUrl: post.heroImageUrl,
      heroCaption: post.heroCaption,
    }),
  );
}
export function parseArticle(html: string, listing: AsahiListing): AsahiPost {
  const $ = load(html);
  const title = $("main h1").text().trim();
  if (!title || compact(title) !== compact(listing.title))
    throw Error(`Title mismatch: ${listing.id}`);
  const data = $('script[type="application/ld+json"]')
    .map((_, e) => JSON.parse($(e).text()))
    .get()
    .find((d) => d["@type"] === "Article");
  const body = $(".l-article-body");
  const author = $('main a[href*="/creators/"]')
    .filter((_, e) => $(e).text().trim().length > 0)
    .first();
  const authorName = author.text().trim() || ASAHI_KONOPAN.publisher;
  if (
    !data ||
    body.length !== 1 ||
    data.isAccessibleForFree === false ||
    /ここから先は有料|有料会員限定|続きをお読みいただくには/.test(body.text())
  )
    throw Error(`Incomplete or restricted article: ${listing.id}`);
  const canonical = new URL(data.url || data.mainEntityOfPage);
  if (
    canonical.origin !== ASAHI_KONOPAN.origin ||
    canonical.pathname !== `/and/w/article/${listing.id}`
  )
    throw Error(`Wrong article: ${listing.id}`);
  const publishedAt = new Date(data.datePublished).toISOString();
  const visibleDate = $("time#article-date").attr("datetime");
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(publishedAt))
    .replace(/-/g, ".");
  if (
    day !== listing.day ||
    !visibleDate ||
    new Date(visibleDate).toISOString() !== publishedAt
  )
    throw Error(`Changed publication date: ${listing.id}`);
  if (body.find('a[rel="next"], .page-links a').length)
    throw Error(`Unprocessed article continuation: ${listing.id}`);
  const sourceHtml = body.html()!;
  const bodyText = body.text();
  if (bodyText.trim().length < 120)
    throw Error(`Missing full text: ${listing.id}`);
  const hero = $("main img")
    .filter(
      (_, e) =>
        !$(e).closest(
          '.l-article-body,button,a[href*="/creators/"],[class*="rounded-full"]',
        ).length && !($(e).attr("src") || "").includes("ico_"),
    )
    .first();
  const heroImageUrl = originalImage(
    hero.attr("src") || data.image?.url || data.thumbnailUrl,
  );
  const heroCaption =
    hero.parent().parent().children("p").text().trim() ||
    hero.attr("alt") ||
    "";
  const fragment = load(sourceHtml, {}, false);
  fragment(
    'script,style,object,embed,[id^="kiji_"],img[src*="ico_end_paragraph.svg"],img[src*="ico_picture.svg"],img:not([src]),img[src=""]',
  ).remove();
  fragment("img[src]").each((_, e) => {
    fragment(e).attr(
      "src",
      originalImage(fragment(e).attr("src")!, listing.url),
    );
  });
  fragment("a[href]").each((_, e) => {
    const href = new URL(fragment(e).attr("href")!, listing.url);
    if (["http:", "https:", "mailto:", "tel:"].includes(href.protocol))
      fragment(e).attr("href", href.href);
    else fragment(e).removeAttr("href");
  });
  fragment("iframe").each((_, e) => {
    const url = new URL(fragment(e).attr("src") || "", listing.url);
    if (
      url.hostname === "www.google.com" &&
      url.pathname.startsWith("/maps/")
    ) {
      const link = fragment("<p><a>紹介店舗マップ</a></p>");
      link.find("a").attr("href", url.href);
      fragment(e).replaceWith(link);
    }
  });
  const cover = load(
    "<figure><img><figcaption></figcaption></figure><p></p>",
    {},
    false,
  );
  cover("img")
    .attr("src", heroImageUrl)
    .attr("alt", hero.attr("alt") || heroCaption);
  cover("figcaption").text(heroCaption);
  if (author.length) cover("p").text(`文：${authorName}`);
  else cover("p").remove();
  const contentHtml = sanitizeBlogHtml(cover.html() + fragment.html());
  const content = load(contentHtml, {}, false);
  const images = [
    ...new Set(
      content("img[src]")
        .map((_, e) => content(e).attr("src")!)
        .get(),
    ),
  ];
  const result = {
    id: listing.id,
    slug: `asahi-konopan-${listing.id}`,
    title,
    sourceUrl: canonical.href,
    sourceHtml,
    contentHtml,
    publishedAt,
    originalDate: listing.day,
    authorName,
    category: ASAHI_KONOPAN.category,
    excerpt: String(data.description || bodyText.replace(/\s+/g, " ")).slice(
      0,
      180,
    ),
    heroImageUrl,
    heroCaption,
    bodyText,
    images,
    sourceHash: "",
  };
  result.sourceHash = articleHash(result);
  return result;
}
