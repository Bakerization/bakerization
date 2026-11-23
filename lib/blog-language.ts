import type { Locale } from "./locale";

export const BLOG_LANGUAGES = {
  ja: {
    label: "日本語",
    html: "ja",
    hreflang: "ja",
    og: "ja_JP",
    translationName: "Japanese",
  },
  en: {
    label: "English",
    html: "en",
    hreflang: "en",
    og: "en_US",
    translationName: "English",
  },
  zh: {
    label: "简体中文",
    html: "zh-Hans",
    hreflang: "zh-Hans",
    og: "zh_CN",
    translationName: "Simplified Chinese",
  },
  ko: {
    label: "한국어",
    html: "ko",
    hreflang: "ko",
    og: "ko_KR",
    translationName: "Korean",
  },
} as const;
export type BlogLanguage = keyof typeof BLOG_LANGUAGES;
export type TranslationLanguage = Exclude<BlogLanguage, "ja">;
export function isBlogLanguage(v: unknown): v is BlogLanguage {
  return typeof v === "string" && Object.hasOwn(BLOG_LANGUAGES, v);
}
export function isTranslationLanguage(v: unknown): v is TranslationLanguage {
  return isBlogLanguage(v) && v !== "ja";
}
export function blogLanguage(
  v: unknown,
  fallback: Locale = "ja",
): BlogLanguage {
  const value = Array.isArray(v) ? v[0] : v;
  return isBlogLanguage(value) ? value : fallback;
}
export function withBlogLanguage(href: string, language: BlogLanguage) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const u = new URL(href, "https://www.bakerization.com");
  u.searchParams.delete("lang");
  if (language !== "ja") u.searchParams.set("lang", language);
  return u.pathname + u.search + u.hash;
}
export function blogFont(language: BlogLanguage) {
  return language === "zh"
    ? '"PingFang SC", "Microsoft YaHei", sans-serif'
    : language === "ko"
      ? '"Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
      : undefined;
}
