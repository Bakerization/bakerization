// Locale primitives shared by server components, client components and proxy.ts.
// Keep this module free of `next/headers`: pages take the locale from the
// `[locale]` route param (filled in by the rewrites in next.config.ts), so
// every public page can be prerendered.

export type Locale = "ja" | "en";

export const LOCALES = ["ja", "en"] as const satisfies readonly Locale[];
export const DEFAULT_LOCALE: Locale = "ja";

/** `?lang=en` in the URL selects English (crawlers send no cookies). */
export const LANG_PARAM = "lang";
/** Remembers the last `?lang=`; proxy.ts redirects clean URLs to `?lang=en` for en readers. */
export const LANG_COOKIE = "lang";
export const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return value === "ja" || value === "en";
}

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : "ja";
}

/**
 * Strict parse of a `?lang=` value: null unless it names a supported locale.
 * Case-sensitive on purpose: the rewrite rule in next.config.ts matches
 * `lang=en` exactly, and the site only ever emits lowercase.
 */
export function parseLocaleParam(value: string | null | undefined): Locale | null {
  return isLocale(value) ? value : null;
}

/** Locale from the `[locale]` route param. Internal paths only ever carry ja/en. */
export async function localeFromParams(params: Promise<{ locale: string }>): Promise<Locale> {
  return normalizeLocale((await params).locale);
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
