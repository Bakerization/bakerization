import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LANG_COOKIE, LANG_COOKIE_MAX_AGE, LANG_HEADER, LANG_PARAM, parseLocaleParam } from "@/lib/locale";

function isPrefetch(req: NextRequest) {
  return (
    req.headers.has("next-router-prefetch") ||
    req.headers.get("purpose") === "prefetch" ||
    (req.headers.get("sec-purpose") ?? "").includes("prefetch")
  );
}

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Make /admin and /admin/* indistinguishable from any non-existent path.
  // The real admin entry point is /admen (intentionally misspelled).
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse(null, { status: 404 });
  }

  // /research needs no gate here: public views render for everyone and
  // members-only pages call notFound() themselves, so outsiders never get
  // pointed at a login page.

  // `?lang=` pins the language for this request (that's what crawlers index)
  // and is remembered in the cookie for later visits.
  const fromUrl = parseLocaleParam(searchParams.get(LANG_PARAM));
  const spoofed = req.headers.has(LANG_HEADER);
  if (!fromUrl && !spoofed) return NextResponse.next();

  const headers = new Headers(req.headers);
  headers.delete(LANG_HEADER); // trusted only when set right here
  if (fromUrl) headers.set(LANG_HEADER, fromUrl);
  const res = NextResponse.next({ request: { headers } });

  // Prefetches must not flip the user's language just because a link was hovered.
  if (fromUrl && !isPrefetch(req) && req.cookies.get(LANG_COOKIE)?.value !== fromUrl) {
    res.cookies.set(LANG_COOKIE, fromUrl, {
      path: "/",
      maxAge: LANG_COOKIE_MAX_AGE,
      sameSite: "lax",
      secure: req.nextUrl.protocol === "https:",
    });
  }
  return res;
}

export const config = {
  matcher: [
    "/((?!api/|_next/|\\.well-known/|research/raw/|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpe?g|gif|webp|avif|svg|ico|txt|xml|webmanifest|js|css|map|woff2?)$).*)",
  ],
};
