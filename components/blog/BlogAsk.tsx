"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IKEDA, IKEDA_PENDING_KEY } from "@/lib/ikeda-config";
import {
  withBlogLanguage as withLang,
  type BlogLanguage as Locale,
} from "@/lib/blog-language";
import { blogText } from "@/lib/blog-copy";
import styles from "./BlogArchive.module.css";
export default function BlogAsk({
  year,
  theme,
  article,
  compact = false,
  locale = "ja",
}: {
  year?: number;
  theme?: string;
  article?: string;
  compact?: boolean;
  locale?: Locale;
}) {
  const tr = (ja: string, en: string) => blogText(locale, ja, en);
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
          router.push(withLang("/blog/chat", locale));
        } catch {
          router.push(
            withLang(
              `/blog/chat?q=${encodeURIComponent(q)}${article ? `&article=${article}` : ""}`,
              locale,
            ),
          );
        }
      }}
    >
      <textarea
        id={compact ? "article-ai-question" : "archive-ai-question"}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        maxLength={IKEDA.questionCharacters}
        rows={compact ? 1 : 2}
        aria-label={tr("質問", "Question")}
        placeholder={tr("質問する", "Ask Ikeda AI")}
        required
      />
      <div className={styles.askBottom}>
        <button
          type="submit"
          disabled={!question.trim()}
          aria-label={tr("池田AIに質問する", "Ask Ikeda AI")}
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
