import type { Metadata } from "next";
import Link from "next/link";
import BlogImage from "@/components/blog/BlogImage";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { localeFromParams } from "@/lib/locale";
import { formatNewsDate, localizeNews } from "@/lib/news-format";
import { listNewsSummaries } from "@/lib/news-store";
import { pageMetadata } from "@/lib/seo";
import { C, FONTS } from "@/lib/theme";

// ISR, purged by the news store on every change; hourly revalidate as a safety net.
export const revalidate = 3600;
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFromParams(params);
  return pageMetadata({
    path: "/news",
    locale,
    title: "News",
    description:
      locale === "en"
        ? "News from Bakerization: events, announcements and updates."
        : "Bakerizationからのお知らせ。イベント情報や活動のニュースをお届けします。",
  });
}

export default async function NewsListPage({ params }: Props) {
  const locale = await localeFromParams(params);
  const items = await listNewsSummaries();
  const en = locale === "en";

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
      <div className="mob-pad" style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 64px 96px" }}>
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
            ▍NEWS — {en ? "Announcements" : "お知らせ"}
          </span>
          <LanguageSwitcher locale={locale} />
        </div>

        <h1
          className="mob-h2"
          style={{
            fontFamily: FONTS.display,
            fontSize: 72,
            lineHeight: 1.05,
            letterSpacing: -3,
            fontWeight: 700,
            color: C.ink,
            margin: "0 0 48px",
          }}
        >
          News
        </h1>

        {items.length === 0 ? (
          <p
            style={{
              border: `1.5px solid ${C.ink}`,
              background: C.card,
              padding: 32,
              color: C.sub,
              fontSize: 14,
            }}
          >
            {en ? "No news yet." : "現在お知らせはありません。"}
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: `1.5px solid ${C.ink}` }}>
            {items.map((item, i) => {
              const localized = localizeNews(item, locale);
              return (
                <li key={item.slug} style={{ borderBottom: `1px solid ${C.line}` }}>
                  <Link
                    href={`/news/${item.slug}`}
                    className="news-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: item.coverImageUrl ? "140px 1fr 200px" : "140px 1fr",
                      gap: 28,
                      alignItems: "start",
                      padding: "28px 0",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <time
                      dateTime={item.publishedAt}
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 13,
                        letterSpacing: "0.16em",
                        color: C.accent,
                        paddingTop: 4,
                      }}
                    >
                      {formatNewsDate(item.publishedAt)}
                    </time>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.45, color: C.ink }}>
                        {localized.title}
                      </div>
                      {localized.summary ? (
                        <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.8, color: C.sub }}>
                          {localized.summary}
                        </p>
                      ) : null}
                      <div
                        style={{
                          marginTop: 14,
                          fontFamily: FONTS.mono,
                          fontSize: 11,
                          letterSpacing: "0.22em",
                          color: C.ink,
                        }}
                      >
                        {en ? "READ MORE" : "詳しく見る"} →
                      </div>
                    </div>
                    {item.coverImageUrl ? (
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "4/3",
                          overflow: "hidden",
                          border: `1px solid ${C.line}`,
                        }}
                      >
                        <BlogImage
                          src={item.coverImageUrl}
                          alt={localized.title}
                          priority={i === 0}
                          sizes="(max-width: 880px) 100vw, 200px"
                          style={{ objectFit: "cover", width: "100%", height: "100%" }}
                        />
                      </div>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
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
            ← {en ? "Back to Home" : "トップへ戻る"}
          </Link>
        </div>
      </div>
    </main>
  );
}
