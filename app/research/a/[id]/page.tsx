import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_URL } from "@/lib/auth";
import { isAdmin, requireMember } from "@/lib/auth-server";
import { getArtifactMeta, getProjectById } from "@/lib/research-store";
import { SetCrumbs } from "@/components/research/crumbs";
import ArtifactViewer from "@/components/research/ArtifactViewer";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const artifact = await getArtifactMeta(id);
  return { title: artifact ? `${artifact.title} | Research` : "Research", robots: { index: false, follow: false } };
}

export default async function ArtifactPage({ params }: Params) {
  const { id } = await params;
  const session = await requireMember(`/research/a/${id}`);
  const artifact = await getArtifactMeta(id);
  if (!artifact) notFound();
  const project = await getProjectById(artifact.projectId);
  if (!project) notFound();

  return (
    <>
      <SetCrumbs items={[{ label: "プロジェクト", href: "/research" }, { label: project.name, href: `/research/p/${project.slug}` }, { label: artifact.title }]} />
      <ArtifactViewer
        artifact={artifact}
        project={project}
        canDelete={isAdmin(session) || artifact.ownerId === session.user.id}
        viewerUrl={`${APP_URL}/research/a/${artifact.id}`}
      />
    </>
  );
}
