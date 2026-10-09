import { ImageResponse } from "next/og";
import { WORDMARK_PATH, WORDMARK_VIEWBOX } from "@/components/brand/Wordmark";

// Shared renderer for the Open Graph images (1200×630 PNG).
// Colors mirror app/globals.css :root (CSS variables aren't available here).
// The card is the brand book's cover: a yellow field, green type, and the
// BAKERIZATION wordmark in the bottom-right corner.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const COLORS = { bg: "#fbd26b", ink: "#2f5340", rule: "rgba(47,83,64,.35)" };

const WORDMARK_SRC = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${WORDMARK_VIEWBOX}"><path fill="${COLORS.ink}" d="${WORDMARK_PATH}"/></svg>`
)}`;

/**
 * Noto Sans JP subset containing just `text` (Google Fonts returns TTF when no
 * browser User-Agent is sent). Null on any failure: the image still renders,
 * only Japanese glyphs would be missing.
 *
 * Both fetches use `force-cache` (Next's Data Cache, shared across function
 * instances) and the per-instance Map dedupes concurrent renders, so a given
 * title fetches from Google at most once.
 */
const fontCache = new Map<string, Promise<ArrayBuffer | null>>();

function loadFont(text: string): Promise<ArrayBuffer | null> {
  let pending = fontCache.get(text);
  if (!pending) {
    pending = (async () => {
      try {
        const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`;
        const css = await (await fetch(cssUrl, { cache: "force-cache" })).text();
        const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
        if (!src) return null;
        const res = await fetch(src, { cache: "force-cache" });
        return res.ok ? await res.arrayBuffer() : null;
      } catch {
        return null;
      }
    })();
    fontCache.set(text, pending);
  }
  return pending;
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
            borderBottom: `1px solid ${COLORS.rule}`,
            padding: "0 0 20px",
            fontSize: 24,
            letterSpacing: 2,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <span>-</span>
            {kicker}
          </span>
          <span>bakerization.com</span>
        </div>
        <div style={{ display: "flex", fontSize: titleSize, fontWeight: 700, lineHeight: 1.25, letterSpacing: -1 }}>{shownTitle}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 40 }}>
          <div style={{ display: "flex", fontSize: 28, lineHeight: 1.4, maxWidth: 700, opacity: 0.85 }}>{shownSubtitle}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 700, whiteSpace: "nowrap" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={WORDMARK_SRC} width={267} height={32} alt="Bakerization" />
            {brand === "research" ? <span>/ Research</span> : null}
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
