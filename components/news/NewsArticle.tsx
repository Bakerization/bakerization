import Link from "next/link";
import BlogImage from "@/components/blog/BlogImage";
import JsonLd from "@/components/JsonLd";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NewsMarkdown from "@/components/news/NewsMarkdown";
import type { Locale } from "@/lib/locale";
import { formatNewsDate, localizeNews } from "@/lib/news-format";
import type { NewsItem } from "@/lib/news-types";
import { absoluteUrl } from "@/lib/seo";
import { C, FONTS } from "@/lib/theme";

/** A news entry: single reading column, date, title, optional cover, Markdown body. */
export default function NewsArticle({ item, locale }: { item: NewsItem; locale: Locale }) {
  const localized = localizeNews(item, locale);
  const en = locale === "en";
  const url = absoluteUrl(`/news/${item.slug}`);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: localized.title,
          description: localized.summary || undefined,
          image: item.coverImageUrl
            ? [item.coverImageUrl.startsWith("/") ? absoluteUrl(item.coverImageUrl) : item.coverImageUrl]
            : [absoluteUrl("/opengraph-image")],
          datePublished: item.publishedAt,
          dateModified: item.updatedAt,
          url,
          mainEntityOfPage: url,
          inLanguage: localized.lang,
          author: { "@type": "Organization", name: "Bakerization", url: absoluteUrl("/") },
          publisher: { "@type": "Organization", name: "Bakerization", url: absoluteUrl("/") },
        }}
      />
      <main
        style={{
          minHeight: "100vh",
          background: C.bg,
          color: C.ink,
          fontFamily: FONTS.body,
          paddingTop: 64,
        }}
      >
        <div className="mob-pad" style={{ maxWidth: 888, margin: "0 auto", padding: "32px 64px 96px" }}>
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
            <Link
              href="/news"
              style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: C.accent,
                textDecoration: "none",
              }}
            >
              ▍NEWS
            </Link>
            <LanguageSwitcher locale={locale} />
          </div>

          <time
            dateTime={item.publishedAt}
            style={{
              display: "block",
              fontFamily: FONTS.mono,
              fontSize: 12,
              letterSpacing: "0.24em",
              color: C.sub,
              marginBottom: 18,
            }}
          >
            {formatNewsDate(item.publishedAt)}
          </time>
          <h1
            className="mob-h3"
            style={{
              margin: 0,
              fontFamily: FONTS.display,
              fontSize: 44,
              lineHeight: 1.25,
              letterSpacing: -1,
              fontWeight: 700,
              color: C.ink,
            }}
          >
            {localized.title}
          </h1>
          <div style={{ marginTop: 24, width: 80, height: 3, background: C.accent }} />
          {localized.summary ? (
            <p style={{ margin: "24px 0 0", fontSize: 17, lineHeight: 1.9, color: C.sub }}>
              {localized.summary}
            </p>
          ) : null}

          {item.coverImageUrl ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16/9",
                overflow: "hidden",
                marginTop: 36,
                border: `1px solid ${C.line}`,
              }}
            >
              <BlogImage
                src={item.coverImageUrl}
                alt={localized.title}
                priority
                sizes="(max-width: 880px) 100vw, 760px"
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
          ) : null}

          <article lang={localized.lang} style={{ marginTop: 40 }}>
            <NewsMarkdown source={localized.bodyMd} />
          </article>

          <div style={{ marginTop: 64, borderTop: `1px solid ${C.line}`, paddingTop: 24 }}>
            <Link
              href="/news"
              style={{
                fontFamily: FONTS.mono,
                fontSize: 12,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: C.accent,
                textDecoration: "none",
              }}
            >
              ← {en ? "All news" : "ニュース一覧へ"}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
