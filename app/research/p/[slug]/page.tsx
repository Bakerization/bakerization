import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import { getServerLocale } from "@/lib/i18n";
import { getResearchCopy } from "@/lib/research-copy";
import {
  getProjectBySlug,
  getPublicProjectBySlug,
  listArtifacts,
  listProjects,
  listPublicArtifacts,
  toPublicArtifact,
} from "@/lib/research-store";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { PageFrame } from "@/components/research/ui";
import { SetCrumbs } from "@/components/research/crumbs";
import ProjectBoard from "@/components/research/ProjectBoard";
import PublicProjectView from "@/components/research/PublicProjectView";
import JsonLd from "@/components/JsonLd";

type Params = { params: Promise<{ slug: string }> };

/** The project as outsiders see it; null when it has no public artifacts. */
const loadPublicProject = cache(async (slug: string) => getPublicProjectBySlug(slug));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [locale, publicProject] = await Promise.all([getServerLocale(), loadPublicProject(slug)]);
  if (!publicProject) {
    const session = await getAuthSession();
    const project = session ? await getProjectBySlug(slug) : null;
    return { title: project?.name ?? "Research", robots: { index: false, follow: false } };
  }
  const t = getResearchCopy(locale);
  return pageMetadata({
    path: `/research/p/${publicProject.slug}`,
    locale,
    title: publicProject.name,
    description: publicProject.description || t.meta.projectDescription(publicProject.name),
    siteName: "Bakerization Research",
    images: [`/research/p/${publicProject.slug}/opengraph-image`],
  });
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const [session, locale] = await Promise.all([getAuthSession(), getServerLocale()]);
  const t = getResearchCopy(locale);

  if (!session) {
    const project = await loadPublicProject(slug);
    if (!project) notFound();
    const artifacts = (await listPublicArtifacts({ projectId: project.id })).map(toPublicArtifact);
    const pageUrl = absoluteUrl(`/research/p/${project.slug}`);
    return (
      <>
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: project.name,
              description: project.description || t.meta.projectDescription(project.name),
              url: pageUrl,
              inLanguage: locale,
              isPartOf: { "@type": "CollectionPage", name: "Bakerization Research", url: absoluteUrl("/research") },
              mainEntity: {
                "@type": "ItemList",
                itemListElement: artifacts.map((a, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  url: absoluteUrl(`/research/a/${a.id}`),
                  name: a.title,
                })),
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Research", item: absoluteUrl("/research") },
                { "@type": "ListItem", position: 2, name: project.name, item: pageUrl },
              ],
            },
          ]}
        />
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
