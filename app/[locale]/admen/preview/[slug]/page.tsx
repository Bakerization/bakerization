import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-server";
import { getPost, listPostSummaries } from "@/lib/blog-store";
import { localeFromParams } from "@/lib/locale";
import BlogArticle from "@/components/blog/BlogArticle";

// Admin-only preview of any post (drafts included), rendered exactly like the
// public page. The public /blog/[slug] is static and therefore can't branch on
// the admin session.
export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function AdminPreviewPage({ params }: Props) {
  const { slug } = await params;
  await requireAdmin(`/admen/preview/${slug}`);
  const [post, locale, summaries] = await Promise.all([getPost(slug), localeFromParams(params), listPostSummaries()]);
  if (!post) notFound();
  return <BlogArticle post={post} summaries={summaries} locale={locale} editHref={`/blog/edit/${post.slug}`} />;
}
