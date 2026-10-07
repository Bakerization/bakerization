import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth-server";
import { localeFromParams } from "@/lib/locale";
import { getResearchCopy } from "@/lib/research-copy";
import { listProjects, listPublicArtifacts, listPublicProjects, toPublicArtifact } from "@/lib/research-store";
import { formatDate } from "@/lib/research-format";
import { C, FONTS } from "@/lib/theme";
import { PageFrame, SectionRule } from "@/components/research/ui-static";
import NewProjectForm from "@/components/research/NewProjectForm";
import ProjectCard from "@/components/research/ProjectCard";
import PublicResearchIndex from "@/components/research/PublicResearchIndex";
import { SetCrumbs } from "@/components/research/crumbs";

// Member view of /research: project board. A stale session cookie (session
// revoked) still lands here, so the public index is kept as the fallback.

const LATEST_LIMIT = 24;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFromParams(params);
  return {
    title: { absolute: locale === "en" ? "Bakerization Research — Projects" : "Bakerization Research — プロジェクト" },
    robots: { index: false, follow: false },
  };
}

export default async function MemberResearchIndexPage({ params }: Props) {
  const [session, locale] = await Promise.all([getAuthSession(), localeFromParams(params)]);
  const t = getResearchCopy(locale);

  if (!session) {
    const [projects, artifacts] = await Promise.all([listPublicProjects(), listPublicArtifacts({ limit: LATEST_LIMIT })]);
    return <PublicResearchIndex locale={locale} projects={projects} artifacts={artifacts.map(toPublicArtifact)} />;
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
