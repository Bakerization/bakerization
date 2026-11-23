import { test, expect } from "vitest";
import { blogLanguage, withBlogLanguage } from "../lib/blog-language";
import { blogMetadata, blogSitemapEntries } from "../lib/blog-seo";
import { chatRequestSchema } from "../lib/ikeda-types";
import { toPublicPathname } from "../lib/public-pathname";

test("blog language links preserve filters, paging and hash without leaking internal prefixes", () => {
  expect(
    withBlogLanguage("/blog?year=2014&theme=wheat&lang=en#articles", "ko"),
  ).toBe("/blog?year=2014&theme=wheat&lang=ko#articles");
  expect(withBlogLanguage("/blog/page/3?lang=ko", "ja")).toBe("/blog/page/3");
  expect(toPublicPathname("/zh/blog/panlabo-2228")).toBe("/blog/panlabo-2228");
  expect(toPublicPathname("/ko/blog/chat")).toBe("/blog/chat");
  expect(blogLanguage("zh")).toBe("zh");
});
test("article metadata advertises full translations only, with correct language tags and canonical", () => {
  const input = {
    path: "/blog/panlabo-2228",
    locale: "ko" as const,
    title: "빵",
    available: ["ja" as const, "en" as const],
  };
  expect(blogMetadata(input).alternates?.canonical).not.toContain("lang=");
  expect(blogMetadata(input).alternates?.languages).not.toHaveProperty("ko");
  const ready = blogMetadata({ ...input, available: ["ja", "en", "zh", "ko"] });
  expect(ready.alternates?.canonical).toContain("lang=ko");
  expect(ready.alternates?.languages).toHaveProperty("zh-Hans");
  const entries = blogSitemapEntries(input.path, { available: ["ja", "ko"] });
  expect(entries).toHaveLength(2);
  expect(entries[1].url).toContain("lang=ko");
  expect(entries[1].alternates?.languages).not.toHaveProperty("zh-Hans");
});
test("Chinese and Korean questions are accepted without changing the question text", () => {
  for (const [locale, question] of [
    ["zh", "如何理解小麦的风味？"],
    ["ko", "밀의 풍미를 어떻게 이해하나요?"],
  ]) {
    const result = chatRequestSchema.parse({ locale, question });
    expect(result.locale).toBe(locale);
    expect(result.question).toBe(question);
  }
});
