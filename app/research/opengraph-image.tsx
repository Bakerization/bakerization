import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Bakerization Research";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    kicker: "RESEARCH",
    title: "Bakerization Research",
    subtitle: "公開リサーチ一覧 — Published research on bakeries, food and technology",
    brand: "research",
  });
}
