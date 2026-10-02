import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth-server";
import { getServerLocale } from "@/lib/i18n";
import { getResearchCopy } from "@/lib/research-copy";
import { listProjects, listPublicArtifacts, listPublicProjects, toPublicArtifact } from "@/lib/research-store";
import { formatDate } from "@/lib/research-format";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { C, FONTS } from "@/lib/theme";
import { PageFrame, SectionRule } from "@/components/research/ui";
import NewProjectForm from "@/components/research/NewProjectForm";
import ProjectCard from "@/components/research/ProjectCard";
import PublicResearchIndex from "@/components/research/PublicResearchIndex";
import { SetCrumbs } from "@/components/research/crumbs";
import JsonLd from "@/components/JsonLd";

const LATEST_LIMIT = 24;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
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

export default async function ResearchIndexPage() {
  const [session, locale] = await Promise.all([getAuthSession(), getServerLocale()]);
  const t = getResearchCopy(locale);

  if (!session) {
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

  const projects = await listProjects();
  return (
    <PageFrame>
      <SetCrumbs items={[{ label: t.header.projects }]} />
      <SectionRule left="▍RESEARCH — PROJECTS" right={`${projects.length} PROJECTS`} />

      <div className="mob-flex-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 40, letterSpacing: -1.2, fontWeight: 700 }} className="mob-h2">
            {t.index.title}
          </h1>
          <p style={{ margin: "10px 0 0", color: C.sub, fontSize: 14, lineHeight: 1.8 }}>{t.index.lead}</p>
        </div>
        <NewProjectForm />
      </div>

      {projects.length === 0 ? (
        <p style={{ border: `1px solid ${C.line}`, padding: 24, color: C.sub, fontSize: 14 }}>{t.index.empty}</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 18 }}>
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              kicker={p.isDefault ? "▍DEFAULT" : undefined}
              footer={`${t.index.count(p.artifactCount)} · ${t.index.updated(formatDate(p.updatedAt, locale))}`}
            />
          ))}
        </div>
      )}
    </PageFrame>
  );
}
