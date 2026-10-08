import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsEditor from "@/components/news/NewsEditor";
import { requireAdmin } from "@/lib/auth-server";
import { getNews } from "@/lib/news-store";

export const metadata: Metadata = {
  title: "ニュース編集",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ slug: string }> };

export default async function EditNewsPage({ params }: Props) {
  const { slug } = await params;
  await requireAdmin(`/admen/news/edit/${slug}`);
  const item = await getNews(slug);
  if (!item) notFound();
  return <NewsEditor initialItem={item} />;
}
