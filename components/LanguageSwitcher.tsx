"use client";

import type { Locale } from "@/lib/locale";
import { useLocaleSwitch } from "@/components/useLocaleSwitch";
import { C, FONTS } from "@/lib/theme";

type Props = {
  locale: Locale;
};

export default function LanguageSwitcher({ locale }: Props) {
  const { switchTo: changeLanguage, pending } = useLocaleSwitch(locale);

  const btnBase: React.CSSProperties = {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: "0.18em",
    fontWeight: 600,
    padding: "6px 10px",
    border: `1px solid ${C.line}`,
    background: "transparent",
    cursor: "pointer",
    textTransform: "uppercase",
    opacity: pending ? 0.6 : 1,
  };

  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button
        type="button"
        onClick={() => changeLanguage("ja")}
        aria-label="Switch to Japanese"
        aria-pressed={locale === "ja"}
        style={{
          ...btnBase,
          color: locale === "ja" ? C.bg : C.sub,
          background: locale === "ja" ? C.accent : "transparent",
          borderColor: locale === "ja" ? C.accent : C.line,
        }}
      >
        JA
      </button>
      <button
        type="button"
        onClick={() => changeLanguage("en")}
        aria-label="Switch to English"
        aria-pressed={locale === "en"}
        style={{
          ...btnBase,
          color: locale === "en" ? C.bg : C.sub,
          background: locale === "en" ? C.accent : "transparent",
          borderColor: locale === "en" ? C.accent : C.line,
        }}
      >
        EN
      </button>
    </div>
  );
}
