import { auth } from "@/lib/auth";
import { getMemberById } from "@/lib/research-store";
import type { ResearchActor } from "@/lib/research-types";

const API_KEY_PREFIX = "rk_";

/**
 * Resolves who is calling a research API route:
 *   1. `Authorization: Bearer rk_...` → member API key (scripts, Claude Code, curl)
 *   2. Better Auth session cookie      → browser
 */
export async function getActor(request: Request): Promise<ResearchActor | null> {
  const header = request.headers.get("authorization");
  if (header) {
    const match = /^Bearer\s+(.+)$/i.exec(header.trim());
    const token = match?.[1]?.trim();
    if (token && token.startsWith(API_KEY_PREFIX)) {
      const result = await auth.api.verifyApiKey({ body: { key: token } });
      if (!result.valid || !result.key) return null;
      const member = await getMemberById(result.key.referenceId);
      return member ? { ...member, via: "apikey" } : null;
    }
    // A bearer token that is not an API key is not accepted on REST routes.
    return null;
  }

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return null;
  const member = await getMemberById(session.user.id);
  return member ? { ...member, via: "session" } : null;
}

/** Owner or admin may edit / delete. */
export function canManage(actor: ResearchActor, ownerId: string | null) {
  return actor.role === "admin" || (ownerId !== null && actor.id === ownerId);
}
