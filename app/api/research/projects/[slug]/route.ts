import { NextResponse } from "next/server";
import { canManage } from "@/lib/research-auth";
import { jsonError, readJson, requireActor } from "@/lib/research-api";
import {
  deleteProject,
  getProjectBySlug,
  listArtifacts,
  updateProject,
} from "@/lib/research-store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
  const { response } = await requireActor(request);
  if (response) return response;
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return jsonError(404, "Project not found");
  const artifacts = await listArtifacts(project.id);
  return NextResponse.json({ project, artifacts });
}

export async function PATCH(request: Request, { params }: Params) {
  const { actor, response } = await requireActor(request);
  if (response) return response;
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return jsonError(404, "Project not found");
  if (!canManage(actor, project.ownerId) && !project.isDefault) {
    return jsonError(403, "Only the project owner or an admin can edit this project");
  }
  if (project.isDefault && actor.role !== "admin") {
    return jsonError(403, "Only an admin can edit the default project");
  }
  const body = await readJson<{ name?: unknown; description?: unknown }>(request);
  const patch: { name?: string; description?: string } = {};
  if (typeof body?.name === "string" && body.name.trim()) patch.name = body.name.trim().slice(0, 120);
  if (typeof body?.description === "string") patch.description = body.description.slice(0, 2000);
  const updated = await updateProject(project.id, patch);
  return NextResponse.json({ project: updated });
}

export async function DELETE(request: Request, { params }: Params) {
  const { actor, response } = await requireActor(request);
  if (response) return response;
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return jsonError(404, "Project not found");
  if (project.isDefault) return jsonError(400, "The default project cannot be deleted");
  if (!canManage(actor, project.ownerId)) {
    return jsonError(403, "Only the project owner or an admin can delete this project");
  }
  await deleteProject(project.id);
  return new NextResponse(null, { status: 204 });
}
