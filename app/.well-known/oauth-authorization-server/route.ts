import { auth } from "@/lib/auth";

// Root-level alias (RFC 8414 clients may probe this before the path-inserted form).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/.well-known/oauth-authorization-server/api/auth";
  return auth.handler(new Request(url, { headers: request.headers }));
}
export const HEAD = GET;
