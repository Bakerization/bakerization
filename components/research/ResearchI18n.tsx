"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "@/lib/locale";
import { RESEARCH_COPY, type ResearchCopy } from "@/lib/research-copy";
import { formatDate } from "@/lib/research-format";

// Only the locale string crosses the server → client boundary; the dictionary
// (which contains functions) is imported on the client side.
const LocaleContext = createContext<Locale>("ja");

export function ResearchI18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useResearchI18n(): { locale: Locale; t: ResearchCopy; formatDate: (iso: string) => string } {
  const locale = useContext(LocaleContext);
  return useMemo(
    () => ({ locale, t: RESEARCH_COPY[locale], formatDate: (iso: string) => formatDate(iso, locale) }),
    [locale]
  );
}
