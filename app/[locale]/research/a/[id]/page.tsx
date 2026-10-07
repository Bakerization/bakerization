import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { LOCALES, localeFromParams } from "@/lib/locale";
import { getResearchCopy } from "@/lib/research-copy";
import { getArtifactMeta, listPublicArtifacts, toPublicArtifact } from "@/lib/research-store";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import ArtifactViewer from "@/components/research/ArtifactViewer";
import JsonLd from "@/components/JsonLd";

// Public artifact viewer (anonymous visitors). Known public artifacts are
// prerendered; new ones render on first request. Members-only ids 404 here
// exactly like missing ids (members are routed to the dynamic twin by proxy.ts).
export const revalidate = 600;
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateStaticParams() {
  try {
    const artifacts = await listPublicArtifacts();
    return LOCALES.flatMap((locale) => artifacts.map((a) => ({ locale, id: a.id })));
  } catch {
    return []; // database unreachable at build time: generate on demand instead
  }
}

const loadArtifact = cache(async (id: string) => getArtifactMeta(id));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [artifact, locale] = await Promise.all([loadArtifact(id), localeFromParams(params)]);
  if (!artifact || artifact.visibility !== "public") {
    return { title: "Research", robots: { index: false, follow: false } };
  }
  const t = getResearchCopy(locale);
  return pageMetadata({
    path: `/research/a/${artifact.id}`,
    locale,
    title: artifact.title,
    description: artifact.description || t.meta.artifactDescription(artifact.title),
    type: "article",
    siteName: "Bakerization Research",
    images: [`/research/a/${artifact.id}/opengraph-image`],
    publishedTime: artifact.createdAt,
    modifiedTime: artifact.updatedAt,
  });
}

export default async function PublicArtifactPage({ params }: Props) {
  const { id } = await params;
  const artifact = await loadArtifact(id);
  // Outsiders get the same 404 as for a missing id: no hint of a login.
  if (!artifact || artifact.visibility !== "public") notFound();

  const project = { slug: artifact.projectSlug, name: artifact.projectName };
  const viewerUrl = absoluteUrl(`/research/a/${artifact.id}`);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: artifact.title,
            description: artifact.description || undefined,
            datePublished: artifact.createdAt,
            dateModified: artifact.updatedAt,
            url: viewerUrl,
            mainEntityOfPage: viewerUrl,
            image: absoluteUrl(`/research/a/${artifact.id}/opengraph-image`),
            isPartOf: { "@type": "CollectionPage", name: project.name, url: absoluteUrl(`/research/p/${project.slug}`) },
            author: { "@type": "Organization", name: "Bakerization", url: absoluteUrl("/") },
            publisher: { "@type": "Organization", name: "Bakerization", url: absoluteUrl("/") },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Research", item: absoluteUrl("/research") },
              { "@type": "ListItem", position: 2, name: project.name, item: absoluteUrl(`/research/p/${project.slug}`) },
              { "@type": "ListItem", position: 3, name: artifact.title, item: viewerUrl },
            ],
          },
        ]}
      />
      <ArtifactViewer
        artifact={toPublicArtifact(artifact)}
        project={project}
        canManage={false}
        anonymous
        viewerUrl={viewerUrl}
      />
    </>
  );
}
