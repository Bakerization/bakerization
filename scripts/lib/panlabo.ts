import { load } from "cheerio";
import { createHash } from "node:crypto";
import { BLOG_VIDEO_HOSTS, sanitizeBlogHtml } from "../../lib/blog-html";

export const PANLABO_ORIGIN = "https://panlabo.jugem.jp";
export type ArchivedPost = {
  id: number;
  slug: string;
  title: string;
  publishedAt: string;
  originalDate: string;
  sourceUrl: string;
  authorName: string;
  category: string;
  excerpt: string;
  heroImageUrl: string;
  contentHtml: string;
  sourceHtml: string;
  sourceHash: string;
  needsContinuation: boolean;
};

export function decodePage(bytes: Uint8Array) {
  return new TextDecoder("euc-jp").decode(bytes);
}

export function archivePageCount(html: string) {
  const $ = load(html);
  const match = $(".entry_navi").text().match(/\b\d+\s*\/\s*(\d+)\b/);
  if (!match) throw new Error("Archive page count not found");
  return Number(match[1]);
}

function absoluteSourceUrl(value: string, base: string) {
  const url = new URL(value, base);
  if (["panlabo.jugem.jp", "img-cdn.jg.jugem.jp", "img.jugem.jp", "www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"].includes(url.hostname)) url.protocol = "https:";
  return url.href;
}

export function parseArchive(html: string, pageUrl: string): ArchivedPost[] {
  const $ = load(html);
  const posts: ArchivedPost[] = [];
  $(".entry").each((_, node) => {
    const entry = $(node);
    const title = entry.children(".entry_title").text().trim();
    const originalDate = entry.children(".entry_date").text().trim();
    const match = originalDate.match(/^(\d{4})\.(\d{2})\.(\d{2})\s+\w+\s+(\d{2}):(\d{2})$/);
    if (!match) throw new Error(`Unrecognized source date: ${originalDate}`);
    const [, year, month, day, hour, minute] = match;
    const publishedAt = new Date(`${year}-${month}-${day}T${hour}:${minute}:00+09:00`).toISOString();
    const link = entry.find('.entry_state a[href*="eid="]').first().attr("href");
    const id = link ? Number(new URL(link, pageUrl).searchParams.get("eid")) : NaN;
    if (!Number.isSafeInteger(id) || id < 1 || !title) throw new Error(`Invalid entry at ${pageUrl}`);
    const sourceUrl = `${PANLABO_ORIGIN}/?eid=${id}`;
    const body = entry.children(".entry_body").clone();
    body.find(".service_button, #fb-root, .fb-like, script, style").remove();
    const more = entry.children(".entry_more").clone();
    const needsContinuation = more.find('a[href*="eid="]').length > 0;
    if (!needsContinuation && (more.text().trim() || more.find("img, iframe, object, embed").length)) body.append(more.html() || "");
    const sourceHtml = body.html() || "";
    const fragment = load(sourceHtml, {}, false);
    fragment("h1").each((_, element) => {
      const heading = fragment(element);
      if (heading.text().length > 300 && heading.find("br").length > 3) heading.replaceWith(`<div>${heading.html()}</div>`);
    });
    // Preserve the movie when JUGEM used the old, now unsupported Flash player.
    fragment("object, embed").each((_, element) => {
      if (!element.parent) return;
      const item = fragment(element);
      const src = item.attr("src") || item.find('param[name="movie"]').attr("value") || item.find("embed[src]").attr("src");
      if (!src) return;
      try {
        const url = new URL(src, sourceUrl);
        const video = url.hostname === "www.youtube.com" && url.pathname.match(/^\/v\/([\w-]{11})$/);
        if (video) item.replaceWith(fragment("<iframe></iframe>").attr({ src: `https://www.youtube.com/embed/${video[1]}`, title: "YouTube video player", allowfullscreen: "" }));
        else if (["http:", "https:"].includes(url.protocol)) item.replaceWith(fragment("<a></a>").attr("href", url.href).text("動画を元のサイトで見る"));
      } catch {}
    });
    fragment("a[href], img[src], iframe[src]").each((_, element) => {
      const attr = element.tagName === "a" ? "href" : "src";
      const value = fragment(element).attr(attr);
      if (!value) return;
      try { fragment(element).attr(attr, absoluteSourceUrl(value, sourceUrl)); }
      catch { fragment(element).removeAttr(attr); }
    });
    fragment("iframe[src]").each((_, element) => {
      const item = fragment(element);
      const url = new URL(item.attr("src")!);
      if (!BLOG_VIDEO_HOSTS.includes(url.hostname) && ["http:", "https:"].includes(url.protocol)) item.replaceWith(fragment("<a></a>").attr("href", url.href).text("埋め込みコンテンツを元のサイトで見る"));
    });
    const contentHtml = sanitizeBlogHtml(fragment.html());
    const clean = load(contentHtml, {}, false);
    const text = clean.text().replace(/\s+/g, " ").trim();
    if (!text && !clean("img, iframe").length) throw new Error(`Empty entry: ${sourceUrl}`);
    posts.push({
      id, slug: `panlabo-${id}`, title, publishedAt, originalDate, sourceUrl,
      // This is a collective archive; retain individual signatures in the text.
      authorName: "パンラボ",
      category: entry.find('.entry_state a[href*="cid="]').first().text().trim(),
      excerpt: text.slice(0, 160),
      heroImageUrl: clean("img[src]").first().attr("src") || "",
      contentHtml, sourceHtml,
      sourceHash: createHash("sha256").update(JSON.stringify({ title, publishedAt, sourceHtml })).digest("hex"),
      needsContinuation,
    });
  });
  if (!posts.length) throw new Error(`No entries at ${pageUrl}`);
  return posts;
}
