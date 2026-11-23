// @vitest-environment jsdom
import { StrictMode } from "react";
import { test, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import {
  ArticleTranslation,
  TranslatedArticleTitle,
  ArticleTranslationControls,
  TranslatedArticleBody,
} from "../components/blog/ArticleTranslation";
import type { BlogPost } from "../lib/blog-types";
const router = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
const post: BlogPost = {
  slug: "ikeda-bunshun-7363",
  title: "小麦とパン",
  excerpt: "日本語の記事",
  contentHtml: '<p>日本語本文。</p><img src="/api/blob/pan.jpg" alt="パン">',
  titleEn: "",
  excerptEn: "",
  contentHtmlEn: "",
  heroImageUrl: "",
  published: true,
  publishedAt: "2018-05-12T22:00:00Z",
  createdAt: "2018-05-12T22:00:00Z",
  updatedAt: "2018-05-12T22:00:00Z",
  sourceUrl: "https://bunshun.jp/articles/-/7363",
  authorName: "池田浩明",
  category: "文春オンライン",
};
function View({ value = post, locale = "en" as "ja" | "en" }) {
  return (
    <StrictMode>
      <ArticleTranslation post={value} locale={locale}>
        <h1>
          <TranslatedArticleTitle />
        </h1>
        <ArticleTranslationControls />
        <TranslatedArticleBody />
      </ArticleTranslation>
    </StrictMode>
  );
}
test("the full English article and original switch together, with one request in Strict Mode", async () => {
  const request = vi.fn(async () =>
    Response.json({
      title: "Wheat and bread",
      contentHtml:
        '<p>English article.</p><img src="/api/blob/pan.jpg" alt="Bread">',
    }),
  );
  vi.stubGlobal("fetch", request);
  const { container } = render(<View />);
  await screen.findByRole("heading", { name: "Wheat and bread" });
  expect(request).toHaveBeenCalledTimes(1);
  expect(screen.getByText("English article.")).toBeTruthy();
  expect(container.querySelector("article")?.lang).toBe("en");
  expect(container.querySelector("img")?.getAttribute("src")).toBe(
    "/api/blob/pan.jpg",
  );
  fireEvent.click(screen.getByRole("button", { name: "Japanese original" }));
  expect(screen.getByRole("heading", { name: "小麦とパン" })).toBeTruthy();
  expect(screen.getByText("日本語本文。")).toBeTruthy();
  expect(container.querySelector("article")?.lang).toBe("ja");
  fireEvent.click(screen.getByRole("button", { name: "Read in English" }));
  expect(screen.getByText("English article.")).toBeTruthy();
  expect(request).toHaveBeenCalledTimes(1);
});
test("cached English content renders immediately and makes no translation request", () => {
  const request = vi.fn();
  vi.stubGlobal("fetch", request);
  render(
    <View
      value={{
        ...post,
        titleEn: "Wheat and bread",
        contentHtmlEn: "<p>Saved English.</p>",
        machineTranslated: true,
      }}
    />,
  );
  expect(screen.getByText("Saved English.")).toBeTruthy();
  expect(request).not.toHaveBeenCalled();
  expect(screen.getByText(/AI translation/)).toBeTruthy();
});
test("a failed translation leaves the complete Japanese original available and can be retried", async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(
      Response.json({ error: "Please try later." }, { status: 503 }),
    )
    .mockResolvedValueOnce(
      Response.json({
        title: "Wheat and bread",
        contentHtml: "<p>English article.</p>",
      }),
    );
  vi.stubGlobal("fetch", request);
  render(<View />);
  await screen.findByRole("alert");
  expect(screen.getByText("日本語本文。")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Retry translation" }));
  await screen.findByText("English article.");
  expect(request).toHaveBeenCalledTimes(2);
});
test("Japanese articles do not request translation until English is chosen", async () => {
  const request = vi.fn();
  vi.stubGlobal("fetch", request);
  render(<View locale="ja" />);
  expect(
    screen
      .getByRole("link", { name: "Read in English →" })
      .getAttribute("href"),
  ).toContain("lang=en");
  expect(request).not.toHaveBeenCalled();
});

for (const language of ["zh", "ko"] as const) {
  test(`${language} displays its own saved body and switches back to Japanese without an English request`, () => {
    const request = vi.fn();
    vi.stubGlobal("fetch", request);
    const title = language === "zh" ? "小麦与面包" : "밀과 빵";
    const { container } = render(
      <ArticleTranslation
        locale={language}
        post={{ ...post, titleEn: "Wheat", contentHtmlEn: "<p>English.</p>" }}
        initialTranslation={{ title, contentHtml: "<p>译文 번역문</p>" }}
      >
        <h1>
          <TranslatedArticleTitle />
        </h1>
        <ArticleTranslationControls />
        <TranslatedArticleBody />
      </ArticleTranslation>,
    );
    expect(screen.getByRole("heading", { name: title })).toBeTruthy();
    expect(container.querySelector("article")?.lang).toBe(
      language === "zh" ? "zh-Hans" : "ko",
    );
    expect(screen.queryByText("English.")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", {
        name: language === "zh" ? "日语原文" : "일본어 원문",
      }),
    );
    expect(screen.getByRole("heading", { name: post.title })).toBeTruthy();
    expect(screen.getByText("日本語本文。")).toBeTruthy();
    expect(request).not.toHaveBeenCalled();
  });
}
