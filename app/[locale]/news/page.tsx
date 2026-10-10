import type { Metadata } from "next";
import Link from "next/link";
import BlobImage from "@/components/BlobImage";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { localeFromParams } from "@/lib/locale";
import { formatNewsDate, localizeNews } from "@/lib/news-format";
import { listNewsSummaries } from "@/lib/news-store";
import { pageMetadata } from "@/lib/seo";
import { C, FONTS } from "@/lib/theme";
import { Inner, NAV_HEIGHT, SectionCover, TextLink, labelText } from "@/components/brand/ui";

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
        paddingTop: NAV_HEIGHT,
      }}
    >
      <SectionCover as="h1" title="News" sub="お知らせ" no="01" />

      <Inner className="mob-pad-v-sm" style={{ paddingTop: 72, paddingBottom: 120 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 28 }}>
          <LanguageSwitcher locale={locale} />
        </div>

        {items.length === 0 ? (
          <p
            style={{
              margin: 0,
              background: C.paper,
              padding: 32,
              color: C.sub,
              fontSize: 14,
            }}
          >
            {en ? "No news yet." : "現在お知らせはありません。"}
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: `1px solid ${C.ink}` }}>
            {items.map((item, i) => {
              const localized = localizeNews(item, locale);
              return (
                <li key={item.slug} style={{ borderBottom: `1px solid ${C.line}` }}>
                  <Link
                    href={`/news/${item.slug}`}
                    className="news-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: item.coverImageUrl ? "140px 1fr 220px" : "140px 1fr",
                      gap: 32,
                      alignItems: "start",
                      padding: "32px 0",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <time dateTime={item.publishedAt} style={{ ...labelText, color: C.sub, paddingTop: 5 }}>
                      {formatNewsDate(item.publishedAt)}
                    </time>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.55, color: C.ink }}>
                        {localized.title}
                      </div>
                      {localized.summary ? (
                        <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.85, color: C.sub }}>
                          {localized.summary}
                        </p>
                      ) : null}
                      <div style={{ ...labelText, marginTop: 18, color: C.ink }}>
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
                          background: C.paper,
                        }}
                      >
                        <BlobImage
                          src={item.coverImageUrl}
                          alt={localized.title}
                          priority={i === 0}
                          sizes="(max-width: 880px) 100vw, 220px"
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div style={{ marginTop: 72 }}>
          <TextLink href="/">← {en ? "Back to Home" : "トップへ戻る"}</TextLink>
        </div>
      </Inner>
    </main>
  );
}
