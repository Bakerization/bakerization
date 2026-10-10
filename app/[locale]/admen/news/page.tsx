import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-server";
import { formatNewsDate } from "@/lib/news-format";
import { listNewsSummaries } from "@/lib/news-store";
import { C, FONTS } from "@/lib/theme";

export const metadata: Metadata = {
  title: "ニュース管理",
  robots: { index: false, follow: false },
};

const smallButton = {
  padding: "10px 14px",
  fontFamily: FONTS.mono,
  fontSize: 11,
  letterSpacing: "0.2em",
  textDecoration: "none",
  textTransform: "uppercase",
} as const;

export default async function AdmenNewsPage() {
  await requireAdmin("/admen/news");
  const items = await listNewsSummaries({ includeUnpublished: true });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.ink,
        fontFamily: FONTS.body,
        paddingTop: 96,
      }}
    >
      <div className="mob-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 48px 96px" }}>
        <div
          className="mob-flex-wrap"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            borderTop: `1px solid ${C.line}`,
            borderBottom: `1px solid ${C.line}`,
            padding: "16px 0",
            marginBottom: 40,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: C.accent,
            }}
          >
            ▍ADMEN — News
          </span>
          <Link
            href="/admen/news/new"
            style={{
              background: C.accent,
              color: C.bg,
              padding: "12px 20px",
              fontFamily: FONTS.body,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.3,
              textDecoration: "none",
            }}
          >
            ニュースを追加 →
          </Link>
        </div>

        <h1
          className="mob-h3"
          style={{
            margin: 0,
            fontFamily: FONTS.display,
            fontSize: 56,
            lineHeight: 1.1,
            letterSpacing: -2,
            fontWeight: 700,
            color: C.ink,
          }}
        >
          ニュース管理
        </h1>
        <p
          style={{
            marginTop: 12,
            fontSize: 14,
            color: C.sub,
            fontFamily: FONTS.mono,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {items.length} entries · {items.filter((n) => n.published).length} published
        </p>

        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map((item) => (
            <article
              key={item.slug}
              className="mob-1col"
              style={{
                background: C.card,
                border: `1.5px solid ${C.line}`,
                padding: 24,
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 20,
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    color: item.published ? C.accent : C.sub,
                    textTransform: "uppercase",
                  }}
                >
                  {item.published ? "公開中" : "下書き"} · 掲載日 {formatNewsDate(item.publishedAt)}
                  {item.hasEnglish ? " · EN" : ""}
                </div>
                <h2
                  style={{
                    margin: "8px 0 4px",
                    fontFamily: FONTS.display,
                    fontSize: 22,
                    fontWeight: 700,
                    color: C.ink,
                  }}
                >
                  {item.title || item.titleEn || "(no title)"}
                </h2>
                <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: C.sub }}>/news/{item.slug}</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {item.published ? (
                  <Link
                    href={`/news/${item.slug}`}
                    style={{ ...smallButton, border: `1px solid ${C.line}`, color: C.sub }}
                  >
                    表示
                  </Link>
                ) : null}
                <Link
                  href={`/admen/news/edit/${item.slug}`}
                  style={{ ...smallButton, background: C.accent, color: C.bg, fontWeight: 700 }}
                >
                  編集
                </Link>
              </div>
            </article>
          ))}
          {items.length === 0 && (
            <p
              style={{
                border: `1.5px solid ${C.line}`,
                background: C.card,
                padding: 32,
                color: C.sub,
                fontSize: 14,
              }}
            >
              まだニュースがありません。「ニュースを追加」から始めてください。
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
