import { BlogPost } from "@/lib/blog-types";
import { Locale } from "@/lib/i18n";

export function getLocalizedPost(post: BlogPost, locale: Locale) {
  const isEn = locale === "en";
  return {
    title: isEn && post.titleEn.trim() ? post.titleEn : post.title,
    excerpt: isEn && post.excerptEn.trim() ? post.excerptEn : post.excerpt,
    contentHtml:
      isEn && post.contentHtmlEn.trim() ? post.contentHtmlEn : post.contentHtml,
  };
}
