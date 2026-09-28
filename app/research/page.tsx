import Link from "next/link";
import { requireMember } from "@/lib/auth-server";
import { listProjects } from "@/lib/research-store";
import { C, FONTS } from "@/lib/theme";
import { PageFrame, SectionRule } from "@/components/research/ui";
import { formatDate } from "@/lib/research-format";
import NewProjectForm from "@/components/research/NewProjectForm";
import { SetCrumbs } from "@/components/research/crumbs";

export default async function ResearchIndexPage() {
  await requireMember("/research");
  const projects = await listProjects();

  return (
    <PageFrame>
      <SetCrumbs items={[{ label: "プロジェクト" }]} />
      <SectionRule left="▍RESEARCH — PROJECTS" right={`${projects.length} PROJECTS`} />

      <div className="mob-flex-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 40, letterSpacing: -1.2, fontWeight: 700 }} className="mob-h2">
            プロジェクト
          </h1>
          <p style={{ margin: "10px 0 0", color: C.sub, fontSize: 14, lineHeight: 1.8 }}>
            Claude が作った HTML アーティファクトをプロジェクト単位で整理します。Cowork / Claude からの公開先は「設定」で確認できます。
          </p>
        </div>
        <NewProjectForm />
      </div>

      {projects.length === 0 ? (
        <p style={{ border: `1px solid ${C.line}`, padding: 24, color: C.sub, fontSize: 14 }}>
          まだプロジェクトがありません。「新規プロジェクト」から作成してください。
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: 18 }}>
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/research/p/${p.slug}`}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 168,
                background: C.card,
                border: `1.5px solid ${C.ink}`,
                padding: 22,
                textDecoration: "none",
                color: C.ink,
              }}
            >
              <div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: p.isDefault ? C.accent : C.sub }}>
                  {p.isDefault ? "▍DEFAULT" : `▍/${p.slug}`}
                </div>
                <h2 style={{ margin: "10px 0 6px", fontFamily: FONTS.display, fontSize: 22, letterSpacing: -0.5, fontWeight: 700 }}>{p.name}</h2>
                {p.description ? (
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: C.sub, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                    {p.description}
                  </p>
                ) : null}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.14em", color: C.sub }}>
                <span>{p.artifactCount} 件 · 更新 {formatDate(p.updatedAt)}</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageFrame>
  );
}
