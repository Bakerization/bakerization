import { requireMcpAuth } from "@better-auth/mcp";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import type { JWTPayload } from "jose";
import * as z from "zod";
import { auth, MCP_RESOURCE, RESEARCH_SCOPE } from "@/lib/auth";
import {
  buildNewsItem,
  MAX_NEWS_BODY,
  MAX_NEWS_SUMMARY,
  MAX_NEWS_TITLE,
  type NewsInput,
  newsUrl,
} from "@/lib/news-input";
import { createNews, getNews, listNewsSummaries, updateNews } from "@/lib/news-store";
import type { NewsItem, NewsSummary } from "@/lib/news-types";
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
import type { ResearchArtifactMeta, ResearchMember } from "@/lib/research-types";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ─────────────────────────────────────────────────────────────
// Remote MCP server for Claude (claude.ai / Desktop / Cowork / Claude Code).
// Members add https://www.bakerization.com/api/mcp as a custom connector,
// sign in with their Research account (OAuth 2.1 via Better Auth), and Claude
// can then publish HTML artifacts straight into /research.
// Admins also get the news_* tools, which the "Bakerization NEWS" ChatGPT
// plugin (docs/chatgpt-plugin/bakerization-news) uses to post to /news.
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
    visibility: a.visibility,
    created_by: a.ownerName,
    updated_at: a.updatedAt,
  };
}

const visibilityField = z
  .enum(["members", "public"])
  .describe('"members" (default): only signed-in members can open it. "public": anyone with the link can open it without logging in.');

const projectSlugField = z
  .string()
  .max(80)
  .describe("Project slug (as returned by list_projects). Omit to use the default 'inbox' project.");

function publicNewsSummary(n: NewsSummary) {
  return {
    slug: n.slug,
    title: n.title,
    title_en: n.titleEn,
    summary: n.summary,
    published: n.published,
    published_at: n.publishedAt,
    has_english: n.hasEnglish,
    url: newsUrl(n.slug),
    updated_at: n.updatedAt,
  };
}

function publicNewsItem(n: NewsItem) {
  return {
    slug: n.slug,
    title: n.title,
    title_en: n.titleEn,
    summary: n.summary,
    summary_en: n.summaryEn,
    body_md: n.bodyMd,
    body_md_en: n.bodyMdEn,
    cover_image_url: n.coverImageUrl,
    published: n.published,
    published_at: n.publishedAt,
    url: newsUrl(n.slug),
    url_en: newsUrl(n.slug, "en"),
  };
}

const newsSlugField = z
  .string()
  .min(1)
  .max(80)
  .describe("News slug, as returned by news_list_posts (lowercase ASCII letters, digits and hyphens).");

const newsFields = {
  title: z.string().min(1).max(MAX_NEWS_TITLE).describe("Japanese title"),
  title_en: z.string().max(MAX_NEWS_TITLE).describe("English title. The English page (?lang=en) needs both title_en and body_md_en."),
  summary: z.string().max(MAX_NEWS_SUMMARY).describe("Japanese summary, about 120 characters: shown in the list, the home page and search results"),
  summary_en: z.string().max(MAX_NEWS_SUMMARY).describe("English summary"),
  body_md: z
    .string()
    .min(1)
    .max(MAX_NEWS_BODY)
    .describe("Japanese body in GitHub-flavored Markdown (headings, lists, links, tables). Raw HTML is not rendered. Do not repeat the title as a heading."),
  body_md_en: z.string().max(MAX_NEWS_BODY).describe("English body in GitHub-flavored Markdown"),
  published_at: z
    .string()
    .max(40)
    .describe("Date shown on the site and used for ordering, ISO 8601 (e.g. 2026-10-13T07:00:00+09:00). Defaults to now."),
  cover_image_url: z
    .string()
    .max(2000)
    .describe("Optional cover image: an https URL you are allowed to use. Leave empty rather than hotlinking images from news sites."),
};

function buildServer(member: ResearchMember | null) {
  const server = new McpServer({ name: "bakerization-research", version: "1.1.0" });

  async function requireMember() {
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
        `Max ${Math.round(MAX_HTML_BYTES / 1024)} KB; for pages over ~200 KB prefer the web upload on the site. ` +
        "Returns the artifact id and the URL to report back to the user. Use update_artifact to revise an existing artifact instead of publishing a duplicate.",
      inputSchema: z.object({
        title: z.string().min(1).max(MAX_TITLE_LENGTH).describe("Human-readable title shown in the gallery"),
        html: z.string().min(1).max(MAX_HTML_BYTES).describe("The complete HTML document"),
        project_slug: projectSlugField.optional(),
        description: z.string().max(MAX_DESCRIPTION_LENGTH).optional().describe("One or two sentences on what the page is"),
        visibility: visibilityField.optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ title, html, project_slug, description, visibility }) => {
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
        visibility: visibility ?? "members",
      });
      return text({ ...publicArtifact(artifact), message: `Published. Share this URL with the user: ${artifactUrl(artifact.id)}` });
    }
  );

  server.registerTool(
    "update_artifact",
    {
      title: "Update an existing artifact",
      description:
        "Replace the title, description, html and/or visibility of an artifact you published earlier (same id and URL are kept). Only the artifact's creator or an admin can replace its html or change visibility.",
      inputSchema: z.object({
        id: z.string().min(1).max(64).describe("Artifact id from publish_artifact / list_artifacts"),
        title: z.string().min(1).max(MAX_TITLE_LENGTH).optional(),
        description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
        html: z.string().min(1).max(MAX_HTML_BYTES).optional().describe("The complete new HTML document"),
        project_slug: projectSlugField.optional().describe("Move the artifact to another project"),
        visibility: visibilityField.optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ id, title, description, html, project_slug, visibility }) => {
      const member = await requireMember();
      const current = await getArtifactMeta(id);
      if (!current) return text(`Artifact "${id}" not found.`, true);
      const patch: { title?: string; description?: string; html?: string; projectId?: string; visibility?: "members" | "public" } = {};
      if (visibility) {
        if (member.role !== "admin" && current.ownerId !== member.id) {
          return text("Only the artifact's creator or an admin can change its visibility.", true);
        }
        patch.visibility = visibility;
      }
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

  // ── News (bakerization.com/news), admins only ─────────────────────
  // Not registered for other members, so their connectors never list them.
  if (member?.role === "admin") registerNewsTools(server, requireMember);

  return server;
}

function registerNewsTools(server: McpServer, requireMember: () => Promise<ResearchMember>) {
  async function requireAdmin() {
    const member = await requireMember();
    if (member.role !== "admin") throw new Error("Only Bakerization admins can manage news.");
    return member;
  }

  server.registerTool(
    "news_list_posts",
    {
      title: "List news posts",
      description:
        "List the most recent posts in Bakerization NEWS (bakerization.com/news), newest published_at first. " +
        "Use it before creating a post to check whether the slug already exists and what recent issues covered.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(50).optional().describe("How many posts to return (default 10)"),
        include_drafts: z.boolean().optional().describe("Also return unpublished drafts (default false)"),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ limit, include_drafts }) => {
      await requireAdmin();
      const posts = await listNewsSummaries({ includeUnpublished: include_drafts ?? false, limit: limit ?? 10 });
      return text(posts.map(publicNewsSummary));
    }
  );

  server.registerTool(
    "news_get_post",
    {
      title: "Get a news post",
      description: "Return one news post with its full Japanese and English Markdown bodies, published or draft.",
      inputSchema: z.object({ slug: newsSlugField }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ slug }) => {
      await requireAdmin();
      const item = await getNews(slug);
      return item ? text(publicNewsItem(item)) : text(`News post "${slug}" not found.`, true);
    }
  );

  server.registerTool(
    "news_create_post",
    {
      title: "Create a news post",
      description:
        "Create a post in Bakerization NEWS. With published=true it goes live at once on /news, the home page and the sitemap; " +
        "published=false saves a draft that an admin can review at /admen/news. " +
        "Fails without writing anything if the slug already exists: then read it with news_get_post and change it with news_update_post instead of creating a duplicate. " +
        "Returns the Japanese and English URLs to report back to the user.",
      inputSchema: z.object({
        slug: z
          .string()
          .max(80)
          .optional()
          .describe("URL slug, lowercase ASCII and hyphens, e.g. weekly-2026-10-06. Derived from title_en when omitted. It can't be changed later."),
        title: newsFields.title,
        title_en: newsFields.title_en.optional(),
        summary: newsFields.summary.optional(),
        summary_en: newsFields.summary_en.optional(),
        body_md: newsFields.body_md,
        body_md_en: newsFields.body_md_en.optional(),
        published: z.boolean().describe("true: publish now. false: save as a draft."),
        published_at: newsFields.published_at.optional(),
        cover_image_url: newsFields.cover_image_url.optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    async (args) => {
      await requireAdmin();
      const built = buildNewsItem(
        {
          slug: args.slug,
          title: args.title,
          titleEn: args.title_en,
          summary: args.summary,
          summaryEn: args.summary_en,
          bodyMd: args.body_md,
          bodyMdEn: args.body_md_en,
          coverImageUrl: args.cover_image_url,
          published: args.published,
          publishedAt: args.published_at,
        },
        "create"
      );
      if (!built.ok) return text(built.error, true);
      const { item } = built;
      if (!(await createNews(item))) {
        return text(
          `A news post with slug "${item.slug}" already exists. Read it with news_get_post and use news_update_post to change it; do not create a duplicate.`,
          true
        );
      }
      return text({
        ...publicNewsItem(item),
        message: item.published
          ? `Published. Share this URL with the user: ${newsUrl(item.slug)}`
          : `Saved as a draft (not public). Review it at ${SITE_URL}/admen/news/edit/${item.slug}`,
      });
    }
  );

  server.registerTool(
    "news_update_post",
    {
      title: "Update a news post",
      description:
        "Change an existing news post (the slug and URL stay the same). Pass only the fields to change; the rest are kept. " +
        "published=false takes a public post back to draft.",
      inputSchema: z.object({
        slug: newsSlugField,
        title: newsFields.title.optional(),
        title_en: newsFields.title_en.optional(),
        summary: newsFields.summary.optional(),
        summary_en: newsFields.summary_en.optional(),
        body_md: newsFields.body_md.optional(),
        body_md_en: newsFields.body_md_en.optional(),
        published: z.boolean().optional().describe("true: public. false: draft."),
        published_at: newsFields.published_at.optional(),
        cover_image_url: newsFields.cover_image_url.optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async (args) => {
      await requireAdmin();
      const current = await getNews(args.slug);
      if (!current) return text(`News post "${args.slug}" not found. Call news_list_posts with include_drafts=true to see slugs.`, true);
      const patch: NewsInput = {
        title: args.title,
        titleEn: args.title_en,
        summary: args.summary,
        summaryEn: args.summary_en,
        bodyMd: args.body_md,
        bodyMdEn: args.body_md_en,
        coverImageUrl: args.cover_image_url,
        published: args.published,
        publishedAt: args.published_at,
      };
      const merged: NewsInput = { ...current };
      for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined) Object.assign(merged, { [key]: value });
      }
      const built = buildNewsItem(merged, "update");
      if (!built.ok) return text(built.error, true);
      if (!(await updateNews(built.item))) return text(`News post "${args.slug}" not found.`, true);
      return text({ ...publicNewsItem(built.item), message: `Updated: ${newsUrl(built.item.slug)}` });
    }
  );
}

const mcpHandler = createMcpHandler(
  (ctx) => {
    const member = ctx.authInfo?.extra?.member;
    return buildServer(member ? (member as ResearchMember) : null);
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
  async (request, claims) => {
    // Resolved once per request: tools reuse it, and the role decides which
    // tools are listed.
    const member = claims.sub ? await getMemberById(claims.sub) : null;
    return mcpHandler.fetch(request, {
      authInfo: {
        token: "",
        clientId: String(claims.client_id ?? claims.azp ?? ""),
        scopes: scopesOf(claims),
        expiresAt: typeof claims.exp === "number" ? claims.exp : undefined,
        extra: { userId: claims.sub, member },
      },
    });
  },
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
