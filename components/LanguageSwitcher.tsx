"use client";

import { useRouter } from "next/navigation";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

export default function LanguageSwitcher({ locale }: Props) {
  const router = useRouter();

  function changeLanguage(next: Locale) {
    document.cookie = `lang=${next}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  }

  const btnBase: React.CSSProperties = {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 11,
    letterSpacing: "0.18em",
    fontWeight: 600,
    padding: "8px 12px",
    border: "1px solid #3a2710",
    background: "transparent",
    cursor: "pointer",
    textTransform: "uppercase",
  };

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button
        type="button"
        onClick={() => changeLanguage("ja")}
        aria-label="Switch to Japanese"
        style={{
          ...btnBase,
          color: locale === "ja" ? "#0e0700" : "#a88a5e",
          background: locale === "ja" ? "#e89a1f" : "transparent",
          borderColor: locale === "ja" ? "#e89a1f" : "#3a2710",
        }}
      >
        JA
      </button>
      <button
        type="button"
        onClick={() => changeLanguage("en")}
        aria-label="Switch to English"
        style={{
          ...btnBase,
          color: locale === "en" ? "#0e0700" : "#a88a5e",
          background: locale === "en" ? "#e89a1f" : "transparent",
          borderColor: locale === "en" ? "#e89a1f" : "#3a2710",
        }}
      >
        EN
      </button>
    </div>
  );
}
