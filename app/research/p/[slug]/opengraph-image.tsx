import { getPublicProjectBySlug } from "@/lib/research-store";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Bakerization Research";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublicProjectBySlug(slug).catch(() => null);
  if (!project) {
    return renderOgImage({ kicker: "RESEARCH", title: "Bakerization Research", brand: "research" });
  }
  return renderOgImage({
    kicker: `PROJECT — /${project.slug}`,
    title: project.name,
    subtitle: project.description || `${project.artifactCount} ${project.artifactCount === 1 ? "report" : "reports"}`,
    brand: "research",
  });
}
