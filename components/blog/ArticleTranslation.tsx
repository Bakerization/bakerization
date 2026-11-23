"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  withBlogLanguage as withLang,
  BLOG_LANGUAGES,
  type BlogLanguage as Locale,
} from "@/lib/blog-language";
import { blogText } from "@/lib/blog-copy";
import type { BlogPost } from "@/lib/blog-types";
import { BLOG_TRANSLATION as C } from "@/lib/blog-translation-config";
type Translation = { title: string; contentHtml: string };
type Value = {
  post: BlogPost;
  translation: Translation | null;
  original: boolean;
  setOriginal: (v: boolean) => void;
  status: string;
  error: string;
  retry: () => void;
  locale: Locale;
};
const Context = createContext<Value | null>(null);
function useTranslation() {
  const c = useContext(Context);
  if (!c) throw Error("Article translation provider missing");
  return c;
}
export function ArticleTranslation({
  post,
  locale,
  children,
  initialTranslation,
}: {
  post: BlogPost;
  locale: Locale;
  children: React.ReactNode;
  initialTranslation?: Translation | null;
}) {
  const tr = (ja: string, en: string) => blogText(locale, ja, en);
  const router = useRouter(),
    [translation, setTranslation] = useState<Translation | null>(
      initialTranslation ||
        (locale === "en" && post.titleEn && post.contentHtmlEn
          ? { title: post.titleEn, contentHtml: post.contentHtmlEn }
          : null),
    ),
    [original, setOriginal] = useState(locale === "ja"),
    [status, setStatus] = useState(""),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (locale === "ja" || translation) return;
    const abort = new AbortController();
    const timer = setTimeout(() => {
      void (async () => {
        setStatus(tr("", "Translating the full article…"));
        setError("");
        const until = Date.now() + C.articleTimeoutMs;
        try {
          while (Date.now() < until) {
            const r = await fetch("/api/blog/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ slug: post.slug, language: locale }),
              signal: abort.signal,
            });
            const data = await r.json();
            if (r.status === 202) {
              await new Promise<void>((resolve, reject) => {
                const id = setTimeout(resolve, 5000);
                abort.signal.addEventListener(
                  "abort",
                  () => {
                    clearTimeout(id);
                    reject(new Error("Aborted"));
                  },
                  { once: true },
                );
              });
              continue;
            }
            if (!r.ok)
              throw Error(
                tr(
                  "",
                  data.error ===
                    "Translation limit reached. Please try again later."
                    ? data.error
                    : "Translation unavailable.",
                ),
              );
            if (
              typeof data.title !== "string" ||
              typeof data.contentHtml !== "string"
            )
              throw Error(tr("", "Translation unavailable."));
            setTranslation({
              title: data.title,
              contentHtml: data.contentHtml,
            });
            setOriginal(false);
            setStatus("");
            router.refresh();
            return;
          }
          throw Error(
            tr("", "Translation is taking longer than expected. Please retry."),
          );
        } catch (e) {
          if (!abort.signal.aborted) {
            setStatus("");
            setError(
              e instanceof Error
                ? e.message
                : tr("", "Translation unavailable."),
            );
          }
        }
      })();
    }, 0);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [locale, post.slug, attempt, translation, router]);
  return (
    <Context.Provider
      value={{
        post,
        translation,
        original,
        setOriginal,
        status,
        error,
        retry: () => setAttempt((n) => n + 1),
        locale,
      }}
    >
      <article
        lang={!original && translation ? BLOG_LANGUAGES[locale].html : "ja"}
      >
        {children}
      </article>
    </Context.Provider>
  );
}
export function TranslatedArticleTitle() {
  const c = useTranslation();
  return (
    <>{!c.original && c.translation ? c.translation.title : c.post.title}</>
  );
}
export function ArticleTranslationControls() {
  const c = useTranslation();
  const tr = (ja: string, en: string) => blogText(c.locale, ja, en);
  if (c.locale === "ja")
    return (
      <p style={{ fontSize: 12, margin: "20px 0 0" }}>
        <Link href={withLang(`/blog/${c.post.slug}`, "en")}>
          Read in English →
        </Link>
        {" · "}
        <Link href={withLang(`/blog/${c.post.slug}`, "zh")}>简体中文</Link>
        {" · "}
        <Link href={withLang(`/blog/${c.post.slug}`, "ko")}>한국어</Link>
      </p>
    );
  return (
    <div style={{ fontSize: 12, lineHeight: 1.8, marginTop: 20 }}>
      {c.translation ? (
        <>
          <span>
            {c.locale !== "en" ||
            c.post.machineTranslated ||
            !c.post.contentHtmlEn
              ? tr("", "AI translation")
              : tr("", "English translation")}{" "}
            ·{" "}
          </span>
          <button
            type="button"
            onClick={() => c.setOriginal(!c.original)}
            style={{
              border: 0,
              padding: 0,
              background: "none",
              color: "inherit",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {c.original
              ? tr("", "Read in English")
              : tr("", "Japanese original")}
          </button>
        </>
      ) : (
        <>
          <span role="status">{c.status || tr("", "Japanese original")}</span>
          {c.error && (
            <p role="alert">
              {c.error}{" "}
              <button onClick={c.retry} type="button">
                {tr("", "Retry translation")}
              </button>
            </p>
          )}
        </>
      )}
    </div>
  );
}
export function TranslatedArticleBody() {
  const c = useTranslation();
  return (
    <div
      className="panlabo-article"
      style={{ paddingTop: 40 }}
      dangerouslySetInnerHTML={{
        __html:
          !c.original && c.translation
            ? c.translation.contentHtml
            : c.post.contentHtml,
      }}
    />
  );
}
