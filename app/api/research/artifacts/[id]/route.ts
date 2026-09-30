import { NextResponse } from "next/server";
import { canManage } from "@/lib/research-auth";
import { artifactUrl, jsonError, readJson, requireActor } from "@/lib/research-api";
import {
  normalizeDescription,
  validateArtifactHtml,
  MAX_TITLE_LENGTH,
} from "@/lib/research-html";
import {
  deleteArtifact,
  getArtifactMeta,
  getProjectBySlug,
  updateArtifact,
} from "@/lib/research-store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { response } = await requireActor(request);
  if (response) return response;
  const { id } = await params;
  const artifact = await getArtifactMeta(id);
  if (!artifact) return jsonError(404, "Artifact not found");
  return NextResponse.json({ artifact, url: artifactUrl(artifact.id) });
}

/**
 * PATCH { title?, description?, html?, projectSlug?, visibility? }
 * Any member may rename / describe / move; replacing html or changing
 * visibility needs owner or admin.
 */
export async function PATCH(request: Request, { params }: Params) {
  const { actor, response } = await requireActor(request);
  if (response) return response;
  const { id } = await params;
  const artifact = await getArtifactMeta(id);
  if (!artifact) return jsonError(404, "Artifact not found");

  const body = await readJson<{
    title?: unknown;
    description?: unknown;
    html?: unknown;
    projectSlug?: unknown;
    visibility?: unknown;
  }>(request);
  if (!body) return jsonError(400, "Body must be JSON");

  const patch: { title?: string; description?: string; html?: string; projectId?: string; visibility?: "members" | "public" } = {};

  if (body.visibility !== undefined) {
    if (body.visibility !== "public" && body.visibility !== "members") {
      return jsonError(400, 'visibility must be "members" or "public"');
    }
    if (!canManage(actor, artifact.ownerId)) {
      return jsonError(403, "Only the owner or an admin can change visibility");
    }
    patch.visibility = body.visibility;
  }

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title) return jsonError(400, "title cannot be empty");
    patch.title = title.slice(0, MAX_TITLE_LENGTH);
  }
  if (typeof body.description === "string") {
    patch.description = normalizeDescription(body.description);
  }
  if (body.html !== undefined) {
    if (!canManage(actor, artifact.ownerId)) {
      return jsonError(403, "Only the owner or an admin can replace the HTML");
    }
    const validation = validateArtifactHtml(body.html);
    if (!validation.ok) return jsonError(validation.status, validation.error);
    patch.html = validation.html;
  }
  if (typeof body.projectSlug === "string" && body.projectSlug) {
    const target = await getProjectBySlug(body.projectSlug);
    if (!target) return jsonError(404, `Project "${body.projectSlug}" not found`);
    patch.projectId = target.id;
  }

  const updated = await updateArtifact(id, patch);
  return NextResponse.json({ artifact: updated, url: artifactUrl(id) });
}

export async function DELETE(request: Request, { params }: Params) {
  const { actor, response } = await requireActor(request);
  if (response) return response;
  const { id } = await params;
  const artifact = await getArtifactMeta(id);
  if (!artifact) return jsonError(404, "Artifact not found");
  if (!canManage(actor, artifact.ownerId)) {
    return jsonError(403, "Only the owner or an admin can delete this artifact");
  }
  await deleteArtifact(id);
  return new NextResponse(null, { status: 204 });
}
