import type { Metadata } from "next";
import TopPage from "@/components/home/TopPage";
import JsonLd from "@/components/JsonLd";
import { COMPANY } from "@/lib/company";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { listPostSummaries } from "@/lib/blog-store";
import { localeFromParams } from "@/lib/locale";
import { getLocalizedPost } from "@/lib/blog-localize";
import { listNewsSummaries } from "@/lib/news-store";
import { formatNewsDate, localizeNews } from "@/lib/news-format";

// ISR: the news list and the three journal teasers come from the database.
// savePost() and the news store purge this page on change; the hourly
// revalidate is only a safety net.
export const revalidate = 3600;
type Props = { params: Promise<{ locale: string }> };


function formatDate(value: string, locale: "ja" | "en") {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return locale === "en" ? `${y}.${m}.${day}` : `${y}.${m}.${day}`;
}

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

  let teasers: {
    slug: string;
    date: string;
    tag: string;
    ja: string;
    en: string;
    image?: string;
  }[] = [];

  const newsPromise = listNewsSummaries({ limit: 3 }).catch(() => []);

  try {
    const posts = await listPostSummaries({ limit: 3 });
    teasers = posts.map((p) => {
      const loc = getLocalizedPost(p, locale);
      return {
        slug: p.slug,
        date: formatDate(p.updatedAt, locale),
        tag: locale === "en" ? "Journal" : "ジャーナル",
        ja: loc.title,
        en: loc.excerpt,
        image: p.heroImageUrl || undefined,
      };
    });
  } catch {
    teasers = [];
  }

  const news = (await newsPromise).map((n) => ({
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
      <TopPage posts={teasers} news={news} locale={locale} />
    </>
  );
}
