import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import BlogIndex, { blogPagePath } from "@/components/blog/BlogIndex";
import { localeFromParams, withLang } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() { return []; }
type Props = { params: Promise<{ locale: string; page: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const locale = await localeFromParams(params);
  if (!/^[1-9]\d{0,4}$/.test(page)) return { robots: { index: false, follow: false } };
  return pageMetadata({ path: blogPagePath(Number(page)), locale, title: `Blog — ${page}`, description: "パンラボの記録。元の公開日順で記事を読む。" });
}
export default async function Page({ params }: Props) {
  const { page } = await params;
  if (!/^[1-9]\d{0,4}$/.test(page)) notFound();
  const locale = await localeFromParams(params);
  if (page === "1") permanentRedirect(withLang("/blog", locale));
  return <BlogIndex locale={locale} page={Number(page)} />;
}
