"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IKEDA, IKEDA_PENDING_KEY } from "@/lib/ikeda-config";
import styles from "./BlogArchive.module.css";
export default function BlogAsk({
  year,
  theme,
  article,
  compact = false,
}: {
  year?: number;
  theme?: string;
  article?: string;
  compact?: boolean;
}) {
  const [question, setQuestion] = useState("");
  const router = useRouter();
  return (
    <form
      className={`${styles.askForm} ${compact ? styles.askCompact : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        const q = question.trim();
        if (!q) return;
        try {
          sessionStorage.setItem(
            IKEDA_PENDING_KEY,
            JSON.stringify({ question: q, year, theme, article }),
          );
          router.push("/blog/chat");
        } catch {
          router.push(
            `/blog/chat?q=${encodeURIComponent(q)}${article ? `&article=${article}` : ""}`,
          );
        }
      }}
    >
      <label
        className={styles.srOnly}
        htmlFor={compact ? "article-ai-question" : "archive-ai-question"}
      >
        池田AIへの質問
      </label>
      <textarea
        id={compact ? "article-ai-question" : "archive-ai-question"}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        maxLength={IKEDA.questionCharacters}
        rows={compact ? 2 : 3}
        placeholder="パンを通じて、何を考えてきたのだろう？"
        required
      />
      <div className={styles.askBottom}>
        <span>パンラボの記事から考える</span>
        <button
          type="submit"
          disabled={!question.trim()}
          aria-label="池田AIに質問する"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 19V5m-6 6 6-6 6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
