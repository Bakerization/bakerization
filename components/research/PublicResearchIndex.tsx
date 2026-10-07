import { C, FONTS } from "@/lib/theme";
import type { Locale } from "@/lib/locale";
import type { ResearchArtifactMeta, ResearchProject } from "@/lib/research-types";
import { getResearchCopy } from "@/lib/research-copy";
import { formatDate } from "@/lib/research-format";
import { Kicker, PageFrame, SectionRule } from "@/components/research/ui-static";
import ProjectCard from "@/components/research/ProjectCard";
import PublicArtifactCard from "@/components/research/PublicArtifactCard";

type Props = { locale: Locale; projects: ResearchProject[]; artifacts: ResearchArtifactMeta[] };

/** /research for visitors without a session: published research only, no member UI. */
export default function PublicResearchIndex({ locale, projects, artifacts }: Props) {
  const t = getResearchCopy(locale).publicIndex;
  const projectName = new Map(projects.map((p) => [p.id, p.name]));
  const total = projects.reduce((n, p) => n + p.artifactCount, 0);

  return (
    <PageFrame>
      <SectionRule left="▍BAKERIZATION — RESEARCH" right={`${total} REPORTS`} />

      <div style={{ marginBottom: 40, maxWidth: 760 }}>
        <h1 className="mob-h2" style={{ margin: 0, fontFamily: FONTS.display, fontSize: 44, letterSpacing: -1.2, fontWeight: 700 }}>
          {t.title}
        </h1>
        <p style={{ margin: "12px 0 0", color: C.sub, fontSize: 15, lineHeight: 1.9 }}>{t.lead}</p>
      </div>

      {total === 0 ? (
        <p style={{ border: `1px solid ${C.line}`, padding: 24, color: C.sub, fontSize: 14 }}>{t.empty}</p>
      ) : (
        <>
          <section aria-labelledby="rs-projects" style={{ marginBottom: 48 }}>
            <Kicker style={{ marginBottom: 16 }}>
              <span id="rs-projects">▍{t.projects}</span>
            </Kicker>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 18 }}>
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} footer={`${t.reports(p.artifactCount)} · ${t.updated(formatDate(p.updatedAt, locale))}`} />
              ))}
            </div>
          </section>

          <section aria-labelledby="rs-latest">
            <Kicker style={{ marginBottom: 16 }}>
              <span id="rs-latest">▍{t.latest}</span>
            </Kicker>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: 18 }}>
              {artifacts.map((a, i) => (
                <PublicArtifactCard
                  key={a.id}
                  artifact={a}
                  index={i}
                  meta={[projectName.get(a.projectId), formatDate(a.updatedAt, locale)].filter(Boolean).join(" · ")}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </PageFrame>
  );
}
