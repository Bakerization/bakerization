"use client";

import { useRouter } from "next/navigation";
import { CSSProperties } from "react";
import { Locale } from "@/lib/i18n";

/**
 * 見た目を変えずに押せるようにするための言語切替。
 *
 * トップページのナビとフッターには「JA / EN」「JA · EN」という文字だけが
 * 置かれていて、押しても何も起きなかった。ここでは同じ文字のまま button に
 * 差し替え、font / color / letter-spacing をすべて継承させて、
 * 既存の見た目を1pxも変えないようにしている。
 *
 * 下層ページのナビは LanguageSwitcher（枠付きボタン）のままにしてある。
 */
export default function InlineLanguageSwitcher({
  locale,
  separator = " / ",
}: {
  locale: Locale;
  separator?: string;
}) {
  const router = useRouter();

  function change(next: Locale) {
    if (next === locale) return;
    document.cookie = `lang=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  }

  const btn: CSSProperties = {
    font: "inherit",
    color: "inherit",
    letterSpacing: "inherit",
    background: "none",
    border: "none",
    padding: 0,
    margin: 0,
    cursor: "pointer",
  };

  return (
    <span>
      <button
        type="button"
        className="lang-inline"
        style={btn}
        onClick={() => change("ja")}
        aria-label="日本語に切り替える"
        aria-current={locale === "ja" ? "true" : undefined}
      >
        JA
      </button>
      {separator}
      <button
        type="button"
        className="lang-inline"
        style={btn}
        onClick={() => change("en")}
        aria-label="Switch to English"
        aria-current={locale === "en" ? "true" : undefined}
      >
        EN
      </button>
    </span>
  );
}
