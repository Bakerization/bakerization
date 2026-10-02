import Link from "next/link";
import { C, FONTS } from "@/lib/theme";
import type { ResearchProject } from "@/lib/research-types";

/** Project tile used by both the members' index and the public index. */
export default function ProjectCard({ project, footer, kicker }: { project: ResearchProject; footer: string; kicker?: string }) {
  return (
    <Link
      href={`/research/p/${project.slug}`}
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
        <div style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: kicker === "▍DEFAULT" ? C.accent : C.sub }}>
          {kicker ?? `▍/${project.slug}`}
        </div>
        <h2 style={{ margin: "10px 0 6px", fontFamily: FONTS.display, fontSize: 22, letterSpacing: -0.5, fontWeight: 700 }}>{project.name}</h2>
        {project.description ? (
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: C.sub, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
            {project.description}
          </p>
        ) : null}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.14em", color: C.sub }}>
        <span>{footer}</span>
        <span aria-hidden>→</span>
      </div>
    </Link>
  );
}
