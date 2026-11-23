import Link from "next/link";
import { notFound } from "next/navigation";
import BlobImage from "@/components/BlobImage";
import BlogAsk from "@/components/blog/BlogAsk";
import { formatBlogDate } from "@/lib/blog-format";
import {
  archiveHref,
  getArchivePage,
  getArchiveOverview,
  type ArchiveFilter,
} from "@/lib/blog-archive";
import { IKEDA_THEMES } from "@/lib/ikeda-config";
import {
  withBlogLanguage as withLang,
  type BlogLanguage as Locale,
  blogFont,
} from "@/lib/blog-language";
import { blogText, blogTheme } from "@/lib/blog-copy";
import styles from "./BlogArchive.module.css";
export function blogPagePath(page: number) {
  return page === 1 ? "/blog" : `/blog/page/${page}`;
}
export default async function BlogIndex({
  locale,
  page = 1,
  filters,
}: {
  locale: Locale;
  page?: number;
  filters?: ArchiveFilter;
}) {
  const f = filters || { q: "", order: "desc" as const, page };
  const [data, overview] = await Promise.all([
    getArchivePage(f, locale),
    getArchiveOverview(),
  ]);
  if (f.page > data.pageCount) notFound();
  const tr = (ja: string, en: string) => blogText(locale, ja, en);
  const en = locale !== "ja";
  const href = (patch: Partial<ArchiveFilter>) =>
    withLang(archiveHref(f, patch), locale);
  const pages = [
    ...new Set([1, f.page - 1, f.page, f.page + 1, data.pageCount]),
  ]
    .filter((n) => n > 0 && n <= data.pageCount)
    .sort((a, b) => a - b);
  let lastMonth = "";
  return (
    <main className={styles.page} style={{ fontFamily: blogFont(locale) }}>
      <div className={styles.container}>
        <section className={styles.intro} aria-label={tr("質問", "Ask")}>
          <h1 className={styles.srOnly}>{tr("ブログ", "Blog")}</h1>
          <BlogAsk year={f.year} theme={f.theme} locale={locale} compact />
        </section>
        <section
          className={styles.archive}
          aria-label={tr("記事アーカイブ", "Article archive")}
        >
          <aside className={styles.rail}>
            <nav
              className={styles.years}
              aria-label={tr("年代から読む", "Browse by year")}
            >
              <Link
                className={`${styles.year} ${!f.year ? styles.yearActive : ""}`}
                href={href({ year: undefined, page: 1 })}
                aria-current={!f.year ? "page" : undefined}
              >
                {tr("すべて", "All")}
                <small>{overview.total}</small>
              </Link>
              {overview.years.map((y) => (
                <Link
                  className={`${styles.year} ${f.year === y.year ? styles.yearActive : ""}`}
                  key={y.year}
                  href={href({ year: y.year, page: 1 })}
                  aria-current={f.year === y.year ? "page" : undefined}
                >
                  {y.year}
                  <small>{y.count}</small>
                </Link>
              ))}
            </nav>
          </aside>
          <div>
            <div className={styles.tools}>
              <nav
                className={styles.themes}
                aria-label={tr("テーマから読む", "Browse by theme")}
              >
                <Link
                  className={`${styles.theme} ${!f.theme ? styles.themeActive : ""}`}
                  href={href({ theme: undefined, page: 1 })}
                >
                  {tr("すべてのテーマ", "All themes")}
                </Link>
                {IKEDA_THEMES.map((t) => (
                  <Link
                    className={`${styles.theme} ${f.theme === t.id ? styles.themeActive : ""}`}
                    key={t.id}
                    href={href({ theme: t.id, page: 1 })}
                  >
                    {blogTheme(t.id, locale)}
                  </Link>
                ))}
              </nav>
              <form action="/blog" method="get" className={styles.filterForm}>
                {f.year && <input type="hidden" name="year" value={f.year} />}{" "}
                {f.theme && (
                  <input type="hidden" name="theme" value={f.theme} />
                )}{" "}
                {en && <input type="hidden" name="lang" value={locale} />}
                <label className={styles.searchBox}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <circle
                      cx="10.5"
                      cy="10.5"
                      r="6.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="m16 16 4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <span className={styles.srOnly}>
                    {tr("記事を検索", "Search articles")}
                  </span>
                  <input
                    name="q"
                    defaultValue={f.q}
                    key={f.q}
                    placeholder={tr(
                      "小麦、パン屋、人の名前…",
                      "Wheat, bakeries, people…",
                    )}
                    maxLength={100}
                  />
                </label>
                <label>
                  <span className={styles.srOnly}>
                    {tr("表示順", "Sort order")}
                  </span>
                  <select name="order" defaultValue={f.order} key={f.order}>
                    <option value="desc">
                      {tr("新しい順", "Newest first")}
                    </option>
                    <option value="asc">{tr("古い順", "Oldest first")}</option>
                  </select>
                </label>
                <button type="submit">{tr("絞り込む", "Search")}</button>
              </form>
            </div>
            <div className={styles.resultMeta}>
              <span>
                {f.year ? `${f.year}${tr("年", "")} · ` : ""}
                {f.theme ? `${blogTheme(f.theme, locale)} · ` : ""}
                {data.total.toLocaleString()} {tr("記事 ／", "articles /")}{" "}
                {f.order === "asc"
                  ? tr("古い記事から", "Oldest first")
                  : tr("新しい記事から", "Newest first")}
              </span>
              {(f.year || f.theme || f.q) && (
                <Link href={withLang("/blog", locale)} className={styles.reset}>
                  {tr("絞り込みを解除", "Clear filters")}
                </Link>
              )}
            </div>
            {!data.posts.length && (
              <div className={styles.empty}>
                {tr(
                  "この条件の記事は見つかりませんでした。",
                  "No articles found.",
                )}
                <br />
                <Link href={withLang("/blog", locale)}>
                  {tr("年代やテーマを変えて探す", "Try another year or theme")}
                </Link>
              </div>
            )}
            {data.posts.map((post, i) => {
              const date = formatBlogDate(post.publishedAt);
              const month = date.slice(0, 7);
              const showMonth = month !== lastMonth;
              lastMonth = month;
              return (
                <div key={post.slug}>
                  {showMonth && (
                    <h2 className={styles.month}>
                      {month.replace("/", " / ")}
                    </h2>
                  )}
                  <article className={styles.entry}>
                    <Link
                      className={styles.entryLink}
                      href={withLang(`/blog/${post.slug}`, locale)}
                    >
                      <time
                        className={styles.entryDate}
                        dateTime={post.publishedAt}
                      >
                        {date.slice(5).replace("/", ".")}
                      </time>
                      <div>
                        <h3
                          className={styles.entryTitle}
                          lang={
                            en && post.translatedTitle
                              ? locale === "zh"
                                ? "zh-Hans"
                                : locale
                              : "ja"
                          }
                        >
                          {en && post.translatedTitle?.trim()
                            ? post.translatedTitle
                            : post.title}
                        </h3>
                        <p
                          className={styles.excerpt}
                          lang={
                            en && post.translatedTitle
                              ? locale === "zh"
                                ? "zh-Hans"
                                : locale
                              : "ja"
                          }
                        >
                          {en && post.translatedTitle?.trim()
                            ? post.translatedExcerpt
                            : post.excerpt}
                        </p>
                        <p className={styles.entryAuthor}>
                          {en && !post.translatedTitle && (
                            <>{tr("日本語原文", "Japanese original")} · </>
                          )}
                          {post.authorName}
                          {post.category ? ` / ${post.category}` : ""}
                        </p>
                      </div>
                      {post.heroImageUrl && (
                        <div className={styles.thumbnail}>
                          <BlobImage
                            src={post.heroImageUrl}
                            alt=""
                            sizes="(max-width:700px) 82px,(max-width:1000px) 115px,150px"
                            priority={i === 0}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      )}
                    </Link>
                    {post.thoughtQuestion && (
                      <Link
                        className={styles.thoughtLink}
                        href={withLang(
                          `/blog/chat?q=${encodeURIComponent(en ? tr("", "Explain the main ideas in this article with evidence.") : post.thoughtQuestion)}&article=${post.slug}`,
                          locale,
                        )}
                      >
                        {en
                          ? tr("", "Discuss this article")
                          : post.thoughtQuestion}{" "}
                        ↗
                      </Link>
                    )}
                  </article>
                </div>
              );
            })}
            <nav
              className={styles.pagination}
              aria-label={tr("記事のページ送り", "Pagination")}
            >
              {f.page > 1 && (
                <Link
                  href={href({ page: f.page - 1 })}
                  aria-label={tr("前のページ", "Previous page")}
                >
                  ←
                </Link>
              )}
              {pages.map((p, i) => (
                <span
                  key={p}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  {i > 0 && p - pages[i - 1] > 1 && <span>…</span>}
                  <Link
                    href={href({ page: p })}
                    aria-current={p === f.page ? "page" : undefined}
                  >
                    {p}
                  </Link>
                </span>
              ))}
              {f.page < data.pageCount && (
                <Link
                  href={href({ page: f.page + 1 })}
                  aria-label={tr("次のページ", "Next page")}
                >
                  →
                </Link>
              )}
            </nav>
            <p className={styles.credit}>
              <a
                href="https://panlabo.jugem.jp/"
                target="_blank"
                rel="noopener noreferrer"
              >
                パンラボ
              </a>
              {" · "}
              <a
                href="https://www.asahi.com/and/w/serialstory/konopan"
                target="_blank"
                rel="noopener noreferrer"
              >
                朝日新聞「このパンがすごい！」
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
