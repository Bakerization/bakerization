import { neon } from "@neondatabase/serverless";
import { randomBytes } from "node:crypto";

// ─────────────────────────────────────────────────────────────
// Research schema: tables, indexes and the default "inbox" project.
// Only write paths (createProject / createArtifact) and the
// `npm run ensure:tables` script call this; read paths assume the tables
// exist so that a cold start costs zero DDL round trips.
// ─────────────────────────────────────────────────────────────

export const DEFAULT_PROJECT_SLUG = "inbox";

export function newId() {
  // 14 URL-safe chars, plenty of entropy for an internal tool.
  return randomBytes(10).toString("base64url");
}

let ensurePromise: Promise<void> | null = null;

export async function ensureResearchTables() {
  if (!ensurePromise) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not configured.");
    const sql = neon(url);
    ensurePromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS research_projects (
          id TEXT PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          owner_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
          is_default BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS research_projects_one_default
        ON research_projects (is_default) WHERE is_default
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS research_artifacts (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL REFERENCES research_projects(id) ON DELETE RESTRICT,
          owner_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          html TEXT NOT NULL,
          size_bytes INTEGER NOT NULL,
          sha256 TEXT NOT NULL,
          position INTEGER NOT NULL DEFAULT 0,
          source TEXT NOT NULL DEFAULT 'web',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS research_artifacts_project_pos
        ON research_artifacts (project_id, position)
      `;
      await sql`
        ALTER TABLE research_artifacts
        ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'members'
      `;
      // Partial indexes matching the public-list predicates exactly.
      await sql`
        CREATE INDEX IF NOT EXISTS research_artifacts_public_updated
        ON research_artifacts (updated_at DESC) WHERE visibility = 'public'
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS research_artifacts_public_project_pos
        ON research_artifacts (project_id, position, created_at) WHERE visibility = 'public'
      `;
      await sql`
        INSERT INTO research_projects (id, slug, name, description, is_default)
        VALUES (${newId()}, ${DEFAULT_PROJECT_SLUG}, 'Inbox', 'プロジェクト未指定のアーティファクトが入ります。', TRUE)
        ON CONFLICT (slug) DO NOTHING
      `;
    })().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }
  await ensurePromise;
}
