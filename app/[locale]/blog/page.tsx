import type { Metadata } from "next";
import BlogIndex from "@/components/blog/BlogIndex";
import { localeFromParams } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
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
  const locale = await localeFromParams(params);
  const f = archiveFilters(await searchParams);
  return pageMetadata({
    path: "/blog",
    locale,
    title: "Blog",
    description:
      "パンラボと朝日新聞「このパンがすごい！」の記事を、元の公開日・年代・テーマから読むアーカイブ。",
    robots: {
      index: !f.year && !f.theme && !f.q && f.order === "desc" && f.page === 1,
      follow: true,
    },
  });
}
export default async function Page({ params, searchParams }: Props) {
  return (
    <BlogIndex
      locale={await localeFromParams(params)}
      filters={archiveFilters(await searchParams)}
    />
  );
}
