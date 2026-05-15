import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { getPost, listPosts } from "@/lib/blog-store";
import { enrichHtmlWithToc } from "@/lib/content-utils";
import AdminEditButton from "@/components/blog/AdminEditButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getServerLocale } from "@/lib/i18n";
import { getLocalizedPost } from "@/lib/blog-localize";
import { BlogPost } from "@/lib/blog-types";
import { C, FONTS } from "@/lib/theme";

type Params = {
  params: Promise<{ slug: string }>;
};

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((part) => part.length >= 2);
}

function relatedScore(base: BlogPost, target: BlogPost) {
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

export default async function BlogDetailPage({ params }: Params) {
  const locale = await getServerLocale();
  const session = await getAuthSession();
  const isAdmin = session?.user?.role === "admin";

  const { slug } = await params;
  const post = await getPost(slug);

  if (!post || (!post.published && !isAdmin)) {
    notFound();
  }

  const localized = getLocalizedPost(post, locale);
  const { html, toc } = enrichHtmlWithToc(localized.contentHtml);
  const publishedPosts = await listPosts(false);
  const currentIndex = publishedPosts.findIndex((item) => item.slug === post.slug);
  const prevPost =
    currentIndex >= 0 ? publishedPosts[currentIndex + 1] ?? null : null;
  const nextPost = currentIndex > 0 ? publishedPosts[currentIndex - 1] : null;
  const relatedPosts = publishedPosts
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
          toc: "目次",
          noHeadings: "見出しがありません。",
          previousPost: "前の記事",
          nextPost: "次の記事",
          relatedPosts: "関連記事",
          noRelated: "関連記事はまだありません。",
          dateLocale: "ja-JP",
          section: "ジャーナル · 記事",
        };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.ink,
        fontFamily: FONTS.body,
        paddingTop: 64,
      }}
    >
      <section
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "32px 64px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
            ▍{t.section}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <LanguageSwitcher locale={locale} />
            <AdminEditButton slug={post.slug} locale={locale} />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 48,
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 12,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: C.sub,
                marginBottom: 18,
              }}
            >
              {new Date(post.updatedAt).toLocaleDateString(t.dateLocale)}
              {!post.published && (
                <span style={{ marginLeft: 12, color: C.accent }}>
                  · {t.draft}
                </span>
              )}
            </div>
            <h1
              style={{
                margin: 0,
                fontFamily: FONTS.display,
                fontSize: 64,
                lineHeight: 1.1,
                letterSpacing: -2,
                fontWeight: 700,
                color: C.ink,
              }}
            >
              {localized.title}
            </h1>
            <div
              style={{
                marginTop: 28,
                width: 80,
                height: 3,
                background: C.accent,
              }}
            />
            <p
              style={{
                marginTop: 24,
                fontSize: 17,
                lineHeight: 1.95,
                color: C.sub,
                margin: "24px 0 0",
              }}
            >
              {localized.excerpt}
            </p>
          </div>
          {post.heroImageUrl ? (
            <div
              style={{
                position: "relative",
                aspectRatio: "4/5",
                overflow: "hidden",
                border: `1px solid ${C.line}`,
              }}
            >
              <img
                src={post.heroImageUrl}
                alt={localized.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: "saturate(.95) contrast(1.05)",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                aspectRatio: "4/5",
                background: C.card,
                border: `1px solid ${C.line}`,
              }}
            />
          )}
        </div>
      </section>

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "80px 64px",
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 56,
        }}
      >
        <aside
          style={{
            position: "sticky",
            top: 96,
            alignSelf: "start",
            background: C.card,
            border: `1.5px solid ${C.line}`,
            padding: 24,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: C.accent,
              marginBottom: 14,
            }}
          >
            ▎{t.toc}
          </h2>
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
                    marginLeft: item.level === 3 ? 14 : 0,
                    padding: "6px 0",
                    fontSize: 13,
                    lineHeight: 1.55,
                  }}
                >
                  <a
                    href={`#${item.id}`}
                    style={{ color: C.ink, textDecoration: "none" }}
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div
            style={{
              marginTop: 28,
              paddingTop: 22,
              borderTop: `1px solid ${C.line}`,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontFamily: FONTS.mono,
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: C.accent,
                marginBottom: 14,
              }}
            >
              ▎{t.relatedPosts}
            </h3>
            {relatedPosts.length === 0 ? (
              <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>
                {t.noRelated}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {relatedPosts.map((related) => {
                  const rel = getLocalizedPost(related, locale);
                  return (
                    <Link
                      key={related.slug}
                      href={`/blog/${related.slug}`}
                      style={{
                        display: "flex",
                        gap: 10,
                        padding: 8,
                        border: `1px solid ${C.line}`,
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      {related.heroImageUrl ? (
                        <img
                          src={related.heroImageUrl}
                          alt={rel.title}
                          style={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            filter: "saturate(.9)",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            background: C.bg,
                          }}
                        />
                      )}
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          fontWeight: 700,
                          color: C.ink,
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {rel.title}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <div>
          <article
            className="blog-content-rich"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div
            style={{
              marginTop: 56,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                style={{
                  background: C.card,
                  border: `1.5px solid ${C.line}`,
                  padding: 24,
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: C.accent,
                  }}
                >
                  ← {t.previousPost}
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: C.ink,
                    lineHeight: 1.4,
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
                  background: C.card,
                  border: `1.5px solid ${C.line}`,
                  padding: 24,
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  textAlign: "right",
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: C.accent,
                  }}
                >
                  {t.nextPost} →
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: C.ink,
                    lineHeight: 1.4,
                  }}
                >
                  {getLocalizedPost(nextPost, locale).title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>

          <div style={{ marginTop: 56 }}>
            <Link
              href="/blog"
              style={{
                fontFamily: FONTS.mono,
                fontSize: 12,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: C.accent,
                textDecoration: "none",
              }}
            >
              {t.backToBlog}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
