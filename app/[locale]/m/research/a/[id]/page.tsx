import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getAuthSession, isAdmin } from "@/lib/auth-server";
import { getArtifactMeta, toPublicArtifact } from "@/lib/research-store";
import { absoluteUrl } from "@/lib/seo";
import ArtifactViewer from "@/components/research/ArtifactViewer";

// Member view of an artifact (any visibility, with rename / visibility /
// delete controls). Rendered per request; never indexed (the anonymous twin
// emits the canonical URL and JSON-LD for public artifacts).

type Props = { params: Promise<{ locale: string; id: string }> };

const loadArtifact = cache(async (id: string) => getArtifactMeta(id));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [artifact, session] = await Promise.all([loadArtifact(id), getAuthSession()]);
  const canSeeTitle = artifact && (artifact.visibility === "public" || session);
  return { title: canSeeTitle ? artifact.title : "Research", robots: { index: false, follow: false } };
}

export default async function MemberArtifactPage({ params }: Props) {
  const { id } = await params;
  const [session, artifact] = await Promise.all([getAuthSession(), loadArtifact(id)]);
  if (!artifact) notFound();

  const isPublic = artifact.visibility === "public";
  // Stale cookie without a session: behave exactly like the anonymous page.
  if (!session && !isPublic) notFound();

  const project = { slug: artifact.projectSlug, name: artifact.projectName };
  const viewerUrl = absoluteUrl(`/research/a/${artifact.id}`);
  const canManage = Boolean(session && (isAdmin(session) || artifact.ownerId === session.user.id));

  return (
    <ArtifactViewer
      artifact={session ? artifact : toPublicArtifact(artifact)}
      project={project}
      canManage={canManage}
      anonymous={!session}
      viewerUrl={viewerUrl}
    />
  );
}
