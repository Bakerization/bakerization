import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Bakerization — We Bake the Future";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    kicker: "WE BAKE THE FUTURE",
    title: "Bakerization",
    subtitle: "パン屋の社会課題を解決するために生まれた団体 — Solving the social challenges of bakeries",
  });
}
