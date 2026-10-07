import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getAuthSession, isAdmin } from "@/lib/auth-server";
import { getServerLocale } from "@/lib/i18n";
import { getResearchCopy } from "@/lib/research-copy";
import { getArtifactMeta, toPublicArtifact } from "@/lib/research-store";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import ArtifactViewer from "@/components/research/ArtifactViewer";
import JsonLd from "@/components/JsonLd";

type Params = { params: Promise<{ id: string }> };

const loadArtifact = cache(async (id: string) => getArtifactMeta(id));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const [artifact, locale] = await Promise.all([loadArtifact(id), getServerLocale()]);
  if (!artifact || artifact.visibility !== "public") {
    // Never reveal a members-only title to someone without a session.
    const session = artifact ? await getAuthSession() : null;
    return { title: session && artifact ? artifact.title : "Research", robots: { index: false, follow: false } };
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

export default async function ArtifactPage({ params }: Params) {
  const { id } = await params;
  const [session, artifact] = await Promise.all([getAuthSession(), loadArtifact(id)]);
  if (!artifact) notFound();

  const isPublic = artifact.visibility === "public";
  // Outsiders get the same 404 as for a missing id: no hint of a login.
  if (!session && !isPublic) notFound();

  // The project's slug/name ride along on the artifact row: no second query.
  const project = { slug: artifact.projectSlug, name: artifact.projectName };
  const viewerUrl = absoluteUrl(`/research/a/${artifact.id}`);
  const canManage = Boolean(session && (isAdmin(session) || artifact.ownerId === session.user.id));

  return (
    <>
      {isPublic ? (
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
              isPartOf: project ? { "@type": "CollectionPage", name: project.name, url: absoluteUrl(`/research/p/${project.slug}`) } : undefined,
              author: { "@type": "Organization", name: "Bakerization", url: absoluteUrl("/") },
              publisher: { "@type": "Organization", name: "Bakerization", url: absoluteUrl("/") },
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Research", item: absoluteUrl("/research") },
                ...(project ? [{ "@type": "ListItem", position: 2, name: project.name, item: absoluteUrl(`/research/p/${project.slug}`) }] : []),
                { "@type": "ListItem", position: project ? 3 : 2, name: artifact.title, item: viewerUrl },
              ],
            },
          ]}
        />
      ) : null}
      <ArtifactViewer
        artifact={session ? artifact : toPublicArtifact(artifact)}
        project={project}
        canManage={canManage}
        anonymous={!session}
        viewerUrl={viewerUrl}
      />
    </>
  );
}
