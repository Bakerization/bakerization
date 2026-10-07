import Link from "next/link";
import { C, FONTS } from "@/lib/theme";
import type { Locale } from "@/lib/locale";
import type { ResearchArtifactMeta, ResearchProject } from "@/lib/research-types";
import { getResearchCopy } from "@/lib/research-copy";
import { formatDate } from "@/lib/research-format";
import { PageFrame, SectionRule } from "@/components/research/ui-static";
import PublicArtifactCard from "@/components/research/PublicArtifactCard";

type Props = { locale: Locale; project: ResearchProject; artifacts: ResearchArtifactMeta[] };

/** /research/p/[slug] for visitors without a session: the project's public artifacts, read-only. */
export default function PublicProjectView({ locale, project, artifacts }: Props) {
  const t = getResearchCopy(locale).publicProject;
  return (
    <PageFrame>
      <SectionRule left={`▍PROJECT — /${project.slug}`} right={`${artifacts.length} REPORTS`} />
      <div style={{ marginBottom: 32, maxWidth: 760 }}>
        <Link href="/research" style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.16em", color: C.sub, textDecoration: "none" }}>
          {t.back}
        </Link>
        <h1 className="mob-h2" style={{ margin: "14px 0 0", fontFamily: FONTS.display, fontSize: 38, letterSpacing: -1, fontWeight: 700 }}>
          {project.name}
        </h1>
        {project.description ? <p style={{ margin: "10px 0 0", color: C.sub, fontSize: 15, lineHeight: 1.9 }}>{project.description}</p> : null}
        <p style={{ margin: "10px 0 0", fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.14em", color: C.sub }}>
          {t.reports(artifacts.length)} · {formatDate(project.updatedAt, locale)}
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: 18 }}>
        {artifacts.map((a, i) => (
          <PublicArtifactCard key={a.id} artifact={a} index={i} meta={formatDate(a.updatedAt, locale)} />
        ))}
      </div>
    </PageFrame>
  );
}
