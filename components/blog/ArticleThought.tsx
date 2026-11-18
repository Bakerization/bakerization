import Link from "next/link";
import BlogAsk from "./BlogAsk";
import { getArticleThought } from "@/lib/blog-archive";
import { IKEDA_THEMES } from "@/lib/ikeda-config";
import styles from "./BlogArchive.module.css";
export default async function ArticleThought({ slug }: { slug: string }) {
  const thought = await getArticleThought(slug);
  if (!thought) return null;
  return (
    <section className={styles.thoughtPanel} aria-label="この記事から考える">
      <h2>IKEDA AI · この記事から考える</h2>
      <p className={styles.thoughtQuestion}>{thought.question}</p>
      <details>
        <summary>考えと根拠をひらく · AIによる読み解き</summary>
        <div className={styles.thoughtClaims}>
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
            <Link className={styles.theme} key={id} href={`/blog?theme=${id}`}>
              {IKEDA_THEMES.find((t) => t.id === id)?.label || id}をたどる →
            </Link>
          ))}
        </div>
      </details>
      <BlogAsk article={slug} compact />
    </section>
  );
}
