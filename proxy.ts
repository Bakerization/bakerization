import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Make /admin and /admin/* indistinguishable from any non-existent path.
// The real admin entry point is /admen (intentionally misspelled).
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
