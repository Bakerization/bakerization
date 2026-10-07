import Link from "next/link";
import { listPostSummaries } from "@/lib/blog-store";
import { getLocalizedPost } from "@/lib/blog-localize";
import type { Metadata } from "next";
import { localeFromParams } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import BlogImage from "@/components/blog/BlogImage";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { C, FONTS } from "@/lib/theme";

// ISR, purged by savePost(); hourly revalidate as a safety net.
export const revalidate = 3600;
type Props = { params: Promise<{ locale: string }> };


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFromParams(params);
  return pageMetadata({
    path: "/blog",
    locale,
    title: "Journal",
    description:
      locale === "en"
        ? "Bakerization's journal: notes on our activities and what we learn in the field."
        : "Bakerizationの活動や知見を紹介するジャーナルです。",
  });
}

export default async function BlogListPage({ params }: Props) {
  const locale = await localeFromParams(params);
  const posts = await listPostSummaries();
  const t =
    locale === "en"
      ? {
          label: "Journal",
          heading: "Latest notes from the field.",
          empty: "No published entries yet.",
          dateLocale: "en-US",
        }
      : {
          label: "ジャーナル",
          heading: "",
          empty: "公開中の記事はまだありません。",
          dateLocale: "ja-JP",
        };

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
      <div
        className="mob-pad"
        style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 64px 96px" }}
      >
        {/* Header */}
        <div
          className="mob-flex-wrap"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            borderTop: `1px solid ${C.line}`,
            borderBottom: `1px solid ${C.line}`,
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
              color: C.accent,
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
              color: C.sub,
            }}
          >
            JOURNAL · p. 008
          </span>
        </div>

        <div
          className="mob-stack"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            marginBottom: 56,
            gap: 24,
          }}
        >
          {t.heading && (
            <h1
              className="mob-h2"
              style={{
                fontFamily: FONTS.display,
                fontSize: 84,
                lineHeight: 1.05,
                letterSpacing: -3,
                fontWeight: 700,
                color: C.ink,
                margin: 0,
              }}
            >
              {t.heading}
            </h1>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <LanguageSwitcher locale={locale} />
          </div>
        </div>

        {posts.length === 0 ? (
          <p
            style={{
              border: `1.5px solid ${C.ink}`,
              background: C.card,
              padding: 32,
              color: C.sub,
              fontSize: 14,
            }}
          >
            {t.empty}
          </p>
        ) : (
          <div
            className="mob-1col"
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
                    background: C.card,
                    border: `1.5px solid ${C.ink}`,
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
                          position: "relative",
                          width: "100%",
                          aspectRatio: i === 0 ? "16/9" : "4/3",
                          overflow: "hidden",
                          marginBottom: 20,
                          border: `1px solid ${C.line}`,
                        }}
                      >
                        <BlogImage
                          src={post.heroImageUrl}
                          alt={localized.title}
                          priority={i === 0}
                          sizes={
                            i === 0
                              ? "(max-width: 880px) 100vw, 400px"
                              : "(max-width: 880px) 100vw, 280px"
                          }
                          style={{
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
                        color: C.accent,
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
                        color: C.ink,
                        lineHeight: 1.35,
                      }}
                    >
                      {localized.title}
                    </div>
                    <p
                      style={{
                        marginTop: 10,
                        fontSize: 13,
                        color: C.sub,
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
                      borderTop: `1px solid ${C.line}`,
                      paddingTop: 14,
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      letterSpacing: "0.22em",
                      color: C.ink,
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
              color: C.accent,
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
