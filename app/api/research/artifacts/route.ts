import { NextResponse } from "next/server";
import { artifactUrl, jsonError, requireActor } from "@/lib/research-api";
import {
  normalizeDescription,
  normalizeTitle,
  validateArtifactHtml,
} from "@/lib/research-html";
import {
  createArtifact,
  getDefaultProject,
  getProjectBySlug,
  listArtifacts,
} from "@/lib/research-store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const { response } = await requireActor(request);
  if (response) return response;
  const slug = new URL(request.url).searchParams.get("project") ?? "";
  const project = slug ? await getProjectBySlug(slug) : await getDefaultProject();
  if (!project) return jsonError(404, "Project not found");
  const artifacts = await listArtifacts(project.id);
  return NextResponse.json({
    project,
    artifacts: artifacts.map((a) => ({ ...a, url: artifactUrl(a.id) })),
  });
}

type Incoming = {
  html: unknown;
  title: unknown;
  description: unknown;
  projectSlug: string;
  visibility: unknown;
};

async function parseIncoming(request: Request): Promise<Incoming | NextResponse> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    let html: unknown = form.get("html");
    if (file instanceof File) {
      const name = file.name.toLowerCase();
      if (!(name.endsWith(".html") || name.endsWith(".htm") || file.type === "text/html")) {
        return jsonError(400, "file must be an .html document");
      }
      html = await file.text();
    }
    const title = form.get("title");
    return {
      html,
      title: typeof title === "string" && title.trim() ? title : file instanceof File ? undefined : title,
      description: form.get("description"),
      projectSlug: String(form.get("projectSlug") ?? form.get("project") ?? ""),
      visibility: form.get("visibility"),
    };
  }
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError(400, "Body must be JSON or multipart/form-data");
  }
  return {
    html: body.html,
    title: body.title,
    description: body.description,
    projectSlug: String(body.projectSlug ?? body.project ?? ""),
    visibility: body.visibility,
  };
}

/**
 * POST — create an artifact.
 *   JSON:      { html, title?, description?, projectSlug?, visibility?: "members" | "public" }
 *   multipart: file=@page.html (or html=...), title?, description?, projectSlug?, visibility?
 */
export async function POST(request: Request) {
  const { actor, response } = await requireActor(request);
  if (response) return response;

  const incoming = await parseIncoming(request);
  if (incoming instanceof NextResponse) return incoming;

  const validation = validateArtifactHtml(incoming.html);
  if (!validation.ok) return jsonError(validation.status, validation.error);

  const project = incoming.projectSlug
    ? await getProjectBySlug(incoming.projectSlug)
    : await getDefaultProject();
  if (!project) return jsonError(404, `Project "${incoming.projectSlug}" not found`);

  const artifact = await createArtifact({
    projectId: project.id,
    ownerId: actor.id,
    title: normalizeTitle(incoming.title, validation.html),
    description: normalizeDescription(incoming.description),
    html: validation.html,
    sizeBytes: validation.sizeBytes,
    sha256: validation.sha256,
    source: actor.via === "apikey" ? "api" : "web",
    visibility: incoming.visibility === "public" ? "public" : "members",
  });

  return NextResponse.json({ artifact, url: artifactUrl(artifact.id) }, { status: 201 });
}
