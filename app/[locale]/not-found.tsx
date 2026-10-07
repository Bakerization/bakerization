import Link from "next/link";
import { C, FONTS } from "@/lib/theme";

// Branded 404 inside the root layout (fonts, nav, footer). not-found can't
// read route params, so it is bilingual by design.
export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: FONTS.body, paddingTop: 96 }}>
      <div className="mob-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 64px 96px" }}>
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: C.accent,
            borderTop: `1px solid ${C.line}`,
            borderBottom: `1px solid ${C.line}`,
            padding: "16px 0",
            marginBottom: 40,
          }}
        >
          ▍404 — NOT FOUND
        </div>
        <h1 className="mob-h2" style={{ margin: 0, fontFamily: FONTS.display, fontSize: 64, lineHeight: 1.05, letterSpacing: -2, fontWeight: 700 }}>
          Page not found.
        </h1>
        <p style={{ margin: "24px 0 0", fontSize: 16, lineHeight: 1.9, color: C.sub, maxWidth: 560 }}>
          お探しのページは見つかりませんでした。URL が変わったか、削除された可能性があります。
          <br />
          The page you are looking for doesn&apos;t exist or has moved.
        </p>
        <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              fontFamily: FONTS.mono,
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: C.bg,
              background: C.accent,
              padding: "12px 18px",
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>
          <Link
            href="/research"
            style={{
              fontFamily: FONTS.mono,
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: C.ink,
              border: `1px solid ${C.line}`,
              padding: "12px 18px",
              textDecoration: "none",
            }}
          >
            Research
          </Link>
        </div>
      </div>
    </main>
  );
}
