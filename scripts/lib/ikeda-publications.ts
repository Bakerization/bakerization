import { createHash } from "node:crypto";
import { load } from "cheerio";
import { IKEDA_PUBLICATIONS } from "../../lib/ikeda-sources";
import { sanitizeBlogHtml } from "../../lib/blog-html";

export const PUBLICATIONS = {
  bunshun: {
    name: IKEDA_PUBLICATIONS.bunshun.label,
    index: "https://bunshun.jp/list/author/58835fb077656111fd030000",
    links: ".list-thumb.author h2 a",
    body: ".article-body",
  },
  php: {
    name: IKEDA_PUBLICATIONS.php.label,
    index: "https://shuchi.php.co.jp/author/1481",
    links: ".related_article_list_02 a",
    body: ".article_text",
  },
  fujinkoron: {
    name: IKEDA_PUBLICATIONS.fujinkoron.label,
    index:
      "https://fujinkoron.jp/list/author/%E6%B1%A0%E7%94%B0%E6%B5%A9%E6%98%8E",
    links: ".author-articles a",
    body: ".article-body",
  },
  italianity: {
    name: IKEDA_PUBLICATIONS.italianity.label,
    index: "https://italianity.jp/author/31",
    links: ".post-card a",
    body: ".post-item-main-content",
  },
  ippin: {
    name: IKEDA_PUBLICATIONS.ippin.label,
    index: "https://ippin.gnavi.co.jp/curator/ikedahiroaki/",
    links: ".article-list > .list__item > a",
    body: ".entry-section",
  },
  andpremium: {
    name: IKEDA_PUBLICATIONS.andpremium.label,
    index: "https://andpremium.jp/selector/hiroaki-ikeda/",
    links: "main .ul-grid a",
    body: ".content-wrap > .the_content > .block:not(section)",
  },
  rtsushin: {
    name: IKEDA_PUBLICATIONS.rtsushin.label,
    index: "https://www.r-tsushin.com/news/rtag/hiroaki_ikeda/",
    links: "a[href*='/people/innovator/hiroaki_ikeda_']",
    body: ".single-content-wrap .left > .diction",
  },
  hanako: {
    name: IKEDA_PUBLICATIONS.hanako.label,
    index: "https://hanako.tokyo/tags/bakery-connecting-people/",
    links: "section.category > ul.ul-grid a",
    body: ".the-content",
  },
  kurashi: {
    name: IKEDA_PUBLICATIONS.kurashi.label,
    index: "https://kurashi-to-oshare.jp/food/81069/",
    links: "",
    body: ".sentence",
  },
  viewtabi: {
    name: IKEDA_PUBLICATIONS.viewtabi.label,
    index: "https://www.viewtabi.jp/writer/hiloaki_ikeda",
    links: ".articles article a",
    body: ".layout_article > .cmp-container",
  },
  elle: {
    name: IKEDA_PUBLICATIONS.elle.label,
    index: "https://www.elle.com/jp/author/418205/ikedahiloaki/",
    links: "a[href*='/gourmet/gourmet-restaurants-events/g']",
    body: ".listicle-intro, .listicle-slides",
  },
} as const;
export type Publication = keyof typeof PUBLICATIONS;
export type PublicationPost = {
  id: number;
  publication: keyof typeof IKEDA_PUBLICATIONS;
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
  images: string[];
  pages: string[];
  authorshipEvidence: string;
};
export const digest = (s: string | Uint8Array) =>
  createHash("sha256").update(s).digest("hex");
export const compact = (s: string) => s.normalize("NFKC").replace(/\s+/g, "");
export function publicationHash(
  p: Pick<
    PublicationPost,
    | "title"
    | "sourceUrl"
    | "sourceHtml"
    | "authorName"
    | "publishedAt"
    | "heroImageUrl"
  >,
) {
  return digest(
    JSON.stringify([
      p.title,
      p.sourceUrl,
      p.sourceHtml,
      p.authorName,
      p.publishedAt,
      p.heroImageUrl,
    ]),
  );
}
export function jsonArticles(html: string): Record<string, any>[] {
  const $ = load(html);
  const out: Record<string, any>[] = [];
  function walk(x: any) {
    if (!x || typeof x !== "object") return;
    if (Array.isArray(x)) return x.forEach(walk);
    if (["Article", "NewsArticle", "BlogPosting"].includes(x["@type"]))
      out.push(x);
    if (x["@graph"]) walk(x["@graph"]);
  }
  $('script[type="application/ld+json"]').each((_, e) => {
    try {
      walk(JSON.parse($(e).text()));
    } catch {}
  });
  return out;
}
export function articleLinks(html: string, key: Publication, indexUrl: string) {
  const $ = load(html);
  return [
    ...new Set(
      $(PUBLICATIONS[key].links)
        .map((_, e) => {
          const href = $(e).attr("href");
          if (!href) return "";
          const u = new URL(href, indexUrl);
          u.hash = "";
          if (key === "rtsushin") u.hostname = "r-tsushin.com";
          const valid =
            key === "elle"
              ? /^\/jp\/gourmet\/gourmet-restaurants-events\/g\d+\//.test(
                  u.pathname,
                )
              : key === "italianity"
                ? /^\/lifestyle\/food\//.test(u.pathname)
                : key === "andpremium"
                  ? /^\/column\/eyes\/hiroaki-ikeda-\d+\/$/.test(u.pathname)
                  : key === "rtsushin"
                    ? /^\/people\/innovator\/hiroaki_ikeda_\d+\/$/.test(
                        u.pathname,
                      )
                    : key === "hanako"
                      ? /^\/(?:food|learn)\/\d+\/$/.test(u.pathname)
                      : key === "ippin"
                        ? /^\/article-\d+\/$/.test(u.pathname)
                        : /\/articles?\/(?:-\/)?\d+\/?$/.test(u.pathname);
          return valid &&
            u.hostname.replace(/^www\./, "") ===
              new URL(indexUrl).hostname.replace(/^www\./, "")
            ? u.href
            : "";
        })
        .get()
        .filter(Boolean),
    ),
  ];
}
export function continuationPages(html: string, source: string) {
  const $ = load(html),
    base = new URL(source);
  return [
    ...new Set(
      $("a[href]")
        .map((_, e) => {
          const u = new URL($(e).attr("href")!, base);
          const n = u.searchParams.get("page");
          return u.origin === base.origin &&
            u.pathname === base.pathname &&
            /^\d+$/.test(n || "") &&
            Number(n) > 1
            ? Number(n)
            : 0;
        })
        .get()
        .filter(Boolean),
    ),
  ].sort((a, b) => a - b);
}
export function parsePublication(
  pages: { url: string; html: string }[],
  key: Publication,
): PublicationPost {
  const first = pages[0],
    $ = load(first.html),
    pub = PUBLICATIONS[key],
    data = jsonArticles(first.html)[0];
  const sourceUrl = new URL(
    $('link[rel="canonical"]').attr("href") || first.url,
    first.url,
  );
  sourceUrl.search = "";
  sourceUrl.hash = "";
  if (key === "rtsushin") sourceUrl.hostname = "r-tsushin.com";
  if (
    decodeURIComponent(sourceUrl.pathname).toLowerCase() !==
      decodeURIComponent(new URL(first.url).pathname).toLowerCase() ||
    sourceUrl.hostname.replace(/^www\./, "") !==
      new URL(first.url).hostname.replace(/^www\./, "")
  )
    throw Error("Wrong canonical");
  let title = $("h1").first().text().trim(),
    authorName = "池田浩明",
    proof = "",
    day = "",
    date = data?.datePublished || "";
  const clone = $.root().clone();
  clone.find("script,style").remove();
  const plain = clone.text();
  if (key === "bunshun" || key === "fujinkoron" || key === "php") {
    const authors = JSON.stringify(data?.author || {});
    if (!/池田\s*浩明|58835fb077656111fd030000|author\/1481/.test(authors))
      throw Error("No verified author");
    proof = key === "php" ? "池田浩明・瑞穂日和著『パンビジネス』" : "池田浩明";
    if (key === "php") {
      if (!plain.includes("瑞穂日和")) throw Error("Coauthor missing");
      authorName = "池田浩明・瑞穂日和";
    }
  } else if (key === "italianity") {
    title = $(".post-item-main-title").first().text().trim();
    proof = $('.post-item-main-details a[href*="/author/31"]').text().trim();
    if (!proof.includes("池田浩明")) throw Error("No verified author");
    const initial = $(".post-item-main-content")
      .text()
      .match(/初出[：:]この記事は(\d{4})年(\d{1,2})月(\d{1,2})日/);
    if (initial)
      day = `${initial[1]}-${initial[2].padStart(2, "0")}-${initial[3].padStart(2, "0")}`;
  } else if (key === "ippin") {
    proof = $(".detail-curator .curator-name").text().trim();
    if (proof !== "池田浩明") throw Error("No verified author");
    day =
      $(".social--date")
        .first()
        .text()
        .match(/\d{4}\/\d{2}\/\d{2}/)?.[0]
        .replaceAll("/", "-") || "";
  } else if (key === "andpremium") {
    const h = $("h1").clone();
    h.find("span").remove();
    title = h.text().trim();
    proof = $("h1 i").text().trim();
    if (!proof.includes("写真と文：池田浩明"))
      throw Error("No verified author");
    const en = $("h1 .subtitle").text().trim();
    date = new Date(en + " 00:00:00 GMT+0900").toISOString();
  } else if (key === "rtsushin") {
    proof = $(".textcap p")
      .filter((_, e) => /text by Hiroaki Ikeda/i.test($(e).text()))
      .first()
      .text()
      .trim();
    if (
      !proof &&
      $(".lead-series-name").text().includes("池田浩明") &&
      $(".diction").text().includes("池田浩明（いけだ・ひろあき）")
    )
      proof = "池田浩明";
    if (!proof) throw Error("No verified author");
    day =
      $("h1")
        .parent()
        .parent()
        .text()
        .match(/\d{4}\.\d{2}\.\d{2}/)?.[0]
        .replaceAll(".", "-") || "";
  } else if (key === "hanako") {
    proof =
      $(".the-content")
        .text()
        .match(/(?:text|Text)\s*[:：=＝]\s*Hiroaki\s+Ikeda/i)?.[0] || "";
    if (
      !proof &&
      $(".post-header").text().includes("池田浩明") &&
      /池田浩明.*パンラボ/.test($(".the-content").text().replace(/\s+/g, ""))
    )
      proof = "池田浩明";
    if (!proof) throw Error("No verified author");
    // Do not treat editor-compiled recommendation lists as Ikeda's sole work.
    const credits = [
      ...$(".the-content")
        .text()
        .matchAll(/text\s*[:：=＝]\s*([A-Za-z]+(?:[ \t]+[A-Za-z]+)?)/gi),
    ].map((m) => m[1]);
    if (credits.some((c) => !/^Hiroaki\s+Ikeda$/i.test(c)))
      throw Error("Other author credit");
    day =
      $(".post-header")
        .text()
        .match(/\d{4}\.\d{2}\.\d{2}/)?.[0]
        .replaceAll(".", "-") || "";
  } else if (key === "kurashi") {
    proof =
      $(".sentence")
        .text()
        .match(/text\s*[:：]\s*池田浩明/i)?.[0] || "";
    if (!proof) throw Error("No verified author");
    day =
      $(".article_wrap")
        .text()
        .match(/\d{4}\.\d{2}\.\d{2}/)?.[0]
        .replaceAll(".", "-") || "";
  } else if (key === "viewtabi") {
    proof =
      $(".layout_article")
        .text()
        .match(/私、池田浩明は全国のパンを食べまくっているパンオタクだ/)?.[0] ||
      "";
    if (!proof || !$('a[href*="writer/hiloaki_ikeda"]').length)
      throw Error("No verified author");
    title =
      $('meta[property="og:title"]')
        .attr("content")
        ?.replace(/\s*[-|]\s*びゅうたび.*$/, "")
        .trim() || "";
    day = $(".dateCategory .date").first().text().trim().replaceAll(".", "-");
  } else if (key === "elle") {
    proof = $('a[href="/jp/author/418205/ikedahiloaki/"]')
      .first()
      .text()
      .trim();
    if (!/^HIROAKI IKEDA$/i.test(proof)) throw Error("No verified author");
    if (!data?.articleBody || data.isAccessibleForFree === false)
      throw Error("Incomplete/restricted article");
  }
  if (day) date = day + "T00:00:00+09:00";
  if (
    !title ||
    !date ||
    !Number.isFinite(Date.parse(date)) ||
    Date.parse(date) > Date.now()
  )
    throw Error("Missing/invalid original title or publication date");
  const publishedAt = new Date(date).toISOString();
  const originalDate =
    day ||
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(date));
  if (["bunshun", "php", "fujinkoron"].includes(key)) {
    const visible = $(
      key === "bunshun"
        ? "time.date"
        : key === "php"
          ? "p.date"
          : ".signage__date",
    )
      .first()
      .text()
      .match(/(\d{4})[年\/.](\d{1,2})[月\/.](\d{1,2})/);
    const visibleDay =
      visible &&
      `${visible[1]}-${visible[2].padStart(2, "0")}-${visible[3].padStart(2, "0")}`;
    if (visibleDay !== originalDate)
      throw Error("Visible and structured dates differ");
  }
  const parts = pages.map((page, i) => {
    const x = load(page.html),
      b = x(pub.body).clone();
    if (!b.length) throw Error("No body");
    if (
      i &&
      new URL(x('link[rel="canonical"]').attr("href") || page.url, page.url)
        .pathname !== sourceUrl.pathname
    )
      throw Error("Continuation canonical mismatch");
    b.find(
      'script,style,noscript,button,form,nav,.ad-banner,[class*="ad-article"],.detail_images_btn,.sns,.share,.share_buttons,.related-posts-inline,.external-link-wrap,[class*="ad-container"],[class*="advertisement"],.article-ad',
    ).remove();
    b.find("a")
      .filter((_, e) =>
        /^(すべての写真を見る|写真一覧|この記事の画像)/.test(
          x(e).text().trim(),
        ),
      )
      .remove();
    if (key === "kurashi")
      b.find('.sns_wrap,[class*="sns"],[class*="share"],.fb-like').remove();
    if (key === "viewtabi")
      b.find(
        '.experiencefragment,.productinformation,[class*="related"],.articlelist',
      ).remove();
    if (key === "rtsushin")
      b.find(".shop-info")
        .filter((_, e) => x(e).text().startsWith("池田浩明（"))
        .remove();
    b.find("img").each((_, e) => {
      const img = x(e);
      let src =
        img.attr("data-src") || img.attr("data-original") || img.attr("src");
      if (!src || /^data:/.test(src) || /\.svg(?:\?|$)/.test(src)) {
        img.remove();
        return;
      }
      img.attr("src", new URL(src, page.url).href);
      img
        .removeAttr("srcset")
        .removeAttr("data-src")
        .removeAttr("data-original")
        .removeAttr("sizes");
    });
    b.find("a[href]").each((_, e) => {
      const a = x(e),
        href = a.attr("href")!;
      try {
        a.attr("href", new URL(href, page.url).href);
      } catch {
        a.removeAttr("href");
      }
    });
    return b
      .map((_, e) => x(e).html() || "")
      .get()
      .join("\n");
  });
  if (!compact(load(parts.join("\n")).text()).includes(compact(proof)))
    parts.push(`<p>${proof}</p>`);
  const sourceHtml = parts.join("\n");
  if (
    /ここから先は有料|続きをお読みいただくには|今すぐ会員登録して続きを読む/.test(
      load(sourceHtml).text(),
    )
  )
    throw Error("Restricted article");
  let contentHtml = sanitizeBlogHtml(sourceHtml);
  const body = load(contentHtml, {}, false),
    original = load(sourceHtml, {}, false),
    text = body.text();
  original("p,h2,h3,h4,h5,h6,li,figcaption").each((_, e) => {
    const t = compact(original(e).text());
    if (t.length > 2 && !compact(text).includes(t))
      throw Error("Source prose omitted");
  });
  if (compact(text).length < 150) throw Error("Body too short");
  const hero = $('meta[property="og:image"]').attr("content") || "";
  const heroImageUrl = hero
    ? new URL(hero, sourceUrl).href
    : body("img[src]").first().attr("src") || "";
  const id =
    key === "elle"
      ? Number(sourceUrl.pathname.match(/\/g(\d+)\//)?.[1])
      : key === "italianity"
        ? Number(
            $(".post-item-open")
              .attr("class")
              ?.match(/post-item-(\d+)/)?.[1],
          )
        : key === "andpremium"
          ? Number(sourceUrl.pathname.match(/-(\d+)\/$/)?.[1])
          : key === "rtsushin"
            ? Number(sourceUrl.pathname.match(/_(\d+)\/$/)?.[1])
            : Number(sourceUrl.pathname.match(/(?:\/|-)(\d+)\/?$/)?.[1]);
  if (!id) throw Error("Missing stable article ID");
  const post: PublicationPost = {
    id,
    publication: key,
    slug: `ikeda-${key}-${id}`,
    title,
    sourceUrl: sourceUrl.href,
    sourceHtml,
    contentHtml,
    sourceHash: "",
    publishedAt,
    originalDate,
    authorName,
    category: pub.name,
    excerpt: text.replace(/\s+/g, " ").trim().slice(0, 180),
    heroImageUrl,
    bodyText: text,
    images: [
      ...new Set(
        [
          ...body("img[src]")
            .map((_, e) => body(e).attr("src")!)
            .get(),
          heroImageUrl,
        ].filter(Boolean),
      ),
    ],
    pages: pages.map((p) => p.url),
    authorshipEvidence: proof,
  };
  post.sourceHash = publicationHash(post);
  return post;
}
