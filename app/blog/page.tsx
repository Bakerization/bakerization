import Link from "next/link";
import { listPosts } from "@/lib/blog-store";
import { getLocalizedPost } from "@/lib/blog-localize";
import { getServerLocale } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export const metadata = {
  title: "Journal | Bakerization",
  description: "Bakerizationの活動や知見を紹介するジャーナルです。",
};

const PALETTE = {
  bg: "#0e0700",
  paper: "#f6e7c9",
  card: "#1b0e02",
  ink: "#f6e7c9",
  sub: "#a88a5e",
  line: "#3a2710",
  accent: "#e89a1f",
};

const FONTS = {
  display:
    '"Space Grotesk", "Zen Kaku Gothic Antique", "Noto Sans JP", sans-serif',
  body: '"Zen Kaku Gothic Antique", "Noto Sans JP", sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

export default async function BlogListPage() {
  const locale = await getServerLocale();
  const posts = await listPosts(false);
  const t =
    locale === "en"
      ? {
          label: "Journal",
          heading: "Latest notes from the field.",
          admin: "Admin",
          empty: "No published entries yet.",
          dateLocale: "en-US",
        }
      : {
          label: "ジャーナル",
          heading: "現場から、最新の記録。",
          admin: "管理画面",
          empty: "公開中の記事はまだありません。",
          dateLocale: "ja-JP",
        };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: PALETTE.bg,
        color: PALETTE.ink,
        fontFamily: FONTS.body,
        paddingTop: 96,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 64px 96px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            borderTop: `1px solid ${PALETTE.line}`,
            borderBottom: `1px solid ${PALETTE.line}`,
            padding: "16px 0",
            marginBottom: 48,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: PALETTE.accent,
            }}
          >
            ▍SECTION IV — {t.label}
          </span>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: PALETTE.sub,
            }}
          >
            JOURNAL · p. 008
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            marginBottom: 56,
          }}
        >
          <h1
            style={{
              fontFamily: FONTS.display,
              fontSize: 84,
              lineHeight: 1.05,
              letterSpacing: -3,
              fontWeight: 700,
              color: PALETTE.ink,
              margin: 0,
            }}
          >
            {t.heading}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <LanguageSwitcher locale={locale} />
            <Link
              href="/admin"
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: PALETTE.sub,
                border: `1px solid ${PALETTE.line}`,
                padding: "10px 14px",
                textDecoration: "none",
              }}
            >
              {t.admin}
            </Link>
          </div>
        </div>

        {posts.length === 0 ? (
          <p
            style={{
              border: `1.5px solid ${PALETTE.ink}`,
              background: PALETTE.card,
              padding: 32,
              color: PALETTE.sub,
              fontSize: 14,
            }}
          >
            {t.empty}
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr",
              gap: 18,
            }}
          >
            {posts.map((post, i) => {
              const localized = getLocalizedPost(post, locale);
              const date = new Date(post.updatedAt).toLocaleDateString(
                t.dateLocale
              );
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  style={{
                    background: PALETTE.card,
                    border: `1.5px solid ${PALETTE.ink}`,
                    padding: i === 0 ? 32 : 28,
                    minHeight: i === 0 ? 420 : 360,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div>
                    {post.heroImageUrl ? (
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: i === 0 ? "16/9" : "4/3",
                          overflow: "hidden",
                          marginBottom: 20,
                          border: `1px solid ${PALETTE.line}`,
                        }}
                      >
                        <img
                          src={post.heroImageUrl}
                          alt={localized.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            filter: "saturate(.9) contrast(1.05)",
                          }}
                        />
                      </div>
                    ) : null}
                    <div
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 11,
                        letterSpacing: "0.24em",
                        color: PALETTE.accent,
                        textTransform: "uppercase",
                        marginBottom: 14,
                      }}
                    >
                      {t.label} · {date}
                    </div>
                    <div
                      style={{
                        fontSize: i === 0 ? 28 : 22,
                        fontWeight: 700,
                        color: PALETTE.ink,
                        lineHeight: 1.35,
                      }}
                    >
                      {localized.title}
                    </div>
                    <p
                      style={{
                        marginTop: 10,
                        fontSize: 13,
                        color: PALETTE.sub,
                        lineHeight: 1.7,
                      }}
                    >
                      {localized.excerpt}
                    </p>
                  </div>
                  <div
                    style={{
                      marginTop: 24,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: `1px solid ${PALETTE.line}`,
                      paddingTop: 14,
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      letterSpacing: "0.22em",
                      color: PALETTE.ink,
                    }}
                  >
                    <span>NOTE.{String(i + 1).padStart(2, "0")}</span>
                    <span>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <Link
            href="/"
            style={{
              fontFamily: FONTS.mono,
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: PALETTE.accent,
              textDecoration: "none",
            }}
          >
            ← {locale === "en" ? "Back to Home" : "トップへ戻る"}
          </Link>
        </div>
      </div>
    </main>
  );
}
