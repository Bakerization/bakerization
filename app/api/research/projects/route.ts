import { NextResponse } from "next/server";
import { jsonError, readJson, requireActor } from "@/lib/research-api";
import { createProject, listProjects } from "@/lib/research-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { response } = await requireActor(request);
  if (response) return response;
  return NextResponse.json({ projects: await listProjects() });
}

export async function POST(request: Request) {
  const { actor, response } = await requireActor(request);
  if (response) return response;

  const body = await readJson<{ name?: unknown; slug?: unknown; description?: unknown }>(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return jsonError(400, "name is required");
  if (name.length > 120) return jsonError(400, "name is too long (max 120)");
  const slug = typeof body?.slug === "string" ? body.slug.trim() : undefined;
  const description = typeof body?.description === "string" ? body.description.slice(0, 2000) : "";

  const project = await createProject({ name, slug, description, ownerId: actor.id });
  return NextResponse.json({ project }, { status: 201 });
}
