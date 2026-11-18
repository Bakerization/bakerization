import type { Metadata } from "next";
import { IKEDA } from "@/lib/ikeda-config";
import IkedaChat from "@/components/blog/IkedaChat";
import { pageMetadata } from "@/lib/seo";
import { localeFromParams } from "@/lib/locale";
type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return pageMetadata({
    path: "/blog/chat",
    locale: await localeFromParams(params),
    title: "池田AI — パンラボと考える",
    description:
      "パンラボの記事を根拠に、パン・小麦・職人・食文化を読み解くAI。",
    robots: { index: false, follow: true },
  });
}
export default async function Page({ searchParams }: Props) {
  const p = await searchParams;
  const q =
    typeof p.q === "string" ? p.q.slice(0, IKEDA.questionCharacters) : "";
  const article =
    typeof p.article === "string" && /^panlabo-\d+$/.test(p.article)
      ? p.article
      : undefined;
  return <IkedaChat initialQuestion={q} initialScope={{ article }} />;
}
