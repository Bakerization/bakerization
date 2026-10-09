import Link from "next/link";
import type { ReactNode } from "react";
import { enrichHtmlWithToc, optimizeContentImages } from "@/lib/content-utils";
import BlogImage from "@/components/blog/BlogImage";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale } from "@/lib/locale";
import { getLocalizedPost, hasEnglishVersion } from "@/lib/blog-localize";
import { absoluteUrl } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import type { BlogPost, BlogPostSummary } from "@/lib/blog-types";
import { C, FONTS } from "@/lib/theme";
import {
  ContentHeading,
  Inner,
  NAV_HEIGHT,
  NumberDot,
  RuleText,
  SubLabel,
  TextLink,
  brandButtonStyle,
  labelText,
} from "@/components/brand/ui";

type Props = {
  post: BlogPost;
  /** Published posts (no bodies), newest first: prev / next / related. */
  summaries: BlogPostSummary[];
  locale: Locale;
  /** Admin preview: shows an edit link in the header row. */
  editHref?: string;
};

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((part) => part.length >= 2);
}

type RelatedText = Pick<BlogPost, "title" | "titleEn" | "excerpt" | "excerptEn">;

function relatedScore(base: RelatedText, target: RelatedText) {
  const baseTokens = new Set(
    tokenize(`${base.title} ${base.titleEn} ${base.excerpt} ${base.excerptEn}`)
  );
  const targetTokens = tokenize(
    `${target.title} ${target.titleEn} ${target.excerpt} ${target.excerptEn}`
  );
  let score = 0;
  for (const token of targetTokens) {
    if (baseTokens.has(token)) score += 1;
  }
  return score;
}

/** The journal article: used by the public (static) page and the admin preview. */
export default function BlogArticle({ post, summaries, locale, editHref }: Props) {
  const localized = getLocalizedPost(post, locale);
  const { html, toc } = enrichHtmlWithToc(optimizeContentImages(localized.contentHtml));
  const currentIndex = summaries.findIndex((item) => item.slug === post.slug);
  const prevPost = currentIndex >= 0 ? summaries[currentIndex + 1] ?? null : null;
  const nextPost = currentIndex > 0 ? summaries[currentIndex - 1] : null;
  const relatedPosts = summaries
    .filter((item) => item.slug !== post.slug)
    .map((item) => ({ item, score: relatedScore(post, item) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return +new Date(b.item.updatedAt) - +new Date(a.item.updatedAt);
    })
    .slice(0, 3)
    .map(({ item }) => item);

  const t =
    locale === "en"
      ? {
          backToBlog: "← Back to Journal",
          draft: "DRAFT",
          edit: "Edit this post",
          toc: "Table of Contents",
          noHeadings: "No headings.",
          previousPost: "Previous",
          nextPost: "Next",
          relatedPosts: "Related",
          noRelated: "No related entries.",
          dateLocale: "en-US",
          section: "Journal · Entry",
        }
      : {
          backToBlog: "← ジャーナル一覧へ",
          draft: "下書き",
          edit: "この記事を編集",
          toc: "目次",
          noHeadings: "見出しがありません。",
          previousPost: "前の記事",
          nextPost: "次の記事",
          relatedPosts: "関連記事",
          noRelated: "関連記事はまだありません。",
          dateLocale: "ja-JP",
          section: "ジャーナル · 記事",
        };

  const postUrl = absoluteUrl(`/blog/${post.slug}`);
  return (
    <>
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: localized.title,
        description: localized.excerpt || undefined,
        image: post.heroImageUrl ? [post.heroImageUrl] : [absoluteUrl("/opengraph-image")],
        datePublished: post.createdAt,
        dateModified: post.updatedAt,
        url: postUrl,
        mainEntityOfPage: postUrl,
        inLanguage: locale === "en" && hasEnglishVersion(post) ? "en" : "ja",
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
      <Inner className="mob-pad-v-sm" style={{ paddingTop: 72, paddingBottom: 0 }}>
        <div
          className="mob-flex-wrap"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 40,
          }}
        >
          <Link href="/blog" style={{ textDecoration: "none" }}>
            <SubLabel style={{ marginBottom: 0 }}>{t.section}</SubLabel>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <LanguageSwitcher locale={locale} />
            {editHref ? (
              <Link
                href={editHref}
                style={{ ...brandButtonStyle("green"), padding: "8px 16px", fontSize: 12 }}
              >
                {t.edit}
              </Link>
            ) : null}
          </div>
        </div>

        <div
          className="mob-1col"
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 64,
            alignItems: "start",
          }}
        >
          <div>
            <h1
              className="mob-h3"
              style={{
                margin: 0,
                fontFamily: FONTS.display,
                fontSize: 52,
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                fontWeight: 500,
                color: C.ink,
              }}
            >
              {localized.title}
            </h1>
            <div style={{ ...labelText, marginTop: 20, color: C.sub }}>
              {new Date(post.updatedAt).toLocaleDateString(t.dateLocale)}
              {!post.published && (
                <span
                  style={{
                    marginLeft: 12,
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: C.main,
                    color: C.onMain,
                  }}
                >
                  {t.draft}
                </span>
              )}
            </div>
            {localized.excerpt ? (
              <RuleText style={{ marginTop: 32, fontSize: 17, lineHeight: 1.95 }}>
                {localized.excerpt}
              </RuleText>
            ) : null}
          </div>
          <div
            style={{
              position: "relative",
              aspectRatio: "4/5",
              overflow: "hidden",
              background: C.paper,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {post.heroImageUrl ? (
              <BlogImage
                src={post.heroImageUrl}
                alt={localized.title}
                priority
                sizes="(max-width: 880px) 100vw, 520px"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span
                aria-hidden
                style={{ width: "46%", aspectRatio: "1", borderRadius: "50%", background: C.main }}
              />
            )}
          </div>
        </div>
      </Inner>

      <Inner
        className="mob-1col mob-pad-v-sm"
        style={{
          paddingTop: 96,
          paddingBottom: 0,
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 72,
        }}
      >
        <aside
          className="mob-toc-bottom"
          style={{
            position: "sticky",
            top: NAV_HEIGHT + 32,
            alignSelf: "start",
            borderTop: `1px solid ${C.ink}`,
            paddingTop: 22,
          }}
        >
          <AsideHeading>{t.toc}</AsideHeading>
          {toc.length === 0 ? (
            <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>
              {t.noHeadings}
            </p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {toc.map((item) => (
                <li
                  key={item.id}
                  style={{
                    borderBottom: `1px solid ${C.line}`,
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  <a
                    href={`#${item.id}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "12px 1fr",
                      gap: 10,
                      alignItems: "baseline",
                      padding: "10px 0",
                      paddingLeft: item.level === 3 ? 16 : 0,
                      color: item.level === 3 ? C.sub : C.ink,
                      fontWeight: item.level === 3 ? 400 : 500,
                      textDecoration: "none",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        display: "block",
                        height: item.level === 3 ? 1 : 4,
                        width: item.level === 3 ? 8 : 12,
                        background: item.level === 3 ? C.lineStrong : C.main,
                        transform: "translateY(-4px)",
                      }}
                    />
                    <span>{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div style={{ minWidth: 0 }}>
          <article
            className="blog-content-rich"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {(prevPost || nextPost) && (
          <div
            className="mob-1col"
            style={{
              marginTop: 72,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 28,
            }}
          >
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                style={{
                  borderTop: `1px solid ${C.ink}`,
                  paddingTop: 20,
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <span style={{ ...labelText, color: C.sub }}>
                  ← {t.previousPost}
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: C.ink,
                    lineHeight: 1.5,
                  }}
                >
                  {getLocalizedPost(prevPost, locale).title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextPost ? (
              <Link
                href={`/blog/${nextPost.slug}`}
                style={{
                  borderTop: `1px solid ${C.ink}`,
                  paddingTop: 20,
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  textAlign: "right",
                }}
              >
                <span style={{ ...labelText, color: C.sub }}>
                  {t.nextPost} →
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: C.ink,
                    lineHeight: 1.5,
                  }}
                >
                  {getLocalizedPost(nextPost, locale).title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
          )}
        </div>
      </Inner>

      <Inner className="mob-pad-v-sm" style={{ paddingTop: 120, paddingBottom: 120 }}>
        <ContentHeading title="Related" sub="関連記事" />
        {relatedPosts.length === 0 ? (
          <p
            style={{
              margin: 0,
              background: C.paper,
              padding: 28,
              fontSize: 14,
              color: C.sub,
            }}
          >
            {t.noRelated}
          </p>
        ) : (
          <div
            className="mob-1col"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 28,
              alignItems: "start",
            }}
          >
            {relatedPosts.map((related, i) => {
              const rel = getLocalizedPost(related, locale);
              return (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
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
                    {related.heroImageUrl ? (
                      <BlogImage
                        src={related.heroImageUrl}
                        alt={rel.title}
                        sizes="(max-width: 880px) 100vw, 380px"
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
                        tone={i === 1 ? "green" : "yellow"}
                        size={56}
                      />
                    )}
                  </div>
                  <div style={{ ...labelText, marginTop: 18, color: C.sub }}>
                    {new Date(related.updatedAt).toLocaleDateString(t.dateLocale)}
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 18,
                      fontWeight: 700,
                      lineHeight: 1.5,
                      color: C.ink,
                    }}
                  >
                    {rel.title}
                  </div>
                  {rel.excerpt ? (
                    <p
                      style={{
                        margin: "10px 0 0",
                        fontSize: 13,
                        lineHeight: 1.75,
                        color: C.sub,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {rel.excerpt}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 72 }}>
          <TextLink href="/blog">{t.backToBlog}</TextLink>
        </div>
      </Inner>
    </main>
    </>
  );
}

/** Small aside heading led by a short yellow bar (SubLabel, as a real heading). */
function AsideHeading({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        ...labelText,
        margin: "0 0 14px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: C.ink,
      }}
    >
      <span aria-hidden style={{ width: 18, height: 6, background: C.main, flexShrink: 0 }} />
      <span>{children}</span>
    </h2>
  );
}
