// Locale primitives shared by server components, client components and proxy.ts.
// Keep this module free of `next/headers` (lib/i18n.ts adds the server-only reader).

export type Locale = "ja" | "en";

export const LOCALES = ["ja", "en"] as const satisfies readonly Locale[];
export const DEFAULT_LOCALE: Locale = "ja";

/** `?lang=en` in the URL wins over the cookie (crawlers send no cookies). */
export const LANG_PARAM = "lang";
export const LANG_COOKIE = "lang";
/** Set only by proxy.ts from `?lang=`; any client-sent value is stripped there. */
export const LANG_HEADER = "x-lang";
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : "ja";
}

/** Strict parse of a `?lang=` value: null unless it names a supported locale. */
export function parseLocaleParam(value: string | null | undefined): Locale | null {
  const v = value?.trim().toLowerCase();
  return v === "ja" || v === "en" ? v : null;
}

/**
 * Same-site href with the language pinned in the URL: en → `?lang=en`, ja → no
 * `lang` param (the clean URL is the Japanese one). Other params and #hash are kept.
 * Hash-only, mailto:/tel: and external hrefs are returned unchanged.
 */
export function withLang(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const hashAt = href.indexOf("#");
  const hash = hashAt >= 0 ? href.slice(hashAt) : "";
  const beforeHash = hashAt >= 0 ? href.slice(0, hashAt) : href;
  const queryAt = beforeHash.indexOf("?");
  const path = queryAt >= 0 ? beforeHash.slice(0, queryAt) : beforeHash;
  const params = new URLSearchParams(queryAt >= 0 ? beforeHash.slice(queryAt + 1) : "");
  params.delete(LANG_PARAM);
  if (locale !== DEFAULT_LOCALE) params.set(LANG_PARAM, locale);
  const query = params.toString();
  return `${path}${query ? `?${query}` : ""}${hash}`;
}
