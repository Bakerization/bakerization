import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import NewsArticle from "@/components/news/NewsArticle";
import { LOCALES, localeFromParams } from "@/lib/locale";
import { localizeNews, newsHasEnglish } from "@/lib/news-format";
import { getNews, listNewsSummaries } from "@/lib/news-store";
import { pageMetadata } from "@/lib/seo";

// Public news entry. Published items are prerendered per locale; one published
// later renders on first request. createNews/updateNews/deleteNews purge these.
// Drafts are never shown here (admins check them in the editor's live preview).
export const revalidate = 3600;
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  try {
    const items = await listNewsSummaries();
    return LOCALES.flatMap((locale) => items.map((n) => ({ locale, slug: n.slug })));
  } catch {
    return []; // database unreachable at build time: generate on demand instead
  }
}

const loadNews = cache(async (slug: string) => getNews(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [item, locale] = await Promise.all([loadNews(slug), localeFromParams(params)]);
  if (!item || !item.published) return { title: "News", robots: { index: false, follow: false } };
  const available = newsHasEnglish(item) ? (["ja", "en"] as const) : (["ja"] as const);
  const localized = localizeNews(item, available.length > 1 ? locale : "ja");
  return pageMetadata({
    path: `/news/${item.slug}`,
    locale,
    available,
    title: localized.title,
    description: localized.summary || undefined,
    type: "article",
    images: item.coverImageUrl ? [item.coverImageUrl] : undefined,
    publishedTime: item.publishedAt,
    modifiedTime: item.updatedAt,
  });
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const [item, locale] = await Promise.all([loadNews(slug), localeFromParams(params)]);
  if (!item || !item.published) notFound();
  return <NewsArticle item={item} locale={locale} />;
}
