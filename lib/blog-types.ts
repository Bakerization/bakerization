export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type BlogPost = {
  slug: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  heroImageUrl: string;
  contentHtml: string;
  contentHtmlEn: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
};

/** A post without its (large) HTML bodies: lists, teasers, prev/next, sitemap. */
export type BlogPostSummary = Omit<BlogPost, "contentHtml" | "contentHtmlEn"> & {
  /** True when the post has its own English title and body. */
  hasEnglish: boolean;
};
