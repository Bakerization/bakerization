import type { Metadata } from "next";
import BlogIndex from "@/components/blog/BlogIndex";
import { blogLanguage } from "@/lib/blog-language";
import { blogText } from "@/lib/blog-copy";
import { blogMetadata as pageMetadata } from "@/lib/blog-seo";
import { archiveFilters, type SearchParams } from "@/lib/blog-archive";

export const revalidate = 3600;
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
};
export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const locale = blogLanguage((await params).locale);
  const f = archiveFilters(await searchParams);
  return pageMetadata({
    path: "/blog",
    locale,
    title: "Blog",
    description: blogText(
      locale,
      "パンラボと池田浩明の執筆記事を、元の公開日・年代・テーマから読むアーカイブ。各記事に出典を掲載。",
      "Explore Pan Labo and Hiroaki Ikeda’s articles by their original publication dates, themes and sources.",
    ),
    robots: {
      index: !f.year && !f.theme && !f.q && f.order === "desc" && f.page === 1,
      follow: true,
    },
  });
}
export default async function Page({ params, searchParams }: Props) {
  return (
    <BlogIndex
      locale={blogLanguage((await params).locale)}
      filters={archiveFilters(await searchParams)}
    />
  );
}
