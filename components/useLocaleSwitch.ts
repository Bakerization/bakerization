"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LANG_COOKIE, LANG_COOKIE_MAX_AGE, withLang, type Locale } from "@/lib/locale";

/**
 * Switch language: remember it in the cookie, put it in the URL (en → ?lang=en,
 * ja → clean URL, other params and #hash kept). The new URL is rewritten to
 * the other locale's prerendered tree (next.config.ts), which re-renders the
 * root layout (html lang, nav, footer, research header) as a soft navigation.
 * refresh() still runs to drop prefetched segments fetched under the old
 * language, which the router would otherwise reuse for a while.
 */
export function useLocaleSwitch(current: Locale) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const switchTo = useCallback(
    (next: Locale) => {
      const here = window.location.pathname + window.location.search + window.location.hash;
      const target = withLang(here, next);
      if (next === current && target === here) return;
      const secure = window.location.protocol === "https:" ? "; secure" : "";
      document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax${secure}`;
      startTransition(() => {
        if (target !== here) router.replace(target, { scroll: false });
        router.refresh();
      });
    },
    [current, router]
  );

  return { switchTo, pending };
}
