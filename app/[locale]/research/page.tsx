import type { Metadata } from "next";
import { localeFromParams } from "@/lib/locale";
import { getResearchCopy } from "@/lib/research-copy";
import { listPublicArtifacts, listPublicProjects, toPublicArtifact } from "@/lib/research-store";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import PublicResearchIndex from "@/components/research/PublicResearchIndex";
import JsonLd from "@/components/JsonLd";

// Public research gallery (anonymous visitors). Prerendered per locale and
// purged by every research mutation (revalidateResearch in lib/research-store);
// the 10-minute revalidate is only a safety net.
export const revalidate = 600;

const LATEST_LIMIT = 24;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFromParams(params);
  const t = getResearchCopy(locale);
  return pageMetadata({
    path: "/research",
    locale,
    title: locale === "en" ? "Bakerization Research — Published research" : "Bakerization Research — 公開リサーチ一覧",
    absoluteTitle: true,
    description: t.meta.indexDescription,
    siteName: "Bakerization Research",
    images: ["/research/opengraph-image"],
  });
}

export default async function ResearchIndexPage({ params }: Props) {
  const locale = await localeFromParams(params);
  const t = getResearchCopy(locale);
  const [projects, artifacts] = await Promise.all([listPublicProjects(), listPublicArtifacts({ limit: LATEST_LIMIT })]);
  const pageUrl = absoluteUrl("/research");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Bakerization Research",
          description: t.meta.indexDescription,
          url: pageUrl,
          inLanguage: locale,
          publisher: { "@type": "Organization", name: "Bakerization", url: absoluteUrl("/") },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: artifacts.map((a, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: absoluteUrl(`/research/a/${a.id}`),
              name: a.title,
            })),
          },
        }}
      />
      <PublicResearchIndex locale={locale} projects={projects} artifacts={artifacts.map(toPublicArtifact)} />
    </>
  );
}
