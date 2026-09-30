import type { Metadata } from "next";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { APP_URL } from "@/lib/auth";
import { getAuthSession, isAdmin } from "@/lib/auth-server";
import { getArtifactMeta, getProjectById } from "@/lib/research-store";
import { SetCrumbs } from "@/components/research/crumbs";
import ArtifactViewer from "@/components/research/ArtifactViewer";

type Params = { params: Promise<{ id: string }> };

const loadArtifact = cache(async (id: string) => getArtifactMeta(id));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const artifact = await loadArtifact(id);
  if (!artifact || artifact.visibility !== "public") {
    return { title: artifact ? `${artifact.title} | Research` : "Research", robots: { index: false, follow: false } };
  }
  const url = `${APP_URL}/research/a/${artifact.id}`;
  const description = artifact.description || `${artifact.title} — Bakerization Research`;
  return {
    title: `${artifact.title} | Bakerization Research`,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true, nocache: false },
    openGraph: {
      type: "article",
      url,
      title: artifact.title,
      description,
      siteName: "Bakerization Research",
      locale: "ja_JP",
      publishedTime: artifact.createdAt,
      modifiedTime: artifact.updatedAt,
    },
    twitter: { card: "summary", title: artifact.title, description },
  };
}

export default async function ArtifactPage({ params }: Params) {
  const { id } = await params;
  const [session, artifact] = await Promise.all([getAuthSession(), loadArtifact(id)]);
  if (!artifact) notFound();

  const isPublic = artifact.visibility === "public";
  if (!session && !isPublic) {
    redirect(`/research/login?callbackUrl=${encodeURIComponent(`/research/a/${id}`)}`);
  }

  const project = session ? await getProjectById(artifact.projectId) : null;
  const viewerUrl = `${APP_URL}/research/a/${artifact.id}`;
  const canManage = Boolean(session && (isAdmin(session) || artifact.ownerId === session.user.id));

  const jsonLd = isPublic
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: artifact.title,
        description: artifact.description || undefined,
        datePublished: artifact.createdAt,
        dateModified: artifact.updatedAt,
        url: viewerUrl,
        author: { "@type": "Organization", name: "Bakerization", url: APP_URL },
        publisher: { "@type": "Organization", name: "Bakerization", url: APP_URL },
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
      <SetCrumbs
        items={
          project
            ? [{ label: "プロジェクト", href: "/research" }, { label: project.name, href: `/research/p/${project.slug}` }, { label: artifact.title }]
            : [{ label: artifact.title }]
        }
      />
      <ArtifactViewer
        artifact={artifact}
        project={project}
        canManage={canManage}
        anonymous={!session}
        viewerUrl={viewerUrl}
      />
    </>
  );
}
