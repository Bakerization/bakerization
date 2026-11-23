import { IKEDA_ARTICLE_SLUG } from "@/lib/ikeda-sources";
import type { Metadata } from "next";
import { IKEDA } from "@/lib/ikeda-config";
import IkedaChat from "@/components/blog/IkedaChat";
import { blogMetadata as pageMetadata } from "@/lib/blog-seo";
import { blogLanguage } from "@/lib/blog-language";
import { blogText } from "@/lib/blog-copy";
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = blogLanguage((await params).locale);
  return pageMetadata({
    path: "/blog/chat",
    locale,
    title: blogText(locale, "池田AI", "Ikeda AI"),
    description: blogText(
      locale,
      "公開記事を根拠に、パン・小麦・職人・食文化を読み解くAI。",
      "Explore bread, wheat, craft and food culture through Hiroaki Ikeda’s published articles.",
    ),
    robots: { index: false, follow: true },
  });
}
export default async function Page({ searchParams, params }: Props) {
  const p = await searchParams;
  const q =
    typeof p.q === "string" ? p.q.slice(0, IKEDA.questionCharacters) : "";
  const article =
    typeof p.article === "string" && IKEDA_ARTICLE_SLUG.test(p.article)
      ? p.article
      : undefined;
  return (
    <IkedaChat
      key={blogLanguage((await params).locale)}
      initialQuestion={q}
      initialScope={{ article }}
      locale={blogLanguage((await params).locale)}
    />
  );
}
