import Link from "next/link";
import { C, FONTS } from "@/lib/theme";
import type { ResearchArtifactMeta } from "@/lib/research-types";
import ArtifactThumb from "@/components/research/ArtifactThumb";

/** Read-only artifact tile for outsiders: live thumbnail, title, description, meta line. */
export default function PublicArtifactCard({ artifact, meta }: { artifact: ResearchArtifactMeta; meta: string }) {
  return (
    <Link
      href={`/research/a/${artifact.id}`}
      style={{ display: "flex", flexDirection: "column", height: "100%", background: C.card, border: `1.5px solid ${C.ink}`, color: C.ink, textDecoration: "none" }}
    >
      <ArtifactThumb id={artifact.id} title={artifact.title} fluid />
      <div style={{ padding: 16, display: "grid", gap: 8, alignContent: "start", flex: 1 }}>
        <h3 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 17, lineHeight: 1.4, letterSpacing: -0.3, fontWeight: 700 }}>{artifact.title}</h3>
        {artifact.description ? (
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: C.sub, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
            {artifact.description}
          </p>
        ) : null}
        <div style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.12em", color: C.sub, marginTop: "auto" }}>{meta}</div>
      </div>
    </Link>
  );
}
