import { neon } from "@neondatabase/serverless";
import { revalidatePath, revalidateTag } from "next/cache";
import { toSlug } from "@/lib/slug";
import { artifactCacheTag } from "@/lib/research-url";
import { sha256Hex } from "@/lib/research-html";
import { DEFAULT_PROJECT_SLUG, ensureResearchTables, newId } from "@/lib/research-schema";
import type {
  ArtifactSource,
  ArtifactVisibility,
  ResearchArtifactMeta,
  ResearchMember,
  ResearchProject,
} from "@/lib/research-types";

// ─────────────────────────────────────────────────────────────
// Research store: projects + HTML artifacts in Neon Postgres.
// Schema lives in lib/research-schema.ts and is only ensured on create
// paths (and by `npm run ensure:tables`); reads never run DDL. HTML lives
// in a text column (≤ 2 MB); list queries never select it.
// ─────────────────────────────────────────────────────────────

export { DEFAULT_PROJECT_SLUG, newId };

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  return neon(url);
}

/**
 * Reads on a brand-new database (tables not created yet) return `fallback`
 * instead of throwing: the gallery shows its empty state until the first
 * write (or `npm run ensure:tables`) creates the schema.
 */
function withTables<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  return fn().catch((error: unknown) => {
    if ((error as { code?: string } | null)?.code === "42P01") return fallback;
    throw error;
  });
}

/**
 * Purges everything prerendered from research data: the anonymous /research
 * pages (both languages), the sitemap, and the CDN copies of the given
 * artifacts' raw HTML. Paths are the internal route patterns (+ type) because
 * the public URLs are rewritten to /[locale]/…; see next.config.ts. Every
 * writer (web UI, REST, MCP) goes through the mutations below, which all run
 * inside route handlers. (The OG image routes are rendered per request.)
 */
function revalidateResearch(artifactIds: string[] = []) {
  try {
    revalidatePath("/[locale]/research", "layout");
    revalidatePath("/sitemap.xml");
    for (const id of artifactIds) {
      // { expire: 0 } = purge now (same as the one-argument form, without its deprecation warning).
      revalidateTag(artifactCacheTag(id), { expire: 0 });
    }
  } catch (error) {
    console.error("[research-store] revalidate failed", error);
  }
}

function iso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return new Date(value).toISOString();
  return new Date().toISOString();
}

type ProjectRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  owner_id: string | null;
  is_default: boolean;
  artifact_count: number | string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

type ArtifactRow = {
  id: string;
  project_id: string;
  project_slug: string;
  project_name: string;
  owner_id: string | null;
  owner_name: string | null;
  owner_email: string | null;
  title: string;
  description: string;
  size_bytes: number;
  sha256: string;
  position: number;
  source: ArtifactSource;
  visibility: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

function mapProject(row: ProjectRow): ResearchProject {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    ownerId: row.owner_id,
    isDefault: Boolean(row.is_default),
    artifactCount: Number(row.artifact_count ?? 0),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function mapArtifact(row: ArtifactRow): ResearchArtifactMeta {
  return {
    id: row.id,
    projectId: row.project_id,
    projectSlug: row.project_slug,
    projectName: row.project_name,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    title: row.title,
    description: row.description ?? "",
    sizeBytes: Number(row.size_bytes),
    sha256: row.sha256,
    position: Number(row.position),
    source: row.source,
    visibility: row.visibility === "public" ? "public" : "members",
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

const PROJECT_SELECT = `
  SELECT p.id, p.slug, p.name, p.description, p.owner_id, p.is_default,
         p.created_at, p.updated_at,
         (SELECT COUNT(*) FROM research_artifacts a WHERE a.project_id = p.id) AS artifact_count
  FROM research_projects p
`;

const ARTIFACT_SELECT = `
  SELECT a.id, a.project_id, p.slug AS project_slug, p.name AS project_name, a.owner_id,
         u.name AS owner_name, u.email AS owner_email,
         a.title, a.description, a.size_bytes, a.sha256, a.position, a.source, a.visibility,
         a.created_at, a.updated_at
  FROM research_artifacts a
  JOIN research_projects p ON p.id = a.project_id
  LEFT JOIN "user" u ON u.id = a.owner_id
`;

// ── Members (Better Auth "user" table, read-only here) ─────────────────

export async function getMemberById(id: string): Promise<ResearchMember | null> {
  if (!hasDatabaseUrl() || !id) return null;
  const sql = getSql();
  const rows = (await sql`
    SELECT id, name, email, role, banned FROM "user" WHERE id = ${id} LIMIT 1
  `) as Array<{ id: string; name: string; email: string; role: string | null; banned: boolean | null }>;
  const row = rows[0];
  if (!row || row.banned) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role === "admin" ? "admin" : "member",
  };
}

export async function getMemberByEmail(email: string): Promise<ResearchMember | null> {
  if (!hasDatabaseUrl() || !email) return null;
  const sql = getSql();
  const rows = (await sql`
    SELECT id, name, email, role, banned FROM "user" WHERE lower(email) = lower(${email}) LIMIT 1
  `) as Array<{ id: string; name: string; email: string; role: string | null; banned: boolean | null }>;
  const row = rows[0];
  if (!row) return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role === "admin" ? "admin" : "member" };
}

// ── Projects ───────────────────────────────────────────────────────────

export async function listProjects(): Promise<ResearchProject[]> {
  if (!hasDatabaseUrl()) return [];
  return withTables([], async () => {
    const rows = (await getSql().query(
      `${PROJECT_SELECT} ORDER BY p.is_default DESC, p.updated_at DESC`
    )) as ProjectRow[];
    return rows.map(mapProject);
  });
}

export async function getProjectBySlug(slug: string): Promise<ResearchProject | null> {
  if (!hasDatabaseUrl() || !slug) return null;
  return withTables(null, async () => {
    const rows = (await getSql().query(`${PROJECT_SELECT} WHERE p.slug = $1 LIMIT 1`, [slug])) as ProjectRow[];
    return rows[0] ? mapProject(rows[0]) : null;
  });
}

export async function getProjectById(id: string): Promise<ResearchProject | null> {
  if (!hasDatabaseUrl() || !id) return null;
  return withTables(null, async () => {
    const rows = (await getSql().query(`${PROJECT_SELECT} WHERE p.id = $1 LIMIT 1`, [id])) as ProjectRow[];
    return rows[0] ? mapProject(rows[0]) : null;
  });
}

export async function getDefaultProject(): Promise<ResearchProject> {
  let project = await getProjectBySlug(DEFAULT_PROJECT_SLUG);
  if (!project) {
    // Fresh database: the schema bootstrap seeds the inbox project.
    await ensureResearchTables();
    project = await getProjectBySlug(DEFAULT_PROJECT_SLUG);
  }
  if (!project) throw new Error("Default research project is missing.");
  return project;
}

function baseSlug(name: string, explicit?: string) {
  const source = (explicit || name).trim();
  const slug = toSlug(source);
  // toSlug falls back to `post-<timestamp>` for empty input.
  return /^post-\d+$/.test(slug) ? `project-${Date.now().toString(36)}` : slug.slice(0, 60);
}

async function uniqueProjectSlug(base: string) {
  const sql = getSql();
  let candidate = base;
  for (let i = 2; i < 1000; i += 1) {
    const rows = (await sql`SELECT 1 FROM research_projects WHERE slug = ${candidate} LIMIT 1`) as unknown[];
    if (rows.length === 0) return candidate;
    candidate = `${base}-${i}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function createProject(input: {
  name: string;
  slug?: string;
  description?: string;
  ownerId: string | null;
}): Promise<ResearchProject> {
  await ensureResearchTables();
  const sql = getSql();
  const id = newId();
  const slug = await uniqueProjectSlug(baseSlug(input.name, input.slug));
  await sql`
    INSERT INTO research_projects (id, slug, name, description, owner_id)
    VALUES (${id}, ${slug}, ${input.name.trim()}, ${input.description?.trim() ?? ""}, ${input.ownerId})
  `;
  const project = await getProjectById(id);
  if (!project) throw new Error("Failed to create project.");
  revalidateResearch();
  return project;
}

export async function updateProject(
  id: string,
  patch: { name?: string; description?: string }
): Promise<ResearchProject | null> {
  const current = await getProjectById(id);
  if (!current) return null;
  const sql = getSql();
  await sql`
    UPDATE research_projects
    SET name = ${patch.name?.trim() || current.name},
        description = ${patch.description !== undefined ? patch.description.trim() : current.description},
        updated_at = NOW()
    WHERE id = ${id}
  `;
  revalidateResearch();
  return getProjectById(id);
}

/** Deletes a project; its artifacts move to the default project. Refuses the default project. */
export async function deleteProject(id: string): Promise<boolean> {
  const project = await getProjectById(id);
  if (!project || project.isDefault) return false;
  const inbox = await getDefaultProject();
  const sql = getSql();
  const moved = (await sql`SELECT id FROM research_artifacts WHERE project_id = ${id}`) as Array<{ id: string }>;
  await sql.transaction([
    sql`
      UPDATE research_artifacts
      SET project_id = ${inbox.id},
          position = position + COALESCE((SELECT MAX(position) + 1 FROM research_artifacts WHERE project_id = ${inbox.id}), 0),
          updated_at = NOW()
      WHERE project_id = ${id}
    `,
    sql`DELETE FROM research_projects WHERE id = ${id}`,
  ]);
  revalidateResearch(moved.map((row) => row.id));
  return true;
}

// ── Artifacts ──────────────────────────────────────────────────────────

export async function listArtifacts(projectId: string): Promise<ResearchArtifactMeta[]> {
  if (!hasDatabaseUrl()) return [];
  return withTables([], async () => {
    const rows = (await getSql().query(
      `${ARTIFACT_SELECT} WHERE a.project_id = $1 ORDER BY a.position ASC, a.created_at ASC`,
      [projectId]
    )) as ArtifactRow[];
    return rows.map(mapArtifact);
  });
}

/**
 * Public (no-login) artifacts: newest first site-wide (sitemap, public index),
 * or in board order within one project.
 */
export async function listPublicArtifacts(opts: { projectId?: string; limit?: number } = {}): Promise<ResearchArtifactMeta[]> {
  if (!hasDatabaseUrl()) return [];
  const limit = Math.min(Math.max(Math.trunc(opts.limit ?? 5000), 1), 5000);
  return withTables([], async () => {
    const sql = getSql();
    const rows = (opts.projectId
      ? await sql.query(
          `${ARTIFACT_SELECT} WHERE a.visibility = 'public' AND a.project_id = $1
           ORDER BY a.position ASC, a.created_at ASC LIMIT ${limit}`,
          [opts.projectId]
        )
      : await sql.query(`${ARTIFACT_SELECT} WHERE a.visibility = 'public' ORDER BY a.updated_at DESC LIMIT ${limit}`)) as ArtifactRow[];
    return rows.map(mapArtifact);
  });
}

// Projects as outsiders see them: only those with at least one public artifact,
// counting public artifacts only, "updated" = newest public artifact.
const PUBLIC_PROJECT_SELECT = `
  SELECT p.id, p.slug, p.name, p.description, NULL AS owner_id, p.is_default,
         p.created_at, MAX(a.updated_at) AS updated_at, COUNT(a.id) AS artifact_count
  FROM research_projects p
  JOIN research_artifacts a ON a.project_id = p.id AND a.visibility = 'public'
`;

export async function listPublicProjects(): Promise<ResearchProject[]> {
  if (!hasDatabaseUrl()) return [];
  return withTables([], async () => {
    const rows = (await getSql().query(
      `${PUBLIC_PROJECT_SELECT} GROUP BY p.id ORDER BY MAX(a.updated_at) DESC`
    )) as ProjectRow[];
    return rows.map(mapProject);
  });
}

export async function getPublicProjectBySlug(slug: string): Promise<ResearchProject | null> {
  if (!hasDatabaseUrl() || !slug) return null;
  return withTables(null, async () => {
    const rows = (await getSql().query(`${PUBLIC_PROJECT_SELECT} WHERE p.slug = $1 GROUP BY p.id LIMIT 1`, [slug])) as ProjectRow[];
    return rows[0] ? mapProject(rows[0]) : null;
  });
}

/** Strip who uploaded it before an artifact goes to an anonymous visitor's browser. */
export function toPublicArtifact(artifact: ResearchArtifactMeta): ResearchArtifactMeta {
  return { ...artifact, ownerId: null, ownerName: null, ownerEmail: null };
}

export async function getArtifactMeta(id: string): Promise<ResearchArtifactMeta | null> {
  if (!hasDatabaseUrl() || !id) return null;
  return withTables(null, async () => {
    const rows = (await getSql().query(`${ARTIFACT_SELECT} WHERE a.id = $1 LIMIT 1`, [id])) as ArtifactRow[];
    return rows[0] ? mapArtifact(rows[0]) : null;
  });
}

/** Just the HTML body (up to 2 MB). Metadata comes from getArtifactMeta(). */
export async function readArtifactHtml(id: string): Promise<string | null> {
  if (!hasDatabaseUrl() || !id) return null;
  return withTables(null, async () => {
    const rows = (await getSql()`
      SELECT html FROM research_artifacts WHERE id = ${id} LIMIT 1
    `) as Array<{ html: string }>;
    return rows[0]?.html ?? null;
  });
}

export async function createArtifact(input: {
  projectId: string;
  ownerId: string | null;
  title: string;
  description: string;
  html: string;
  sizeBytes: number;
  sha256: string;
  source: ArtifactSource;
  visibility?: ArtifactVisibility;
}): Promise<ResearchArtifactMeta> {
  await ensureResearchTables();
  const sql = getSql();
  const id = newId();
  await sql.transaction([
    sql`
      INSERT INTO research_artifacts
        (id, project_id, owner_id, title, description, html, size_bytes, sha256, position, source, visibility)
      SELECT ${id}, ${input.projectId}, ${input.ownerId}, ${input.title}, ${input.description},
             ${input.html}, ${input.sizeBytes}, ${input.sha256},
             COALESCE(MAX(position) + 1, 0), ${input.source}, ${input.visibility ?? "members"}
      FROM research_artifacts WHERE project_id = ${input.projectId}
    `,
    sql`UPDATE research_projects SET updated_at = NOW() WHERE id = ${input.projectId}`,
  ]);
  const meta = await getArtifactMeta(id);
  if (!meta) throw new Error("Failed to create artifact.");
  revalidateResearch([id]);
  return meta;
}

export async function updateArtifact(
  id: string,
  patch: { title?: string; description?: string; html?: string; projectId?: string; visibility?: ArtifactVisibility }
): Promise<ResearchArtifactMeta | null> {
  const current = await getArtifactMeta(id);
  if (!current) return null;
  const sql = getSql();
  const title = patch.title?.trim() || current.title;
  const description = patch.description !== undefined ? patch.description : current.description;
  const visibility = patch.visibility ?? current.visibility;
  const moving = Boolean(patch.projectId && patch.projectId !== current.projectId);
  const targetProject = patch.projectId ?? current.projectId;

  const queries = [];
  if (patch.html !== undefined) {
    const sizeBytes = Buffer.byteLength(patch.html, "utf8");
    queries.push(sql`
      UPDATE research_artifacts
      SET title = ${title}, description = ${description}, visibility = ${visibility},
          html = ${patch.html}, size_bytes = ${sizeBytes}, sha256 = ${sha256Hex(patch.html)},
          updated_at = NOW()
      WHERE id = ${id}
    `);
  } else {
    queries.push(sql`
      UPDATE research_artifacts
      SET title = ${title}, description = ${description}, visibility = ${visibility}, updated_at = NOW()
      WHERE id = ${id}
    `);
  }
  if (moving) {
    queries.push(sql`
      UPDATE research_artifacts
      SET project_id = ${targetProject},
          position = COALESCE((SELECT MAX(position) + 1 FROM research_artifacts WHERE project_id = ${targetProject}), 0)
      WHERE id = ${id}
    `);
    queries.push(sql`UPDATE research_projects SET updated_at = NOW() WHERE id = ${current.projectId}`);
  }
  queries.push(sql`UPDATE research_projects SET updated_at = NOW() WHERE id = ${targetProject}`);
  await sql.transaction(queries);
  revalidateResearch([id]);
  return getArtifactMeta(id);
}

export async function deleteArtifact(id: string): Promise<boolean> {
  const current = await getArtifactMeta(id);
  if (!current) return false;
  const sql = getSql();
  await sql.transaction([
    sql`DELETE FROM research_artifacts WHERE id = ${id}`,
    sql`UPDATE research_projects SET updated_at = NOW() WHERE id = ${current.projectId}`,
  ]);
  revalidateResearch([id]);
  return true;
}

/** Persists a full ordering for a project. Ids not in the list keep their position. */
export async function reorderArtifacts(projectId: string, orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) return;
  const sql = getSql();
  await sql.transaction(
    orderedIds.map(
      (artifactId, index) => sql`
        UPDATE research_artifacts
        SET position = ${index}
        WHERE id = ${artifactId} AND project_id = ${projectId}
      `
    )
  );
  revalidateResearch();
}
