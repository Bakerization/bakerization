export type BlogPost = {
  slug: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  heroImageUrl: string;
  contentHtml: string;
  contentHtmlEn: string;
  published: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  sourceUrl: string;
  authorName: string;
  category: string;
};

export type BlogPostSummary = Omit<BlogPost, "contentHtml" | "contentHtmlEn"> & { hasEnglish: boolean };
