export type NewsItem = {
  slug: string;
  title: string;
  titleEn: string;
  /** One or two sentences for the list, the home teaser and the meta description. */
  summary: string;
  summaryEn: string;
  /** Markdown source (GFM). Rendered by components/news/NewsMarkdown.tsx. */
  bodyMd: string;
  bodyMdEn: string;
  coverImageUrl: string;
  published: boolean;
  /** The date shown on the site and the sort key (editable, unlike updatedAt). */
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type NewsSummary = Omit<NewsItem, "bodyMd" | "bodyMdEn"> & {
  hasEnglish: boolean;
};
