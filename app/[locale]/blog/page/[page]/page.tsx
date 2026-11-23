import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import BlogIndex, { blogPagePath } from "@/components/blog/BlogIndex";
import {
  blogLanguage,
  withBlogLanguage as withLang,
} from "@/lib/blog-language";
import { blogText } from "@/lib/blog-copy";
import { blogMetadata as pageMetadata } from "@/lib/blog-seo";

export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}
type Props = { params: Promise<{ locale: string; page: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const locale = blogLanguage((await params).locale);
  if (!/^[1-9]\d{0,4}$/.test(page))
    return { robots: { index: false, follow: false } };
  return pageMetadata({
    path: blogPagePath(Number(page)),
    locale,
    title: `Blog — ${page}`,
    description: blogText(
      locale,
      "元の公開日・テーマ・出典から池田浩明の記事を読む。",
      "Explore Pan Labo and Hiroaki Ikeda’s articles by their original publication dates, themes and sources.",
    ),
  });
}
export default async function Page({ params }: Props) {
  const { page } = await params;
  if (!/^[1-9]\d{0,4}$/.test(page)) notFound();
  const locale = blogLanguage((await params).locale);
  if (page === "1") permanentRedirect(withLang("/blog", locale));
  return <BlogIndex locale={locale} page={Number(page)} />;
}
