import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Paths under /research that must stay reachable without a session.
const RESEARCH_PUBLIC = [
  "/research/login",
  "/research/consent",
  "/research/invite",
  "/research/reset-password",
  "/research/forgot",
];

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Make /admin and /admin/* indistinguishable from any non-existent path.
  // The real admin entry point is /admen (intentionally misspelled).
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse(null, { status: 404 });
  }

  // Optimistic gate for the members area: no session cookie → login.
  // (Real authorization happens in each page / route via Better Auth.)
  if (pathname === "/research" || pathname.startsWith("/research/")) {
    const isPublic = RESEARCH_PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    const isRaw = pathname.startsWith("/research/raw/");
    if (!isPublic && !isRaw && !getSessionCookie(req)) {
      const login = req.nextUrl.clone();
      login.pathname = "/research/login";
      login.search = `?callbackUrl=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/research", "/research/:path*"],
};
