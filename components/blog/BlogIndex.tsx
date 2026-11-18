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
import { withLang, type Locale } from "@/lib/locale";
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
    getArchivePage(f),
    getArchiveOverview(),
  ]);
  if (f.page > data.pageCount) notFound();
  const en = locale === "en";
  const href = (patch: Partial<ArchiveFilter>) =>
    withLang(archiveHref(f, patch), locale);
  const pages = [
    ...new Set([1, f.page - 1, f.page, f.page + 1, data.pageCount]),
  ]
    .filter((n) => n > 0 && n <= data.pageCount)
    .sort((a, b) => a - b);
  let lastMonth = "";
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero} aria-labelledby="archive-title">
          <div>
            <div className={styles.eyebrow}>
              PAN LABO JOURNAL · BAKERIZATION
            </div>
            <h1 id="archive-title" className={styles.title}>
              {en ? "Bread, people,\nand ideas." : "パンから、\n世界を読む。"}
            </h1>
            <p className={styles.lead}>
              {en
                ? "A record of bread, people and places. Follow the years and explore the questions behind the words."
                : "パンを食べる。つくる人に会う。土地をめぐる。\n積み重なった言葉を、年代と問いからたどるアーカイブです。"}
            </p>
            <div className={styles.stats}>
              <strong>{overview.total.toLocaleString()}</strong>
              <span>{en ? "articles" : "記事"}</span>
              <span>／</span>
              <span>
                {overview.years.at(-1)?.year}—{overview.years[0]?.year}
              </span>
            </div>
          </div>
          <div className={styles.aiCard}>
            <div className={styles.aiBrand}>
              <span className={styles.spark} aria-hidden>
                ✳
              </span>
              IKEDA AI
            </div>
            <h2>
              {en ? (
                "Start with a question."
              ) : (
                <>
                  パンのことから、
                  <br />
                  その先のことまで。
                </>
              )}
            </h2>
            <BlogAsk year={f.year} theme={f.theme} />
            <div className={styles.suggestions}>
              {[IKEDA_THEMES[0], IKEDA_THEMES[1], IKEDA_THEMES[7]].map((t) => (
                <Link
                  key={t.id}
                  href={`/blog/chat?q=${encodeURIComponent(t.question)}`}
                >
                  {t.label}を掘る ↗
                </Link>
              ))}
            </div>
            <p className={styles.aiNote}>
              パンラボの記事に基づくAIです。池田浩明本人の回答ではありません。
            </p>
          </div>
        </section>
        <section
          className={styles.archive}
          aria-label={en ? "Article archive" : "記事アーカイブ"}
        >
          <aside className={styles.rail}>
            <p className={styles.railLabel}>FOLLOW THE YEARS</p>
            <nav className={styles.years} aria-label="年代から読む">
              <Link
                className={`${styles.year} ${!f.year ? styles.yearActive : ""}`}
                href={href({ year: undefined, page: 1 })}
                aria-current={!f.year ? "page" : undefined}
              >
                すべて<small>{overview.total}</small>
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
              <nav className={styles.themes} aria-label="テーマから読む">
                <Link
                  className={`${styles.theme} ${!f.theme ? styles.themeActive : ""}`}
                  href={href({ theme: undefined, page: 1 })}
                >
                  すべてのテーマ
                </Link>
                {IKEDA_THEMES.map((t) => (
                  <Link
                    className={`${styles.theme} ${f.theme === t.id ? styles.themeActive : ""}`}
                    key={t.id}
                    href={href({ theme: t.id, page: 1 })}
                  >
                    {t.label}
                  </Link>
                ))}
              </nav>
              <form action="/blog" method="get" className={styles.filterForm}>
                {f.year && <input type="hidden" name="year" value={f.year} />}{" "}
                {f.theme && (
                  <input type="hidden" name="theme" value={f.theme} />
                )}{" "}
                {en && <input type="hidden" name="lang" value="en" />}
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
                  <span className={styles.srOnly}>記事を検索</span>
                  <input
                    name="q"
                    defaultValue={f.q}
                    key={f.q}
                    placeholder="小麦、パン屋、人の名前…"
                    maxLength={100}
                  />
                </label>
                <label>
                  <span className={styles.srOnly}>表示順</span>
                  <select name="order" defaultValue={f.order} key={f.order}>
                    <option value="desc">新しい順</option>
                    <option value="asc">古い順</option>
                  </select>
                </label>
                <button type="submit">絞り込む</button>
              </form>
            </div>
            <div className={styles.resultMeta}>
              <span>
                {f.year ? `${f.year}年 · ` : ""}
                {f.theme
                  ? `${IKEDA_THEMES.find((t) => t.id === f.theme)?.label} · `
                  : ""}
                {data.total.toLocaleString()}記事 ／{" "}
                {f.order === "asc" ? "古い記事から" : "新しい記事から"}
              </span>
              {(f.year || f.theme || f.q) && (
                <Link href="/blog" className={styles.reset}>
                  絞り込みを解除
                </Link>
              )}
            </div>
            {!data.posts.length && (
              <div className={styles.empty}>
                この条件の記事は見つかりませんでした。
                <br />
                <Link href="/blog">年代やテーマを変えて探す</Link>
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
                        <h3 className={styles.entryTitle}>
                          {en && post.hasEnglish ? post.titleEn : post.title}
                        </h3>
                        <p className={styles.excerpt}>
                          {en && post.hasEnglish
                            ? post.excerptEn
                            : post.excerpt}
                        </p>
                        <p className={styles.entryAuthor}>
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
                        href={`/blog/chat?q=${encodeURIComponent(post.thoughtQuestion)}&article=${post.slug}`}
                      >
                        <span>IKEDA AI</span>
                        {post.thoughtQuestion} ↗
                      </Link>
                    )}
                  </article>
                </div>
              );
            })}
            <nav className={styles.pagination} aria-label="記事のページ送り">
              {f.page > 1 && (
                <Link href={href({ page: f.page - 1 })} aria-label="前のページ">
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
                <Link href={href({ page: f.page + 1 })} aria-label="次のページ">
                  →
                </Link>
              )}
            </nav>
            <p className={styles.credit}>
              パンラボの承諾を得て転載しています。公開日と記事中の署名は原文を保持しています。
              <br />
              AIによる読み解きは記事の事実と区別し、根拠となる記事へつなぎます。
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
