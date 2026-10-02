import { cache } from "react";
import { cookies, headers } from "next/headers";
import { LANG_COOKIE, LANG_HEADER, normalizeLocale, parseLocaleParam, type Locale } from "@/lib/locale";

export * from "@/lib/locale";

/**
 * Locale for the current request: `?lang=` (forwarded by proxy.ts as a header)
 * → `lang` cookie → ja. Deduped per request.
 */
export const getServerLocale = cache(async (): Promise<Locale> => {
  const fromUrl = parseLocaleParam((await headers()).get(LANG_HEADER));
  if (fromUrl) return fromUrl;
  return normalizeLocale((await cookies()).get(LANG_COOKIE)?.value);
});
