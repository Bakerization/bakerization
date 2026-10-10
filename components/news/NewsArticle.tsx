import Link from "next/link";
import BlobImage from "@/components/BlobImage";
import JsonLd from "@/components/JsonLd";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import NewsMarkdown from "@/components/news/NewsMarkdown";
import type { Locale } from "@/lib/locale";
import { formatNewsDate, localizeNews } from "@/lib/news-format";
import type { NewsItem } from "@/lib/news-types";
import { absoluteUrl } from "@/lib/seo";
import { C, FONTS } from "@/lib/theme";
import { Inner, NAV_HEIGHT, RuleText, SubLabel, TextLink, labelText } from "@/components/brand/ui";

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
          paddingTop: NAV_HEIGHT,
        }}
      >
        <Inner className="mob-pad-v-sm" style={{ maxWidth: 888, paddingTop: 72, paddingBottom: 120 }}>
          <div
            className="mob-flex-wrap"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 36,
            }}
          >
            <Link href="/news" style={{ textDecoration: "none" }}>
              <SubLabel style={{ marginBottom: 0 }}>News</SubLabel>
            </Link>
            <LanguageSwitcher locale={locale} />
          </div>

          <h1
            className="mob-h3"
            style={{
              margin: 0,
              fontFamily: FONTS.display,
              fontSize: 48,
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
              fontWeight: 500,
              color: C.ink,
            }}
          >
            {localized.title}
          </h1>
          <time dateTime={item.publishedAt} style={{ ...labelText, display: "block", marginTop: 20, color: C.sub }}>
            {formatNewsDate(item.publishedAt)}
          </time>
          {localized.summary ? (
            <RuleText style={{ marginTop: 32, fontSize: 17, lineHeight: 1.9 }}>{localized.summary}</RuleText>
          ) : null}

          {item.coverImageUrl ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16/9",
                overflow: "hidden",
                marginTop: 40,
                background: C.paper,
              }}
            >
              <BlobImage
                src={item.coverImageUrl}
                alt={localized.title}
                priority
                sizes="(max-width: 880px) 100vw, 760px"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : null}

          <article lang={localized.lang} style={{ marginTop: 48 }}>
            <NewsMarkdown source={localized.bodyMd} />
          </article>

          <div style={{ marginTop: 72, borderTop: `1px solid ${C.ink}`, paddingTop: 24 }}>
            <TextLink href="/news">← {en ? "All news" : "ニュース一覧へ"}</TextLink>
          </div>
        </Inner>
      </main>
    </>
  );
}
