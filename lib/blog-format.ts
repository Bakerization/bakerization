import type { BlogPost, BlogPostSummary } from "@/lib/blog-types";
import type { Locale } from "@/lib/locale";

export function hasEnglishVersion(post: BlogPost | BlogPostSummary) {
  return "hasEnglish" in post ? post.hasEnglish : Boolean(post.titleEn.trim() && post.contentHtmlEn.trim());
}
export function localizePost<T extends BlogPost | BlogPostSummary>(post: T, locale: Locale) {
  const en = locale === "en" && hasEnglishVersion(post);
  return { title: en ? post.titleEn : post.title, excerpt: en ? post.excerptEn : post.excerpt,
    contentHtml: "contentHtml" in post ? (en ? post.contentHtmlEn : post.contentHtml) : "" };
}
/** Source timestamps are Japanese local time, including posts before 09:00. */
export function formatBlogDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}
