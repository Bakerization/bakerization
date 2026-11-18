import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "cheerio";
import {
  ASAHI_KONOPAN as A,
  parseSeries,
  parseArticle,
  articleHash,
  originalImage,
} from "./lib/asahi-konopan";
import { IKEDA_ARTICLE_SLUG, articleSourceLabel } from "../lib/ikeda-sources";
const listing = {
  id: 12345678,
  url: `${A.origin}/and/w/article/12345678`,
  title: "小麦と職人のパン",
  day: "2020.01.01",
};
function fixture(
  options: {
    author?: boolean;
    free?: boolean;
    url?: string;
    date?: string;
    body?: string;
  } = {},
) {
  const date = options.date || "2020-01-01T06:20:00+09:00";
  const data = {
    "@type": "Article",
    url: options.url || listing.url,
    datePublished: date,
    dateModified: "2026-11-18T00:00:00+09:00",
    description: "原文の説明",
    isAccessibleForFree: options.free,
  };
  const body =
    options.body ??
    `<p>${"小麦を育てる人とパンを焼く人の仕事を味わう。".repeat(8)}</p><h2>職人の言葉</h2><p>「小麦の香りを届けたい」と職人は語る。</p><figure><img src="https://p.potaufeu.asahi.com/b.jpg"><figcaption>焼きたてのパン（撮影者）</figcaption></figure><div id="kiji_rect_1st"><script>bad()</script></div><p><a href="/and/w/article/87654321">別の記事</a></p><iframe src="https://www.google.com/maps/d/embed?mid=public-map"></iframe>`;
  return `<html><head><script type="application/ld+json">${JSON.stringify(data)}</script></head><body><main>${options.author === false ? "" : '<a href="/and/creators/10860116"><img src="https://p.potaufeu.asahi.com/avatar.jpg"></a>'}<figure><div><img src="https://next-image.potaufeu.asahi.com/and/_next/image?url=https%3A%2F%2Fp.potaufeu.asahi.com%2Fhero.jpg&amp;w=640&amp;q=75" alt="店の外観"></div><p>外観（撮影者）</p></figure><h1>${listing.title}</h1><time id="article-date" datetime="${date}">2020.01.01</time>${options.author === false ? "" : '<a href="/and/creators/10860116">池田浩明</a>'}<div class="l-article-body">${body}</div></main></body></html>`;
}
test("series parsing excludes recommendation sections and finds all pagination", () => {
  const card = (id: number) =>
    `<article><span>2020.01.01</span><a href="/and/w/article/${id}"><img></a><a href="/and/w/article/${id}">＆w小麦のパン</a></article>`;
  const html = `<main><h1>${A.category}</h1><section>${card(1)}${card(2)}</section><section>${card(999)}</section><a href="/and/w/serialstory/konopan/page/15">最後</a></main>`;
  const result = parseSeries(html);
  assert.deepEqual(
    result.posts.map((p) => p.id),
    [1, 2],
  );
  assert.equal(result.lastPage, 15);
});
test("publication date remains Japanese original time despite a later migration date", () => {
  const p = parseArticle(fixture(), listing);
  assert.equal(p.publishedAt, "2019-12-31T21:20:00.000Z");
  assert.equal(p.originalDate, "2020.01.01");
  assert.equal(p.sourceHash, articleHash(p));
});
test("full text, photo captions, byline and safe links survive without advertising scripts", () => {
  const p = parseArticle(fixture(), listing),
    $ = load(p.contentHtml);
  assert.equal(p.authorName, "池田浩明");
  assert.match($.text(), /職人の言葉/);
  assert.match($.text(), /焼きたてのパン（撮影者）/);
  assert.match($.text(), /外観（撮影者）/);
  assert.equal($("script,iframe,object,embed").length, 0);
  assert.equal(p.images.length, 2);
  assert.equal(
    $('a[href="https://www.google.com/maps/d/embed?mid=public-map"]').length,
    1,
  );
  assert.equal(
    $('a[href="https://www.asahi.com/and/w/article/87654321"]').length,
    1,
  );
});
test("unsigned announcements are not assigned an Ikeda byline", () => {
  const p = parseArticle(fixture({ author: false }), listing);
  assert.equal(p.authorName, A.publisher);
  assert.ok(!p.contentHtml.includes("文：池田浩明"));
});
test("restricted, truncated, foreign, and date-mismatched sources fail closed", () => {
  assert.throws(
    () => parseArticle(fixture({ free: false }), listing),
    /restricted/,
  );
  assert.throws(
    () => parseArticle(fixture({ body: "<p>続きはありません</p>" }), listing),
    /Missing full text/,
  );
  assert.throws(
    () =>
      parseArticle(
        fixture({ url: "https://example.com/and/w/article/12345678" }),
        listing,
      ),
    /Wrong article/,
  );
  assert.throws(
    () => parseArticle(fixture({ date: "2020-01-02T00:00:00+09:00" }), listing),
    /Changed publication date/,
  );
});
test("image URLs and article identifiers remain constrained to their intended roles", () => {
  assert.equal(
    originalImage("/and/photo.jpg"),
    "https://www.asahi.com/and/photo.jpg",
  );
  assert.throws(() => originalImage("javascript:alert(1)"));
  assert.ok(IKEDA_ARTICLE_SLUG.test("asahi-konopan-12345678"));
  assert.ok(IKEDA_ARTICLE_SLUG.test("panlabo-2228"));
  assert.ok(!IKEDA_ARTICLE_SLUG.test("asahi-konopan-123/../../"));
  assert.equal(articleSourceLabel(listing.url), A.publisher);
  assert.equal(
    articleSourceLabel("https://panlabo.jugem.jp/?eid=1"),
    "パンラボ",
  );
});

test("verified Asahi creator identity and literal byline take precedence over AI inference", async () => {
  const { normalizeThoughtVoices } = await import("../lib/ikeda-citations");
  const thought = {
    authorship: "collective_unknown" as const,
    authorshipEvidence: "",
    summary: "本文",
    themes: ["craft"],
    question: "問い",
    concepts: [],
    claims: [],
  };
  const text = "本文\n文：池田浩明\n";
  const confirmed = normalizeThoughtVoices(thought, text, {
    slug: "asahi-konopan-12345678",
    authorName: "池田浩明",
  });
  assert.equal(confirmed.authorship, "ikeda_explicit");
  assert.equal(confirmed.authorshipEvidence, "文：池田浩明");
  assert.equal(
    normalizeThoughtVoices(thought, text, {
      slug: "panlabo-1",
      authorName: "池田浩明",
    }).authorship,
    "collective_unknown",
  );
  assert.equal(
    normalizeThoughtVoices(thought, text, {
      slug: "asahi-konopan-12345678",
      authorName: A.publisher,
    }).authorship,
    "collective_unknown",
  );
});

test("an empty image placeholder never becomes an article HTML URL", () => {
  const body = `<p>${"本文の文章です。".repeat(30)}</p><img src="">`;
  const p = parseArticle(fixture({ body }), listing);
  assert.ok(!p.images.includes(listing.url));
  assert.ok(p.sourceHtml.includes('src=""'));
});
