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

  const baseClass =
    "rounded-md border px-2 py-1 text-xs font-semibold transition-colors";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={`${baseClass} ${
          locale === "ja"
            ? "border-amber-400 bg-amber-200 text-amber-900"
            : "border-amber-200 text-amber-900/70 hover:bg-amber-50"
        }`}
        onClick={() => changeLanguage("ja")}
        aria-label="Switch to Japanese"
      >
        JA
      </button>
      <button
        type="button"
        className={`${baseClass} ${
          locale === "en"
            ? "border-amber-400 bg-amber-200 text-amber-900"
            : "border-amber-200 text-amber-900/70 hover:bg-amber-50"
        }`}
        onClick={() => changeLanguage("en")}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
