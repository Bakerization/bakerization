import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE, LANG_COOKIE_MAX_AGE, LANG_PARAM, parseLocaleParam } from "@/lib/locale";

// ─────────────────────────────────────────────────────────────
// Runs only for the requests listed in `config.matcher` below (cookie / query
// conditions included), so a plain Japanese visitor without cookies is served
// straight from the CDN without this function. Responsibilities:
//   1. /admin*                → 404 (the real entry point is /admen)
//   2. cookie lang=en, no ?lang → 307 to the ?lang=en URL (sticky English)
//   3. /research* + session cookie → rewrite to the dynamic member tree
//   4. ?lang= differs from the cookie → remember it (not on prefetches)
// ─────────────────────────────────────────────────────────────

// Better Auth's session cookie; `__Secure-` is prefixed when BETTER_AUTH_URL is https.
const SESSION_COOKIES = ["__Secure-better-auth.session_token", "better-auth.session_token"];
// Public research URLs that have a members-only twin under app/[locale]/m/research/.
const MEMBER_VIEW = /^\/research(?:\/(?:p|a)\/[^/]+|\/settings|\/members)?$/;

function isPrefetch(req: NextRequest) {
  return (
    req.headers.has("next-router-prefetch") ||
    req.headers.has("next-router-segment-prefetch") ||
    req.headers.get("purpose") === "prefetch" ||
    (req.headers.get("sec-purpose") ?? "").includes("prefetch")
  );
}

function hasSession(req: NextRequest) {
  return SESSION_COOKIES.some((name) => req.cookies.has(name));
}

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;

  // Make /admin and /admin/* indistinguishable from any non-existent path.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse(null, { status: 404 });
  }

  const fromUrl = parseLocaleParam(url.searchParams.get(LANG_PARAM));
  const fromCookie = parseLocaleParam(req.cookies.get(LANG_COOKIE)?.value);

  // Sticky English: the remembered language is en but the URL is the clean
  // (Japanese) form. 307, never 308: it depends on a cookie and must not be
  // cached. Applied to documents, RSC navigations and prefetches alike; the
  // client router follows the redirect and keeps the final URL.
  if (fromCookie === "en" && !url.searchParams.has(LANG_PARAM)) {
    const target = url.clone();
    target.searchParams.set(LANG_PARAM, "en");
    return NextResponse.redirect(target, 307);
  }

  // Members get the dynamic member tree for the public research URLs. The
  // locale is folded into the internal path so the member layout reads it
  // from params like every other page.
  let res: NextResponse;
  if (MEMBER_VIEW.test(pathname) && hasSession(req)) {
    const target = url.clone();
    target.pathname = `/${fromUrl ?? "ja"}/m${pathname}`;
    res = NextResponse.rewrite(target);
  } else {
    res = NextResponse.next();
  }

  // `?lang=` is remembered, but not on prefetches: hovering a link must not
  // flip the user's language.
  if (fromUrl && fromUrl !== fromCookie && !isPrefetch(req)) {
    res.cookies.set(LANG_COOKIE, fromUrl, {
      path: "/",
      maxAge: LANG_COOKIE_MAX_AGE,
      sameSite: "lax",
      secure: url.protocol === "https:",
    });
  }
  return res;
}

// Literals only: Next extracts this statically at build time.
export const config = {
  matcher: [
    // 1. /admin*
    "/admin/:path*",
    // 2. sticky English: cookie says en, URL has no ?lang
    {
      source:
        "/((?!api/|_next/|\\.well-known/|research/raw/|ja(?:/|$)|en(?:/|$)|m(?:/|$)|(?:.*/)?opengraph-image$|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|txt|xml|webmanifest|js|css|map|woff2?)$).*)",
      has: [{ type: "cookie", key: "lang", value: "en" }],
      missing: [{ type: "query", key: "lang" }],
    },
    // 4. ?lang differs from the cookie → write the cookie
    {
      source: "/((?!api/|_next/|\\.well-known/|research/raw/).*)",
      has: [{ type: "query", key: "lang", value: "en" }],
      missing: [{ type: "cookie", key: "lang", value: "en" }],
    },
    {
      source: "/((?!api/|_next/|\\.well-known/|research/raw/).*)",
      has: [{ type: "query", key: "lang", value: "ja" }],
      missing: [{ type: "cookie", key: "lang", value: "ja" }],
    },
    // 3. research member split: only when a session cookie is present
    { source: "/research", has: [{ type: "cookie", key: "__Secure-better-auth.session_token" }] },
    { source: "/research", has: [{ type: "cookie", key: "better-auth.session_token" }] },
    { source: "/research/:area(p|a|settings|members)/:rest*", has: [{ type: "cookie", key: "__Secure-better-auth.session_token" }] },
    { source: "/research/:area(p|a|settings|members)/:rest*", has: [{ type: "cookie", key: "better-auth.session_token" }] },
  ],
};
