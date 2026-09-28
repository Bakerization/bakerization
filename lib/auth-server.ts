import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type AuthSession } from "@/lib/auth";

export type { AuthSession };
export type SessionUser = AuthSession["user"];

/** Session for the current request (deduped per request via React cache). */
export const getAuthSession = cache(async (): Promise<AuthSession | null> => {
  return auth.api.getSession({ headers: await headers() });
});

export function isAdmin(session: AuthSession | null | undefined) {
  return session?.user?.role === "admin";
}

function safeCallback(path: string, fallback: string) {
  return path.startsWith("/") && !path.startsWith("//") ? path : fallback;
}

/** Blog admin gate (/admen, /blog/new, /blog/edit). */
export async function requireAdmin(currentPath: string): Promise<AuthSession> {
  const session = await getAuthSession();
  if (!isAdmin(session)) {
    const cb = encodeURIComponent(safeCallback(currentPath, "/admen"));
    redirect(`/admen/login?callbackUrl=${cb}`);
  }
  return session as AuthSession;
}

/** Research members gate (/research/*). */
export async function requireMember(currentPath: string): Promise<AuthSession> {
  const session = await getAuthSession();
  if (!session) {
    const cb = encodeURIComponent(safeCallback(currentPath, "/research"));
    redirect(`/research/login?callbackUrl=${cb}`);
  }
  return session as AuthSession;
}

/** Research admin gate (/research/members). */
export async function requireResearchAdmin(currentPath: string): Promise<AuthSession> {
  const session = await requireMember(currentPath);
  if (!isAdmin(session)) {
    redirect("/research");
  }
  return session;
}
