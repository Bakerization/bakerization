import { NextResponse } from "next/server";
import { jsonError, readJson, requireActor } from "@/lib/research-api";
import { getProjectBySlug, reorderArtifacts } from "@/lib/research-store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

/** PUT { orderedIds: string[] } — any member can reorder. */
export async function PUT(request: Request, { params }: Params) {
  const { response } = await requireActor(request);
  if (response) return response;
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return jsonError(404, "Project not found");

  const body = await readJson<{ orderedIds?: unknown }>(request);
  const ids = Array.isArray(body?.orderedIds) ? body.orderedIds : null;
  if (!ids || !ids.every((id) => typeof id === "string" && id.length > 0 && id.length < 64)) {
    return jsonError(400, "orderedIds must be an array of ids");
  }
  if (new Set(ids).size !== ids.length) return jsonError(400, "orderedIds contains duplicates");
  if (ids.length > 1000) return jsonError(400, "too many ids");

  await reorderArtifacts(project.id, ids as string[]);
  return NextResponse.json({ ok: true });
}
