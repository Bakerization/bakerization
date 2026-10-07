import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getPost, listPostSummaries } from "@/lib/blog-store";
import { LOCALES, localeFromParams } from "@/lib/locale";
import { getLocalizedPost, hasEnglishVersion } from "@/lib/blog-localize";
import { pageMetadata } from "@/lib/seo";
import BlogArticle from "@/components/blog/BlogArticle";

// Public journal entry. Published posts are prerendered per locale; a post
// published later renders on first request. savePost() purges these pages.
// Drafts are not visible here (admins preview them at /admen/preview/[slug]).
export const revalidate = 3600;
export const dynamicParams = true;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  try {
    const posts = await listPostSummaries();
    return LOCALES.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
  } catch {
    return []; // database unreachable at build time: generate on demand instead
  }
}

const loadPost = cache(async (slug: string) => getPost(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post, locale] = await Promise.all([loadPost(slug), localeFromParams(params)]);
  if (!post || !post.published) return { title: "Journal", robots: { index: false, follow: false } };
  const available = hasEnglishVersion(post) ? (["ja", "en"] as const) : (["ja"] as const);
  const localized = getLocalizedPost(post, available.length > 1 ? locale : "ja");
  return pageMetadata({
    path: `/blog/${post.slug}`,
    locale,
    available,
    title: localized.title,
    description: localized.excerpt || undefined,
    type: "article",
    images: post.heroImageUrl ? [post.heroImageUrl] : undefined,
    publishedTime: post.createdAt,
    modifiedTime: post.updatedAt,
  });
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const [post, locale] = await Promise.all([loadPost(slug), localeFromParams(params)]);
  if (!post || !post.published) notFound();

  const summaries = await listPostSummaries();
  return <BlogArticle post={post} summaries={summaries} locale={locale} />;
}
