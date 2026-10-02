import { getArtifactMeta } from "@/lib/research-store";
import { formatDate } from "@/lib/research-format";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Bakerization Research";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artifact = await getArtifactMeta(id).catch(() => null);
  // Members-only (or missing) artifacts get the generic card: never leak a title.
  if (!artifact || artifact.visibility !== "public") {
    return renderOgImage({ kicker: "RESEARCH", title: "Bakerization Research", brand: "research" });
  }
  return renderOgImage({
    kicker: `RESEARCH — /${artifact.projectSlug}`,
    title: artifact.title,
    subtitle: artifact.description || formatDate(artifact.updatedAt),
    brand: "research",
  });
}
