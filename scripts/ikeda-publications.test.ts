import { test, expect } from "vitest";
import {
  articleLinks,
  continuationPages,
  parsePublication,
  publicationHash,
} from "./lib/ikeda-publications";
import { IKEDA_ARTICLE_SLUG, articleSourceLabel } from "../lib/ikeda-sources";
import { normalizeThoughtVoices } from "../lib/ikeda-citations";
import type { Thought } from "../lib/ikeda-types";
const prose = "小麦の個性をパンで伝えるため、畑を訪れて農家と話をする。".repeat(
  10,
);
function bunshun(body: string, date = "2018-05-13T07:00:00+09:00") {
  return `<link rel="canonical" href="https://bunshun.jp/articles/-/7363"><h1>パンの旅</h1><time class="date">2018/05/13</time><script type="application/ld+json">${JSON.stringify({ "@type": "Article", datePublished: date, author: { name: "池田 浩明" } })}</script><div class="article-body">${body}</div>`;
}
test("publication parsing preserves the complete multipage prose, date and caption while stripping ads and active HTML", () => {
  const p = parsePublication(
    [
      {
        url: "https://bunshun.jp/articles/-/7363",
        html: bunshun(
          `<p>${prose}</p><div class="ad-banner"><p>広告本文</p></div><script>bad()</script>`,
        ),
      },
      {
        url: "https://bunshun.jp/articles/-/7363?page=2",
        html: bunshun(
          '<p>続きの結論。</p><figure><img data-src="/photo.jpg" onerror="bad()"><figcaption>写真：撮影者</figcaption></figure>',
        ),
      },
    ],
    "bunshun",
  );
  expect(p.bodyText).toContain(prose);
  expect(p.bodyText).toContain("続きの結論。");
  expect(p.bodyText).toContain("写真：撮影者");
  expect(p.contentHtml).not.toMatch(/広告本文|script|onerror/);
  expect(p.publishedAt).toBe("2018-05-12T22:00:00.000Z");
  expect(p.images).toContain("https://bunshun.jp/photo.jpg");
  expect(publicationHash(p)).toBe(p.sourceHash);
});
test("a structured date cannot silently replace a different visible publication date", () => {
  expect(() =>
    parsePublication(
      [
        {
          url: "https://bunshun.jp/articles/-/7363",
          html: bunshun(`<p>${prose}</p>`, "2018-05-14T07:00:00+09:00"),
        },
      ],
      "bunshun",
    ),
  ).toThrow(/dates differ/);
});
test("same-path cross-publisher canonical links and unverified bylines are rejected", () => {
  const html = bunshun(`<p>${prose}</p>`);
  expect(() =>
    parsePublication(
      [
        {
          url: "https://bunshun.jp/articles/-/7363",
          html: html.replace(
            'href="https://bunshun.jp',
            'href="https://example.com',
          ),
        },
      ],
      "bunshun",
    ),
  ).toThrow(/canonical/);
  expect(() =>
    parsePublication(
      [
        {
          url: "https://bunshun.jp/articles/-/7363",
          html: html.replace("池田 浩明", "別の著者"),
        },
      ],
      "bunshun",
    ),
  ).toThrow(/author/);
});
test("author-list discovery excludes recommendations outside the actual author list", () => {
  const urls = articleLinks(
    '<ul class="list-thumb author"><h2><a href="/articles/-/7363">本人の記事</a></h2><h2><a href="https://example.com/articles/-/7">外部</a></h2></ul><aside><a href="/articles/-/99">おすすめ</a></aside>',
    "bunshun",
    "https://bunshun.jp/list/author/58835fb077656111fd030000",
  );
  expect(urls).toEqual(["https://bunshun.jp/articles/-/7363"]);
  expect(
    continuationPages(
      '<a href="?page=2">次</a><a href="?page=3">3</a><a href="/articles/-/99?page=4">別記事</a>',
      urls[0],
    ),
  ).toEqual([2, 3]);
});
test("PHP coauthors remain jointly credited", () => {
  const html = bunshun(
    `<p>池田浩明・瑞穂日和著『パンビジネス』</p><p>${prose}</p>`,
  )
    .replace(
      "https://bunshun.jp/articles/-/7363",
      "https://shuchi.php.co.jp/article/13233",
    )
    .replace('class="article-body"', 'class="article_text"')
    .replace(
      '<time class="date">2018/05/13</time>',
      '<p class="date">2018年05月13日 公開</p>',
    );
  const p = parsePublication(
    [{ url: "https://shuchi.php.co.jp/article/13233", html }],
    "php",
  );
  expect(p.authorName).toBe("池田浩明・瑞穂日和");
});
const thought: Thought = {
  authorship: "ikeda_explicit",
  authorshipEvidence: "池田浩明",
  summary: "小麦",
  themes: ["wheat"],
  question: "なぜか",
  concepts: ["小麦"],
  claims: [
    {
      statement: "主張",
      basis: "根拠",
      quote: "小麦の個性をパンで伝えるため、畑を訪れて農家と話をする。",
      voice: "narrator",
    },
  ],
};
test("jointly authored observations and quoted interview speech cannot become Ikeda's sole claims", () => {
  const joint = normalizeThoughtVoices(thought, prose, {
    slug: "ikeda-php-13233",
    authorName: "池田浩明・瑞穂日和",
  });
  expect(joint.authorship).toBe("collective_unknown");
  expect(joint.claims[0].voice).toBe("unclear");
  const quoted = normalizeThoughtVoices(
    thought,
    `HIROAKI IKEDA\n「${thought.claims[0].quote}」`,
    { slug: "ikeda-elle-61064930", authorName: "池田浩明" },
  );
  expect(quoted.authorship).toBe("ikeda_explicit");
  expect(quoted.claims[0].voice).toBe("unclear");
});
test("all known source families have safe article IDs and correct source labels", () => {
  expect(IKEDA_ARTICLE_SLUG.test("ikeda-elle-61064930")).toBe(true);
  expect(IKEDA_ARTICLE_SLUG.test("ikeda-seifun-64021")).toBe(true);
  expect(IKEDA_ARTICLE_SLUG.test("ikeda-unknown-1")).toBe(false);
  expect(IKEDA_ARTICLE_SLUG.test("ikeda-elle-1/../../admin")).toBe(false);
  expect(
    articleSourceLabel(
      "https://r-tsushin.com/people/innovator/hiroaki_ikeda_02/",
    ),
  ).toBe("料理通信");
  expect(articleSourceLabel("https://example.com/")).toBe("出典");
});
