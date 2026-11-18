import { articleSourceLabel } from "@/lib/ikeda-sources";
import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Inner, NAV_HEIGHT, TextLink, labelText } from "@/components/brand/ui";
import JsonLd from "@/components/JsonLd";
import { getPost, getAdjacentPosts } from "@/lib/blog-store";
import {
  formatBlogDate,
  hasEnglishVersion,
  localizePost,
} from "@/lib/blog-format";
import { sanitizeBlogHtml } from "@/lib/blog-html";
import { localeFromParams, withLang } from "@/lib/locale";
import { pageMetadata, absoluteUrl } from "@/lib/seo";
import { C, FONTS } from "@/lib/theme";
import ArticleThought from "@/components/blog/ArticleThought";

export const revalidate = 3600;
export const dynamicParams = true;
// Generate historical entries on demand rather than thousands of pages per build.
export function generateStaticParams() {
  return [];
}
type Props = { params: Promise<{ locale: string; slug: string }> };
const loadPost = cache(getPost);
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post, locale] = await Promise.all([
    loadPost(slug),
    localeFromParams(params),
  ]);
  if (!post) return { title: "Blog", robots: { index: false, follow: false } };
  const localized = localizePost(post, locale);
  return pageMetadata({
    path: `/blog/${post.slug}`,
    locale,
    available: hasEnglishVersion(post) ? ["ja", "en"] : ["ja"],
    title: localized.title,
    description: localized.excerpt,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    images: post.heroImageUrl ? [post.heroImageUrl] : undefined,
  });
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [post, locale] = await Promise.all([
    loadPost(slug),
    localeFromParams(params),
  ]);
  if (!post) notFound();
  const { older, newer } = await getAdjacentPosts(post);
  const localized = localizePost(post, locale);
  const en = locale === "en";
  return (
    <main
      style={{
        paddingTop: NAV_HEIGHT,
        color: C.ink,
        background: C.bg,
        fontFamily: FONTS.body,
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
          author: {
            "@type": post.authorName === "池田浩明" ? "Person" : "Organization",
            name: post.authorName,
          },
          publisher: {
            "@type": "Organization",
            name: "Bakerization",
            url: absoluteUrl("/"),
          },
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
          inLanguage: en && hasEnglishVersion(post) ? "en" : "ja",
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
            ← {en ? "All articles" : "ブログ一覧"}
          </TextLink>
          <article lang={en && hasEnglishVersion(post) ? "en" : "ja"}>
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
                  lineHeight: 1.6,
                  margin: "16px 0 20px",
                  overflowWrap: "anywhere",
                }}
              >
                {localized.title}
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
                  {en ? "Republished from " : "出典："}
                  <a
                    href={post.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "inherit" }}
                  >
                    {articleSourceLabel(post.sourceUrl)}
                  </a>
                  {en
                    ? ". Republished with permission; original publication date retained."
                    : "。承諾を得て、元の公開日のまま転載しています。"}
                </p>
              )}
            </header>
            <Link
              href={`/blog/chat?q=${encodeURIComponent(`「${localized.title}」の大切な考えを、根拠とともに読み解いて`)}&article=${post.slug}`}
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
              ✳ この記事を池田AIで読み解く ↗
            </Link>
            <div
              className="panlabo-article"
              style={{ paddingTop: 40 }}
              dangerouslySetInnerHTML={{
                __html: sanitizeBlogHtml(localized.contentHtml),
              }}
            />
          </article>
          <ArticleThought slug={post.slug} />
          <nav
            aria-label={en ? "Adjacent articles" : "前後の記事"}
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
                  ← {en ? "Older" : "前の記事"}
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
                  {en ? "Newer" : "次の記事"} →<br />
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
