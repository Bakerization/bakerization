import { test, expect, vi } from "vitest";
import { load } from "cheerio";
import { planBlogTranslation } from "../lib/blog-translation-html";
vi.mock("../lib/blog-translation-config", () => ({
  BLOG_TRANSLATION: {
    model: "test",
    language: "en",
    segmentCharacters: 4,
    batchCharacters: 4,
    koreanBatchCharacters: 4,
    koreanOutputTokens: 1000,
    concurrency: 2,
    minimumIntervalMs: 0,
    outputTokens: 1000,
    requestTimeoutMs: 1000,
  },
}));
vi.mock("../lib/ikeda-provider", () => ({
  AiProviderError: class extends Error {},
  aiFetch: vi.fn(async (_path: string, body: { input: string }) => {
    const strings = JSON.parse(body.input) as string[];
    if (strings[0].includes("甲")) await new Promise((r) => setTimeout(r, 30));
    return Response.json({
      status: "completed",
      output: [
        {
          type: "message",
          content: [
            {
              type: "output_text",
              text: JSON.stringify({
                translations: strings.map((s) => "EN(" + s + ")"),
              }),
            },
          ],
        },
      ],
      usage: { input_tokens: 10, output_tokens: 5 },
    });
  }),
}));
import { translateBlogTexts } from "../lib/blog-translations";
test("full HTML translation preserves links, pictures, captions and inline structure, and cannot introduce executable HTML", () => {
  const original =
    '<p>小麦の<em>香り</em>を感じる。</p><figure><img src="/api/blob/bread.jpg" alt="焼きたてのパン"><figcaption>写真：池田浩明</figcaption></figure><p><a href="https://example.com/source?a=1&amp;b=2">出典</a></p>';
  const plan = planBlogTranslation("記事名", "紹介文", original);
  const result = plan.render(
    plan.strings.map((s, i) =>
      i === 2 ? "<script>bad()</script>" : "English " + s,
    ),
  );
  const $ = load(result.contentHtml, {}, false);
  expect($("script").length).toBe(0);
  expect($("p").first().text()).toContain("<script>bad()</script>");
  expect($("img").attr("src")).toBe("/api/blob/bread.jpg");
  expect($("a").attr("href")).toBe("https://example.com/source?a=1&b=2");
  expect($("em").text()).toContain("English");
  expect($("figcaption").text()).toContain("English");
  expect($("img").attr("alt")).toContain("English");
  expect(result.title).toBe("English 記事名");
});
test("a missing translation segment cannot silently truncate the article", () => {
  const p = planBlogTranslation("記事名", "説明", "<p>小麦と農家。</p>");
  expect(() => p.render(["Title"])).toThrow(/segment mismatch/);
});
test("parallel translation batches retain the original segment order and leave English URLs intact", async () => {
  const result = await translateBlogTexts([
    "甲甲甲甲乙乙乙乙",
    "https://example.com/path?x=1",
    "パンの記事",
  ]);
  expect(result.texts[0]).toBe("EN(甲甲甲甲) EN(乙乙乙乙)");
  expect(result.texts[1]).toBe("https://example.com/path?x=1");
  expect(result.texts[2]).toBe("EN(パンの記) EN(事)");
});
