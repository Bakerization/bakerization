import type { Metadata } from "next";
import BlogIndex from "@/components/blog/BlogIndex";
import { localeFromParams } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFromParams(params);
  return pageMetadata({ path: "/blog", locale, title: "Blog — パンラボの記録", description: "池田浩明が主宰するパンラボの記事アーカイブ。パン、パン屋、小麦、人と土地の記録を、当時の公開日とともに掲載しています。" });
}
export default async function Page({ params }: Props) { return <BlogIndex locale={await localeFromParams(params)} />; }
