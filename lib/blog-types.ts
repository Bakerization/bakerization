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
