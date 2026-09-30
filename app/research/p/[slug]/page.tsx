import { notFound } from "next/navigation";
import { requireMember } from "@/lib/auth-server";
import { getProjectBySlug, listArtifacts, listProjects } from "@/lib/research-store";
import { PageFrame } from "@/components/research/ui";
import { SetCrumbs } from "@/components/research/crumbs";
import ProjectBoard from "@/components/research/ProjectBoard";

type Params = { params: Promise<{ slug: string }> };

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const session = await requireMember(`/research/p/${slug}`);
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const [artifacts, projects] = await Promise.all([listArtifacts(project.id), listProjects()]);

  return (
    <PageFrame>
      <SetCrumbs items={[{ label: "プロジェクト", href: "/research" }, { label: project.name }]} />
      <ProjectBoard
        project={project}
        projects={projects}
        initialArtifacts={artifacts}
        viewer={{ id: session.user.id, role: session.user.role ?? "member" }}
      />
    </PageFrame>
  );
}
