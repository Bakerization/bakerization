import Link from "next/link";
import BlobImage from "@/components/BlobImage";
import { Inner, NAV_HEIGHT, SectionCover, TextLink, labelText } from "@/components/brand/ui";
import { formatBlogDate, localizePost } from "@/lib/blog-format";
import { getBlogPage } from "@/lib/blog-store";
import { withLang, type Locale } from "@/lib/locale";
import { C, FONTS } from "@/lib/theme";
import { notFound } from "next/navigation";

export function blogPagePath(page: number) { return page === 1 ? "/blog" : `/blog/page/${page}`; }

export default async function BlogIndex({ locale, page = 1 }: { locale: Locale; page?: number }) {
  const { posts, total, pageCount } = await getBlogPage(page);
  if (page > pageCount) notFound();
  const en = locale === "en";
  const pages = [...new Set([1, page - 1, page, page + 1, pageCount])].filter((n) => n > 0 && n <= pageCount).sort((a, b) => a - b);
  return <main style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: FONTS.body, paddingTop: NAV_HEIGHT }}>
    <SectionCover as="h1" title="Blog" sub="パンラボの記録" no="01" />
    <Inner className="mob-pad-v-sm" style={{ paddingTop: 56, paddingBottom: 100 }}>
      <div style={{ maxWidth: 720, marginBottom: 48 }}>
        <p style={{ fontSize: 17, lineHeight: 1.9, margin: "0 0 16px" }}>
          {en ? "The Pan Labo archive — bread, people and places, with the original publication dates." : "パンを食べ、つくる人に会い、土地をめぐる。「パンラボ」が積み重ねてきた記事を、当時の公開日とともにお届けします。"}
        </p>
        <p style={{ color: C.sub, fontSize: 13, lineHeight: 1.8 }}>
          {en ? "Republished with permission. Original bylines and signatures are retained in each article. Articles are in Japanese." : "パンラボの承諾を得て転載しています。記事中の署名は原文のまま掲載しています。"}
        </p>
        <p style={{ ...labelText, marginTop: 24 }}>{total.toLocaleString(en ? "en-US" : "ja-JP")} {en ? "ARTICLES" : "記事"} · {page} / {pageCount}</p>
      </div>
      <div className="blog-grid">
        {posts.map((post, index) => {
          const localized = localizePost(post, locale);
          return <article key={post.slug} style={{ borderTop: `1px solid ${C.ink}`, paddingTop: 20 }}>
            <Link href={withLang(`/blog/${post.slug}`, locale)} style={{ color: "inherit", textDecoration: "none" }}>
              {post.heroImageUrl && <div style={{ aspectRatio: "4/3", position: "relative", overflow: "hidden", background: C.paper, marginBottom: 20 }}>
                <BlobImage src={post.heroImageUrl} alt="" sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw" priority={index === 0} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>}
              <time dateTime={post.publishedAt} style={{ ...labelText, color: C.sub }}>{formatBlogDate(post.publishedAt)}</time>
              <h2 style={{ fontSize: 21, lineHeight: 1.65, margin: "12px 0" }}>{localized.title}</h2>
              <p style={{ color: C.sub, fontSize: 14, lineHeight: 1.9, margin: 0 }}>{localized.excerpt.slice(0, 110)}{localized.excerpt.length > 110 ? "…" : ""}</p>
              <p style={{ ...labelText, marginTop: 20 }}>{post.authorName}</p>
            </Link>
          </article>;
        })}
      </div>
      {!posts.length && <p>{en ? "No published articles yet." : "公開中の記事はまだありません。"}</p>}
      <nav aria-label={en ? "Blog pages" : "ブログのページ送り"} style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "center", marginTop: 64 }}>
        {page > 1 && <Link href={withLang(blogPagePath(page - 1), locale)} style={{ color: C.ink, padding: 12 }}>← {en ? "Previous" : "前へ"}</Link>}
        {pages.map((n, i) => <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
          {i > 0 && n - pages[i - 1] > 1 && <span aria-hidden>…</span>}
          <Link href={withLang(blogPagePath(n), locale)} aria-current={n === page ? "page" : undefined} aria-label={`${en ? "Page" : "ページ"} ${n}`} style={{ color: n === page ? C.onMain : C.ink, background: n === page ? C.main : "transparent", padding: "12px 16px", textDecoration: "none", border: `1px solid ${C.line}` }}>{n}</Link>
        </span>)}
        {page < pageCount && <Link href={withLang(blogPagePath(page + 1), locale)} style={{ color: C.ink, padding: 12 }}>{en ? "Next" : "次へ"} →</Link>}
      </nav>
      <div style={{ marginTop: 64 }}><TextLink href="/">← {en ? "Back to Home" : "トップへ戻る"}</TextLink></div>
    </Inner>
  </main>;
}
