"use client";
import {
  BLOG_LANGUAGES,
  withBlogLanguage,
  type BlogLanguage,
} from "@/lib/blog-language";
import { LANG_COOKIE, LANG_COOKIE_MAX_AGE } from "@/lib/locale";
import { C } from "@/lib/theme";

export default function BlogLanguageSwitcher({
  language,
}: {
  language: BlogLanguage;
}) {
  return (
    <select
      aria-label="Language / 语言 / 언어 / 言語"
      value={language}
      onChange={(e) => {
        const next = e.target.value as BlogLanguage;
        // A document navigation resets the article/chat provider and html lang together.
        // The site-wide cookie remains ja/en; the blog language is pinned in its URL.
        const secure = location.protocol === "https:" ? "; secure" : "";
        document.cookie = `${LANG_COOKIE}=${next === "ja" ? "ja" : "en"}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax${secure}`;
        location.assign(
          withBlogLanguage(
            location.pathname + location.search + location.hash,
            next,
          ),
        );
      }}
      style={{
        border: `1px solid ${C.line}`,
        borderRadius: 999,
        padding: "6px 9px",
        background: "transparent",
        color: C.ink,
        fontSize: 12,
        maxWidth: 122,
      }}
    >
      {Object.entries(BLOG_LANGUAGES).map(([id, l]) => (
        <option value={id} key={id}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
