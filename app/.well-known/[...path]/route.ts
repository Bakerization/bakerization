import { auth } from "@/lib/auth";

// OAuth discovery documents (RFC 8414 / RFC 9728) are produced by Better Auth's
// oauth-provider / mcp plugins. They must live at the site root, so this catch-all
// forwards /.well-known/* to the auth handler:
//   /.well-known/oauth-authorization-server[/api/auth]
//   /.well-known/oauth-protected-resource[/api/mcp]
//   /.well-known/openid-configuration
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return auth.handler(request);
}

export const HEAD = GET;
