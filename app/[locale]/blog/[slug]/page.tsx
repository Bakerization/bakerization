import { articleSourceLabel } from "@/lib/ikeda-sources";
import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Inner, NAV_HEIGHT, TextLink, labelText } from "@/components/brand/ui";
import JsonLd from "@/components/JsonLd";
import { getPost, getAdjacentPosts } from "@/lib/blog-store";
import { formatBlogDate, hasEnglishVersion } from "@/lib/blog-format";
import { sanitizeBlogHtml } from "@/lib/blog-html";
import {
  blogLanguage,
  withBlogLanguage as withLang,
  blogFont,
  BLOG_LANGUAGES,
  type BlogLanguage,
} from "@/lib/blog-language";
import { blogText } from "@/lib/blog-copy";
import { getBlogTranslations } from "@/lib/blog-translations";
import { absoluteUrl } from "@/lib/seo";
import { blogMetadata as pageMetadata } from "@/lib/blog-seo";
import { C, FONTS } from "@/lib/theme";
import ArticleThought from "@/components/blog/ArticleThought";
import {
  ArticleTranslation,
  TranslatedArticleTitle,
  TranslatedArticleBody,
  ArticleTranslationControls,
} from "@/components/blog/ArticleTranslation";

export const revalidate = 3600;
export const dynamicParams = true;
// Generate historical entries on demand rather than thousands of pages per build.
export function generateStaticParams() {
  return [];
}
type Props = { params: Promise<{ locale: string; slug: string }> };
const loadPost = cache(async (slug: string, language: BlogLanguage) => {
  const [post, translations] = await Promise.all([
    getPost(slug),
    getBlogTranslations(slug),
  ]);
  if (!post) return null;
  const target =
    language === "ja"
      ? undefined
      : translations.find(
          (t) => t.language === language && t.contentHtml.trim(),
        );
  const english = language === "en" && hasEnglishVersion(post);
  const translation = english
    ? {
        title: post.titleEn,
        excerpt: post.excerptEn,
        contentHtml: post.contentHtmlEn,
      }
    : target;
  const available: BlogLanguage[] = [
    "ja",
    ...(hasEnglishVersion(post) ? ["en" as const] : []),
    ...translations
      .filter((t) => t.language !== "en" && t.title && t.contentHtml.trim())
      .map((t) => t.language),
  ];
  return {
    post,
    translation,
    available,
    localized: translation || {
      title: post.title,
      excerpt: post.excerpt,
      contentHtml: post.contentHtml,
    },
  };
});
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale: rawLocale } = await params;
  const locale = blogLanguage(rawLocale);
  const loaded = await loadPost(slug, locale);
  if (!loaded)
    return { title: "Blog", robots: { index: false, follow: false } };
  const { post, localized, available } = loaded;
  return pageMetadata({
    path: `/blog/${post.slug}`,
    locale,
    available,
    title: localized.title,
    description: localized.excerpt,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    images: post.heroImageUrl ? [post.heroImageUrl] : undefined,
  });
}
export default async function Page({ params }: Props) {
  const { slug, locale: rawLocale } = await params;
  const locale = blogLanguage(rawLocale);
  const loaded = await loadPost(slug, locale);
  if (!loaded) notFound();
  const { post, localized, translation } = loaded;
  const { older, newer } = await getAdjacentPosts(post, locale);
  const tr = (ja: string, en: string) => blogText(locale, ja, en);
  const en = locale !== "ja";
  return (
    <main
      style={{
        paddingTop: NAV_HEIGHT,
        color: C.ink,
        background: C.bg,
        fontFamily: blogFont(locale) || FONTS.body,
        minHeight: "100vh",
      }}
    >
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: localized.title,
          description: localized.excerpt,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          author: post.authorName.startsWith("池田浩明・")
            ? post.authorName
                .split("・")
                .map((name) => ({ "@type": "Person", name }))
            : {
                "@type":
                  post.authorName === "池田浩明" ? "Person" : "Organization",
                name: post.authorName,
              },
          publisher: {
            "@type": "Organization",
            name: "Bakerization",
            url: absoluteUrl("/"),
          },
          mainEntityOfPage: absoluteUrl(
            withLang(`/blog/${post.slug}`, translation ? locale : "ja"),
          ),
          inLanguage: translation ? BLOG_LANGUAGES[locale].html : "ja",
          ...(post.sourceUrl ? { isBasedOn: post.sourceUrl } : {}),
          ...(post.heroImageUrl
            ? { image: absoluteUrl(post.heroImageUrl) }
            : {}),
        }}
      />
      <Inner
        className="mob-pad-v-sm"
        style={{ paddingTop: 56, paddingBottom: 100 }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <TextLink href={withLang("/blog", locale)}>
            ← {tr("ブログ一覧", "All articles")}
          </TextLink>
          <ArticleTranslation
            key={`${locale}:${post.slug}:${post.sourceHash}:${post.updatedAt}`}
            post={{
              ...post,
              contentHtml: sanitizeBlogHtml(post.contentHtml),
              contentHtmlEn: sanitizeBlogHtml(post.contentHtmlEn),
            }}
            locale={locale}
            initialTranslation={
              translation
                ? {
                    title: translation.title,
                    contentHtml: sanitizeBlogHtml(translation.contentHtml),
                  }
                : null
            }
          >
            <header
              style={{
                marginTop: 48,
                paddingBottom: 32,
                borderBottom: `1px solid ${C.ink}`,
              }}
            >
              <p style={{ ...labelText, color: C.sub }}>
                <time dateTime={post.publishedAt}>
                  {formatBlogDate(post.publishedAt)}
                </time>{" "}
                · {post.authorName}
              </p>
              <h1
                style={{
                  fontSize: "clamp(26px, 4.5vw, 42px)",
                  lineHeight: en ? 1.35 : 1.6,
                  margin: "16px 0 20px",
                  overflowWrap: "anywhere",
                }}
              >
                <TranslatedArticleTitle />
              </h1>
              {post.category && (
                <p style={{ fontSize: 13, color: C.sub }}>{post.category}</p>
              )}
              {post.sourceUrl && (
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.9,
                    color: C.sub,
                    marginBottom: 0,
                  }}
                >
                  {tr("出典：", "Republished from ")}
                  <a
                    href={post.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "inherit" }}
                  >
                    {articleSourceLabel(post.sourceUrl)}
                  </a>
                  {tr(
                    "。承諾を得て、元の公開日のまま転載しています。",
                    ". Republished with permission; original publication date retained.",
                  )}
                </p>
              )}
            </header>
            <Link
              href={withLang(
                `/blog/chat?q=${encodeURIComponent(en ? tr("", "Explain the main ideas in this article with evidence.") : `「${localized.title}」の大切な考えを、根拠とともに読み解いて`)}&article=${post.slug}`,
                locale,
              )}
              style={{
                display: "inline-flex",
                marginTop: 22,
                padding: "9px 15px",
                borderRadius: 999,
                background: C.paper,
                color: C.ink,
                fontSize: 12,
                textDecoration: "none",
              }}
            >
              ✳{" "}
              {tr(
                "この記事を池田AIで読み解く",
                "Discuss this article with Ikeda AI",
              )}{" "}
              ↗
            </Link>
            <ArticleTranslationControls />
            <TranslatedArticleBody />
          </ArticleTranslation>
          <ArticleThought slug={post.slug} locale={locale} />
          <nav
            aria-label={tr("前後の記事", "Adjacent articles")}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 32,
              marginTop: 64,
              paddingTop: 28,
              borderTop: `1px solid ${C.line}`,
            }}
          >
            <div>
              {older && (
                <Link
                  href={withLang(`/blog/${older.slug}`, locale)}
                  style={{ color: C.ink, lineHeight: 1.8 }}
                >
                  ← {tr("前の記事", "Older")}
                  <br />
                  {older.title}
                </Link>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              {newer && (
                <Link
                  href={withLang(`/blog/${newer.slug}`, locale)}
                  style={{ color: C.ink, lineHeight: 1.8 }}
                >
                  {tr("次の記事", "Newer")} →<br />
                  {newer.title}
                </Link>
              )}
            </div>
          </nav>
        </div>
      </Inner>
    </main>
  );
}
