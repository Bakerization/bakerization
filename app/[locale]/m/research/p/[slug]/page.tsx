import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import { localeFromParams } from "@/lib/locale";
import { getResearchCopy } from "@/lib/research-copy";
import {
  getProjectBySlug,
  getPublicProjectBySlug,
  listArtifacts,
  listProjects,
  listPublicArtifacts,
  toPublicArtifact,
} from "@/lib/research-store";
import { PageFrame } from "@/components/research/ui-static";
import { SetCrumbs } from "@/components/research/crumbs";
import ProjectBoard from "@/components/research/ProjectBoard";
import PublicProjectView from "@/components/research/PublicProjectView";

// Member view of a project: the sortable board with upload / rename / move /
// delete. Rendered per request; never indexed (the anonymous twin is canonical).

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const session = await getAuthSession();
  const project = session ? await getProjectBySlug(slug) : await getPublicProjectBySlug(slug);
  return { title: project?.name ?? "Research", robots: { index: false, follow: false } };
}

export default async function MemberProjectPage({ params }: Props) {
  const { slug } = await params;
  const [session, locale] = await Promise.all([getAuthSession(), localeFromParams(params)]);
  const t = getResearchCopy(locale);

  if (!session) {
    // Stale cookie without a session: behave exactly like the anonymous page.
    const project = await getPublicProjectBySlug(slug);
    if (!project) notFound();
    const artifacts = (await listPublicArtifacts({ projectId: project.id })).map(toPublicArtifact);
    return (
      <>
        <SetCrumbs items={[{ label: t.header.projects, href: "/research" }, { label: project.name }]} />
        <PublicProjectView locale={locale} project={project} artifacts={artifacts} />
      </>
    );
  }

  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const [artifacts, projects] = await Promise.all([listArtifacts(project.id), listProjects()]);

  return (
    <PageFrame>
      <SetCrumbs items={[{ label: t.header.projects, href: "/research" }, { label: project.name }]} />
      <ProjectBoard
        project={project}
        projects={projects}
        initialArtifacts={artifacts}
        viewer={{ id: session.user.id, role: session.user.role ?? "member" }}
      />
    </PageFrame>
  );
}
