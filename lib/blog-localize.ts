import { BlogPost, BlogPostSummary } from "@/lib/blog-types";
import type { Locale } from "@/lib/locale";

type LocalizableText = Pick<BlogPost, "title" | "titleEn" | "excerpt" | "excerptEn">;
type LocalizableBody = Partial<Pick<BlogPost, "contentHtml" | "contentHtmlEn">>;

/** True when the post has its own English title and body (otherwise en falls back to ja). */
export function hasEnglishVersion(post: BlogPost | BlogPostSummary) {
  if ("hasEnglish" in post) return post.hasEnglish;
  return Boolean(post.titleEn.trim() && post.contentHtmlEn.trim());
}

export function getLocalizedPost(post: LocalizableText & LocalizableBody, locale: Locale) {
  const isEn = locale === "en";
  return {
    title: isEn && post.titleEn.trim() ? post.titleEn : post.title,
    excerpt: isEn && post.excerptEn.trim() ? post.excerptEn : post.excerpt,
    contentHtml:
      isEn && post.contentHtmlEn?.trim() ? post.contentHtmlEn : (post.contentHtml ?? ""),
  };
}
