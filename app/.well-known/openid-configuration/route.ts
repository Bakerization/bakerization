import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/api/auth/.well-known/openid-configuration";
  return auth.handler(new Request(url, { headers: request.headers }));
}
export const HEAD = GET;
