import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { LOCALES, localeFromParams } from "@/lib/locale";
import { getResearchCopy } from "@/lib/research-copy";
import { getPublicProjectBySlug, listPublicArtifacts, listPublicProjects, toPublicArtifact } from "@/lib/research-store";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { SetCrumbs } from "@/components/research/crumbs";
import PublicProjectView from "@/components/research/PublicProjectView";
import JsonLd from "@/components/JsonLd";

// Public project page (anonymous visitors). Known public projects are
// prerendered; new ones render on first request. Purged by research mutations.
export const revalidate = 600;
export const dynamicParams = true;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  try {
    const projects = await listPublicProjects();
    return LOCALES.flatMap((locale) => projects.map((p) => ({ locale, slug: p.slug })));
  } catch {
    return []; // database unreachable at build time: generate on demand instead
  }
}

/** The project as outsiders see it; null when it has no public artifacts. */
const loadPublicProject = cache(async (slug: string) => getPublicProjectBySlug(slug));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [locale, project] = await Promise.all([localeFromParams(params), loadPublicProject(slug)]);
  if (!project) return { title: "Research", robots: { index: false, follow: false } };
  const t = getResearchCopy(locale);
  return pageMetadata({
    path: `/research/p/${project.slug}`,
    locale,
    title: project.name,
    description: project.description || t.meta.projectDescription(project.name),
    siteName: "Bakerization Research",
    images: [`/research/p/${project.slug}/opengraph-image`],
  });
}

export default async function PublicProjectPage({ params }: Props) {
  const { slug } = await params;
  const [locale, project] = await Promise.all([localeFromParams(params), loadPublicProject(slug)]);
  if (!project) notFound();
  const t = getResearchCopy(locale);
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
