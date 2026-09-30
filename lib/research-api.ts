import { NextResponse } from "next/server";
import { APP_URL } from "@/lib/auth";
import { getActor } from "@/lib/research-auth";
import type { ResearchActor } from "@/lib/research-types";

export function jsonError(status: number, error: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error, ...extra }, { status });
}

export function artifactUrl(id: string) {
  return `${APP_URL}/research/a/${id}`;
}

export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/** Returns the actor or a ready-made 401 response. */
export async function requireActor(
  request: Request
): Promise<{ actor: ResearchActor; response: null } | { actor: null; response: NextResponse }> {
  const actor = await getActor(request);
  if (!actor) {
    return { actor: null, response: jsonError(401, "Unauthorized") };
  }
  return { actor, response: null };
}
