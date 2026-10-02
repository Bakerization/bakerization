import { BlogPost } from "@/lib/blog-types";
import { Locale } from "@/lib/i18n";

/** True when the post has its own English title and body (otherwise en falls back to ja). */
export function hasEnglishVersion(post: BlogPost) {
  return Boolean(post.titleEn.trim() && post.contentHtmlEn.trim());
}

export function getLocalizedPost(post: BlogPost, locale: Locale) {
  const isEn = locale === "en";
  return {
    title: isEn && post.titleEn.trim() ? post.titleEn : post.title,
    excerpt: isEn && post.excerptEn.trim() ? post.excerptEn : post.excerpt,
    contentHtml:
      isEn && post.contentHtmlEn.trim() ? post.contentHtmlEn : post.contentHtml,
  };
}
