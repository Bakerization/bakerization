import Link from "next/link";
import BlogAsk from "./BlogAsk";
import { getArticleThought } from "@/lib/blog-archive";
import { IKEDA_THEMES } from "@/lib/ikeda-config";
import {
  withBlogLanguage as withLang,
  type BlogLanguage as Locale,
} from "@/lib/blog-language";
import { blogText, blogTheme } from "@/lib/blog-copy";
import styles from "./BlogArchive.module.css";
export default async function ArticleThought({
  slug,
  locale = "ja",
}: {
  slug: string;
  locale?: Locale;
}) {
  const thought = await getArticleThought(slug);
  if (!thought) return null;
  const tr = (ja: string, en: string) => blogText(locale, ja, en);
  const en = locale !== "ja";
  return (
    <section
      className={styles.thoughtPanel}
      aria-label={tr("この記事から考える", "Explore this article")}
    >
      <h2>IKEDA AI · {tr("この記事から考える", "Explore this article")}</h2>
      {!en && <p className={styles.thoughtQuestion}>{thought.question}</p>}
      <details>
        <summary>
          {tr(
            "考えと根拠をひらく · AIによる読み解き",
            "Source notes and evidence (Japanese)",
          )}
        </summary>
        <div className={styles.thoughtClaims} lang="ja">
          {thought.claims.map((c, i) => (
            <div key={i}>
              <strong>{c.statement}</strong>
              <p>{c.basis}</p>
              <blockquote>
                {c.quote}
                <br />
                <small>
                  {c.voice === "interviewee"
                    ? "取材相手の発言"
                    : c.voice === "unclear"
                      ? "引用文（話者未確認）"
                      : c.voice === "other_author"
                        ? "他筆者の文章"
                        : thought.authorship === "ikeda_explicit"
                          ? "池田浩明の文章"
                          : "記事中の文章（署名未確認）"}
                </small>
              </blockquote>
            </div>
          ))}
        </div>
        <div className={styles.themes}>
          {thought.themes.map((id) => (
            <Link
              className={styles.theme}
              key={id}
              href={withLang(`/blog?theme=${id}`, locale)}
            >
              {blogTheme(id, locale)}
              {tr("をたどる", "")} →
            </Link>
          ))}
        </div>
      </details>
      <BlogAsk article={slug} locale={locale} compact />
    </section>
  );
}
