import { test, expect, vi, beforeEach } from "vitest";
const mocks = vi.hoisted(() => ({
  source: vi.fn(),
  cache: vi.fn(),
  claim: vi.fn(),
  release: vi.fn(),
  translate: vi.fn(),
  save: vi.fn(),
  reserve: vi.fn(),
  usage: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock("../lib/blog-translations", () => ({
  translationSource: mocks.source,
  getBlogTranslation: mocks.cache,
  claimBlogTranslation: mocks.claim,
  releaseBlogTranslation: mocks.release,
  translateBlogArticle: mocks.translate,
  saveBlogTranslation: mocks.save,
}));
vi.mock("../lib/ikeda-quota", () => ({
  reserveIkedaRequest: mocks.reserve,
  recordIkedaUsage: mocks.usage,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
import { POST } from "../app/api/blog/translate/route";
const source = {
  slug: "ikeda-bunshun-7363",
  title: "小麦",
  excerpt: "説明",
  content_html: "<p>日本語。</p>",
  source_hash: "hash",
  title_en: "",
  content_html_en: "",
};
function request(
  body: unknown = { slug: source.slug },
  origin = "https://www.bakerization.com",
) {
  return new Request("https://www.bakerization.com/api/blog/translate", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.resetAllMocks();
  mocks.source.mockResolvedValue(source);
  mocks.cache.mockResolvedValue(null);
  mocks.claim.mockResolvedValue(true);
  mocks.reserve.mockResolvedValue({ allowed: true });
  mocks.usage.mockResolvedValue(undefined);
  mocks.release.mockResolvedValue(undefined);
});
test("translation rejects cross-site requests and oversized bodies before looking up articles", async () => {
  expect((await POST(request(undefined, "https://example.com"))).status).toBe(
    403,
  );
  expect((await POST(request({ slug: "x".repeat(5000) }))).status).toBe(400);
  expect(mocks.source).not.toHaveBeenCalled();
});
test("drafts and nonexistent articles cannot be translated", async () => {
  mocks.source.mockResolvedValue(null);
  expect((await POST(request())).status).toBe(404);
  expect(mocks.reserve).not.toHaveBeenCalled();
});
test("a cached translation is reused without charging a generation quota", async () => {
  mocks.cache.mockResolvedValue({
    title: "Wheat",
    excerpt: "About wheat",
    contentHtml: "<p>English.</p>",
  });
  const r = await POST(request());
  expect(r.status).toBe(200);
  expect((await r.json()).contentHtml).toContain("English.");
  expect(mocks.claim).not.toHaveBeenCalled();
  expect(mocks.reserve).not.toHaveBeenCalled();
  expect(mocks.translate).not.toHaveBeenCalled();
});
test("concurrent requests wait for the current translation rather than starting another generation", async () => {
  mocks.claim.mockResolvedValue(false);
  const r = await POST(request());
  expect(r.status).toBe(202);
  expect(mocks.translate).not.toHaveBeenCalled();
  expect(mocks.reserve).not.toHaveBeenCalled();
});
test("quota rejection releases the claim and leaves the original untouched", async () => {
  mocks.reserve.mockResolvedValue({ allowed: false });
  expect((await POST(request())).status).toBe(429);
  expect(mocks.release).toHaveBeenCalledWith(source.slug, "hash", "en");
  expect(mocks.translate).not.toHaveBeenCalled();
});
test("new translations are sanitized, saved and revalidated", async () => {
  mocks.translate.mockResolvedValue({
    title: "Wheat",
    excerpt: "About wheat",
    contentHtml:
      '<p>English.</p><script>bad()</script><img src="/photo.jpg" onerror="bad()">',
    sourceHash: "hash",
    inputTokens: 20,
    outputTokens: 10,
  });
  const r = await POST(request());
  expect(r.status).toBe(200);
  const t = await r.json();
  expect(t.contentHtml).toContain("English.");
  expect(t.contentHtml).not.toMatch(/script|onerror/);
  expect(mocks.save).toHaveBeenCalledWith(
    source.slug,
    expect.objectContaining({ sourceHash: "hash" }),
    "en",
  );
  expect(mocks.revalidate).toHaveBeenCalledWith("/en/blog/" + source.slug);
});

for (const language of ["zh", "ko"]) {
  test(`${language} uses a separate cached translation and preserves the manual English version`, async () => {
    mocks.source.mockResolvedValue({
      ...source,
      title_en: "Wheat",
      content_html_en: "<p>English.</p>",
    });
    mocks.cache.mockResolvedValue({
      title: language === "zh" ? "小麦" : "밀",
      contentHtml: "<p>Translated.</p>",
    });
    const r = await POST(request({ slug: source.slug, language }));
    expect(r.status).toBe(200);
    expect((await r.json()).contentHtml).toContain("Translated.");
    expect(mocks.cache).toHaveBeenCalledWith(source.slug, language);
    expect(mocks.translate).not.toHaveBeenCalled();
  });
}
test("unsupported translation languages are rejected before an article lookup", async () => {
  expect(
    (await POST(request({ slug: source.slug, language: "fr" }))).status,
  ).toBe(400);
  expect(mocks.source).not.toHaveBeenCalled();
});
