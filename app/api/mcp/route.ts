import { requireMcpAuth } from "@better-auth/mcp";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import type { JWTPayload } from "jose";
import * as z from "zod";
import { auth, MCP_RESOURCE, RESEARCH_SCOPE } from "@/lib/auth";
import { artifactUrl } from "@/lib/research-api";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_HTML_BYTES,
  MAX_TITLE_LENGTH,
  normalizeDescription,
  normalizeTitle,
  validateArtifactHtml,
} from "@/lib/research-html";
import {
  createArtifact,
  createProject,
  getArtifactMeta,
  getDefaultProject,
  getMemberById,
  getProjectBySlug,
  listArtifacts,
  listProjects,
  updateArtifact,
} from "@/lib/research-store";
import type { ResearchArtifactMeta } from "@/lib/research-types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ─────────────────────────────────────────────────────────────
// Remote MCP server for Claude (claude.ai / Desktop / Cowork / Claude Code).
// Members add https://www.bakerization.com/api/mcp as a custom connector,
// sign in with their Research account (OAuth 2.1 via Better Auth), and Claude
// can then publish HTML artifacts straight into /research.
// ─────────────────────────────────────────────────────────────

function text(data: unknown, isError = false) {
  return {
    content: [{ type: "text" as const, text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }],
    isError,
  };
}

function publicArtifact(a: ResearchArtifactMeta) {
  return {
    id: a.id,
    url: artifactUrl(a.id),
    title: a.title,
    description: a.description,
    project_slug: a.projectSlug,
    size_bytes: a.sizeBytes,
    source: a.source,
    created_by: a.ownerName,
    updated_at: a.updatedAt,
  };
}

const projectSlugField = z
  .string()
  .max(80)
  .describe("Project slug (as returned by list_projects). Omit to use the default 'inbox' project.");

function buildServer(userId: string | undefined) {
  const server = new McpServer({ name: "bakerization-research", version: "1.0.0" });

  async function requireMember() {
    const member = userId ? await getMemberById(userId) : null;
    if (!member) throw new Error("The signed-in Research member could not be resolved. Reconnect the connector.");
    return member;
  }

  server.registerTool(
    "list_projects",
    {
      title: "List research projects",
      description:
        "List the projects in Bakerization Research (bakerization.com/research). Returns slug, name, description and artifact count. Use the slug with publish_artifact / list_artifacts.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      await requireMember();
      const projects = await listProjects();
      return text(
        projects.map((p) => ({
          slug: p.slug,
          name: p.name,
          description: p.description,
          artifact_count: p.artifactCount,
          is_default: p.isDefault,
          updated_at: p.updatedAt,
        }))
      );
    }
  );

  server.registerTool(
    "create_project",
    {
      title: "Create a research project",
      description: "Create a new project in Bakerization Research. Returns the project's slug.",
      inputSchema: z.object({
        name: z.string().min(1).max(120).describe("Display name, e.g. 'SV企業リサーチ'"),
        slug: z.string().min(1).max(60).optional().describe("Optional URL slug (lowercase, hyphens). Derived from the name when omitted."),
        description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
    },
    async ({ name, slug, description }) => {
      const member = await requireMember();
      const project = await createProject({ name, slug, description, ownerId: member.id });
      return text({ slug: project.slug, name: project.name, url: `${MCP_RESOURCE.replace(/\/api\/mcp$/, "")}/research/p/${project.slug}` });
    }
  );

  server.registerTool(
    "list_artifacts",
    {
      title: "List artifacts in a project",
      description: "List the HTML artifacts in a project, in their display order. Returns id, url, title, description.",
      inputSchema: z.object({ project_slug: projectSlugField.optional() }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ project_slug }) => {
      await requireMember();
      const project = project_slug ? await getProjectBySlug(project_slug) : await getDefaultProject();
      if (!project) return text(`Project "${project_slug}" not found. Call list_projects to see available slugs.`, true);
      const artifacts = await listArtifacts(project.id);
      return text({ project: { slug: project.slug, name: project.name }, artifacts: artifacts.map(publicArtifact) });
    }
  );

  server.registerTool(
    "publish_artifact",
    {
      title: "Publish an HTML artifact",
      description:
        "Publish a self-contained HTML page (the full document, including <!doctype html>) to Bakerization Research so every member can open it. " +
        "Pass the COMPLETE html string; inline all CSS/JS (CDN <script>/<link> tags to cdnjs/jsdelivr/unpkg/Google Fonts are fine). " +
        `Max ${Math.round(MAX_HTML_BYTES / 1024)} KB; for pages over ~150 KB prefer the web upload on the site. ` +
        "Returns the artifact id and the URL to report back to the user. Use update_artifact to revise an existing artifact instead of publishing a duplicate.",
      inputSchema: z.object({
        title: z.string().min(1).max(MAX_TITLE_LENGTH).describe("Human-readable title shown in the gallery"),
        html: z.string().min(1).max(MAX_HTML_BYTES).describe("The complete HTML document"),
        project_slug: projectSlugField.optional(),
        description: z.string().max(MAX_DESCRIPTION_LENGTH).optional().describe("One or two sentences on what the page is"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ title, html, project_slug, description }) => {
      const member = await requireMember();
      const validation = validateArtifactHtml(html);
      if (!validation.ok) return text(`Invalid html: ${validation.error}`, true);
      const project = project_slug ? await getProjectBySlug(project_slug) : await getDefaultProject();
      if (!project) return text(`Project "${project_slug}" not found. Call list_projects or create_project first.`, true);
      const artifact = await createArtifact({
        projectId: project.id,
        ownerId: member.id,
        title: normalizeTitle(title, validation.html),
        description: normalizeDescription(description),
        html: validation.html,
        sizeBytes: validation.sizeBytes,
        sha256: validation.sha256,
        source: "mcp",
      });
      return text({ ...publicArtifact(artifact), message: `Published. Share this URL with the user: ${artifactUrl(artifact.id)}` });
    }
  );

  server.registerTool(
    "update_artifact",
    {
      title: "Update an existing artifact",
      description:
        "Replace the title, description and/or html of an artifact you published earlier (same id and URL are kept). Only the artifact's creator or an admin can replace its html.",
      inputSchema: z.object({
        id: z.string().min(1).max(64).describe("Artifact id from publish_artifact / list_artifacts"),
        title: z.string().min(1).max(MAX_TITLE_LENGTH).optional(),
        description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
        html: z.string().min(1).max(MAX_HTML_BYTES).optional().describe("The complete new HTML document"),
        project_slug: projectSlugField.optional().describe("Move the artifact to another project"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ id, title, description, html, project_slug }) => {
      const member = await requireMember();
      const current = await getArtifactMeta(id);
      if (!current) return text(`Artifact "${id}" not found.`, true);
      const patch: { title?: string; description?: string; html?: string; projectId?: string } = {};
      if (title) patch.title = title.trim();
      if (description !== undefined) patch.description = normalizeDescription(description);
      if (html !== undefined) {
        if (member.role !== "admin" && current.ownerId !== member.id) {
          return text("Only the artifact's creator or an admin can replace its html.", true);
        }
        const validation = validateArtifactHtml(html);
        if (!validation.ok) return text(`Invalid html: ${validation.error}`, true);
        patch.html = validation.html;
      }
      if (project_slug) {
        const target = await getProjectBySlug(project_slug);
        if (!target) return text(`Project "${project_slug}" not found.`, true);
        patch.projectId = target.id;
      }
      const updated = await updateArtifact(id, patch);
      return updated ? text(publicArtifact(updated)) : text("Update failed.", true);
    }
  );

  server.registerTool(
    "get_artifact_url",
    {
      title: "Get an artifact's URL",
      description: "Return the viewer URL and metadata for an artifact id.",
      inputSchema: z.object({ id: z.string().min(1).max(64) }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ id }) => {
      await requireMember();
      const artifact = await getArtifactMeta(id);
      return artifact ? text(publicArtifact(artifact)) : text(`Artifact "${id}" not found.`, true);
    }
  );

  return server;
}

const mcpHandler = createMcpHandler(
  (ctx) => {
    const userId = ctx.authInfo?.extra?.userId;
    return buildServer(typeof userId === "string" ? userId : undefined);
  },
  {
    legacy: "stateless",
    onerror: (error) => console.error("[mcp]", error),
  }
);

function scopesOf(claims: JWTPayload) {
  const scope = claims.scope;
  if (typeof scope === "string") return scope.split(" ").filter(Boolean);
  if (Array.isArray(scope)) return scope.map(String);
  return [];
}

export const POST = requireMcpAuth(
  auth,
  (request, claims) =>
    mcpHandler.fetch(request, {
      authInfo: {
        token: "",
        clientId: String(claims.client_id ?? claims.azp ?? ""),
        scopes: scopesOf(claims),
        expiresAt: typeof claims.exp === "number" ? claims.exp : undefined,
        extra: { userId: claims.sub },
      },
    }),
  {
    resource: MCP_RESOURCE,
    requiredScopes: [RESEARCH_SCOPE],
    challengeScopes: [RESEARCH_SCOPE],
  }
);

// Streamable HTTP clients may probe with GET (SSE stream) / DELETE (session end).
// This server is stateless, so answer 405 rather than 404.
export function GET() {
  return new Response("Method Not Allowed", { status: 405, headers: { allow: "POST" } });
}
export const DELETE = GET;
