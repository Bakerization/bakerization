import Link from "next/link";
import { listPostSummaries } from "@/lib/blog-store";
import { getLocalizedPost } from "@/lib/blog-localize";
import type { Metadata } from "next";
import { localeFromParams } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";
import BlogImage from "@/components/blog/BlogImage";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { C, FONTS } from "@/lib/theme";
import {
  Inner,
  NAV_HEIGHT,
  NumberDot,
  RuleText,
  SectionCover,
  TextLink,
  labelText,
} from "@/components/brand/ui";

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
        paddingTop: NAV_HEIGHT,
      }}
    >
      <SectionCover as="h1" title="Journal" sub="ジャーナル" no="01" />

      <Inner className="mob-pad-v-sm" style={{ paddingTop: 72, paddingBottom: 120 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 24,
            marginBottom: 48,
          }}
        >
          {t.heading && (
            <RuleText style={{ fontSize: 18, lineHeight: 1.8, color: C.ink }}>{t.heading}</RuleText>
          )}
          <div style={{ marginLeft: "auto" }}>
            <LanguageSwitcher locale={locale} />
          </div>
        </div>

        {posts.length === 0 ? (
          <p
            style={{
              margin: 0,
              background: C.paper,
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
              columnGap: 28,
              rowGap: 64,
              alignItems: "start",
            }}
          >
            {posts.map((post, i) => {
              const localized = getLocalizedPost(post, locale);
              const date = new Date(post.updatedAt).toLocaleDateString(
                t.dateLocale
              );
              const lead = i % 3 === 0;
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "4 / 3",
                      background: C.paper,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {post.heroImageUrl ? (
                      <BlogImage
                        src={post.heroImageUrl}
                        alt={localized.title}
                        priority={i === 0}
                        sizes={
                          lead
                            ? "(max-width: 880px) 100vw, 520px"
                            : "(max-width: 880px) 100vw, 380px"
                        }
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <NumberDot
                        n={String(i + 1).padStart(2, "0")}
                        tone={i % 3 === 1 ? "green" : "yellow"}
                        size={64}
                      />
                    )}
                  </div>
                  <div style={{ ...labelText, marginTop: 20, color: C.sub }}>
                    {t.label} · {date}
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: lead ? 24 : 19,
                      fontWeight: 700,
                      lineHeight: 1.45,
                      color: C.ink,
                    }}
                  >
                    {localized.title}
                  </div>
                  {localized.excerpt ? (
                    <p
                      style={{
                        margin: "10px 0 0",
                        fontSize: 13,
                        lineHeight: 1.75,
                        color: C.sub,
                      }}
                    >
                      {localized.excerpt}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 72 }}>
          <TextLink href="/">
            ← {locale === "en" ? "Back to Home" : "トップへ戻る"}
          </TextLink>
        </div>
      </Inner>
    </main>
  );
}
