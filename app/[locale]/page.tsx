import type { Metadata } from "next";
import TopPage from "@/components/home/TopPage";
import JsonLd from "@/components/JsonLd";
import { COMPANY } from "@/lib/company";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { localeFromParams } from "@/lib/locale";
import { listNewsSummaries } from "@/lib/news-store";
import { formatNewsDate, localizeNews } from "@/lib/news-format";

// ISR: the news list comes from the database. The news store purges this page
// on change; the hourly revalidate is only a safety net.
export const revalidate = 3600;
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFromParams(params);
  return pageMetadata({
    path: "/",
    locale,
    title: "Bakerization — We Bake the Future",
    absoluteTitle: true,
    description:
      locale === "en"
        ? "Bakerization was founded to solve the social challenges facing the bakery industry — protecting Japan's bread culture through research, technology and community."
        : "Bakerizationはパン屋の社会課題を解決するために生まれた団体です。東大パン研究会とパンラボ池田浩明による、日本のパン文化を守るための調査・テクノロジー・コミュニティの取り組み。",
  });
}

export default async function Home({ params }: Props) {
  const locale = await localeFromParams(params);

  const summaries = await listNewsSummaries({ limit: 3 }).catch(() => []);
  const news = summaries.map((n) => ({
    slug: n.slug,
    date: formatNewsDate(n.publishedAt),
    iso: n.publishedAt,
    title: localizeNews(n, locale).title,
  }));

  const home = absoluteUrl("/");
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${home}#organization`,
            name: "Bakerization",
            url: home,
            logo: absoluteUrl("/opengraph-image"),
            email: COMPANY.email,
            slogan: "We Bake the Future",
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": `${home}#website`,
            name: "Bakerization",
            url: home,
            inLanguage: ["ja", "en"],
            publisher: { "@id": `${home}#organization` },
          },
        ]}
      />
      <TopPage news={news} locale={locale} />
    </>
  );
}
