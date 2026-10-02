import { ImageResponse } from "next/og";

// Shared renderer for the Open Graph images (1200×630 PNG).
// Colors mirror app/globals.css :root (CSS variables aren't available here).

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const COLORS = { bg: "#f6e9cf", ink: "#1c0e02", sub: "#6b4d2a", line: "#c7a973", accent: "#c8451a" };

/**
 * Noto Sans JP subset containing just `text` (Google Fonts returns TTF when no
 * browser User-Agent is sent). Null on any failure: the image still renders,
 * only Japanese glyphs would be missing.
 */
async function loadFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

function clamp(text: string, max: number) {
  const chars = Array.from(text.trim());
  return chars.length > max ? `${chars.slice(0, max - 1).join("")}…` : chars.join("");
}

export async function renderOgImage({
  kicker,
  title,
  subtitle,
  brand = "site",
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  brand?: "site" | "research";
}) {
  const shownTitle = clamp(title, 80);
  const shownSubtitle = subtitle ? clamp(subtitle, 60) : "";
  const length = Array.from(shownTitle).length;
  const titleSize = length > 48 ? 54 : length > 26 ? 66 : 84;
  const font = await loadFont(`${kicker}${shownTitle}${shownSubtitle}Bakerization/Research bakerization.com…`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: COLORS.bg,
          color: COLORS.ink,
          padding: "60px 72px",
          fontFamily: font ? "Noto Sans JP" : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `3px solid ${COLORS.ink}`,
            borderBottom: `1px solid ${COLORS.line}`,
            padding: "16px 0",
            fontSize: 24,
            letterSpacing: 4,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 14, color: COLORS.accent }}>
            <span style={{ width: 6, height: 26, background: COLORS.accent }} />
            {kicker}
          </span>
          <span style={{ color: COLORS.sub }}>bakerization.com</span>
        </div>
        <div style={{ display: "flex", fontSize: titleSize, fontWeight: 700, lineHeight: 1.25, letterSpacing: -1 }}>{shownTitle}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 40 }}>
          <div style={{ display: "flex", fontSize: 28, color: COLORS.sub, lineHeight: 1.4, maxWidth: 700 }}>{shownSubtitle}</div>
          <div style={{ display: "flex", gap: 12, fontSize: 34, fontWeight: 700, whiteSpace: "nowrap" }}>
            <span>Bakerization</span>
            {brand === "research" ? <span style={{ color: COLORS.accent }}>/</span> : null}
            {brand === "research" ? <span>Research</span> : null}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: font ? [{ name: "Noto Sans JP", data: font, weight: 700, style: "normal" }] : undefined,
    }
  );
}
