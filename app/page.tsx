import type { Metadata } from "next";
import TopPage from "@/components/home/TopPage";
import JsonLd from "@/components/JsonLd";
import { COMPANY } from "@/lib/company";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { listPostSummaries } from "@/lib/blog-store";
import { getServerLocale } from "@/lib/i18n";
import { getLocalizedPost } from "@/lib/blog-localize";

function formatDate(value: string, locale: "ja" | "en") {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return locale === "en" ? `${y}.${m}.${day}` : `${y}.${m}.${day}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
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

export default async function Home() {
  const locale = await getServerLocale();

  let teasers: {
    slug: string;
    date: string;
    tag: string;
    ja: string;
    en: string;
  }[] = [];

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
      };
    });
  } catch {
    teasers = [];
  }

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
      <TopPage posts={teasers} locale={locale} />
    </>
  );
}
