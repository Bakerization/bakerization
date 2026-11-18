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
    title: "Blog — パンラボの記録",
    description:
      "池田浩明が主宰するパンラボの記事アーカイブ。パン、パン屋、小麦、人と土地の記録を、当時の公開日とともに掲載しています。",
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
