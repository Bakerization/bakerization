import { neon } from "@neondatabase/serverless";
import { MAX_HTML_BYTES } from "@/lib/research-html";
import { ensureResearchTables, newId } from "@/lib/research-schema";

// ─────────────────────────────────────────────────────────────
// Chunked HTML uploads for the MCP connector. A model can only put so much
// text into one tool call, so a large page arrives as numbered pieces
// (upload_html_chunk) and publish_artifact / update_artifact join them.
// Re-sending an index replaces that piece, so retries are safe. Unpublished
// uploads are dropped after a day, lazily, whenever a new upload starts.
// ─────────────────────────────────────────────────────────────

/** Per piece. The skill asks for ~30 KB; this only keeps a call under Vercel's 4.5 MB body cap. */
export const MAX_CHUNK_CHARS = 1_000_000;
export const MAX_CHUNK_INDEX = 999;

export type UploadProgress = {
  uploadId: string;
  pieces: number;
  totalBytes: number;
  /** Indexes below the highest one received that are still missing. */
  missing: number[];
};

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  return neon(url);
}

function notFound(uploadId: string) {
  return `Upload "${uploadId}" not found (it may have expired). Start again from index 0 without upload_id.`;
}

export async function putUploadChunk(input: {
  uploadId?: string;
  ownerId: string;
  index: number;
  data: string;
}): Promise<{ ok: true; progress: UploadProgress } | { ok: false; error: string }> {
  const sql = getSql();
  let uploadId = input.uploadId;
  if (!uploadId) {
    if (input.index !== 0) {
      return { ok: false, error: "Send index 0 first, without upload_id; it returns the upload_id for the later pieces." };
    }
    await ensureResearchTables();
    await sql`DELETE FROM research_upload_chunks WHERE created_at < NOW() - INTERVAL '1 day'`;
    uploadId = newId();
  } else {
    const rows = await sql`SELECT owner_id FROM research_upload_chunks WHERE upload_id = ${uploadId} LIMIT 1`;
    if (rows.length === 0 || rows[0].owner_id !== input.ownerId) return { ok: false, error: notFound(uploadId) };
  }

  const bytes = Buffer.byteLength(input.data, "utf8");
  const [{ others }] = await sql`
    SELECT COALESCE(SUM(octet_length(data)), 0)::int AS others
    FROM research_upload_chunks WHERE upload_id = ${uploadId} AND idx <> ${input.index}
  `;
  if (Number(others) + bytes > MAX_HTML_BYTES) {
    return { ok: false, error: `The document would exceed the ${MAX_HTML_BYTES}-byte limit.` };
  }

  await sql`
    INSERT INTO research_upload_chunks (upload_id, owner_id, idx, data)
    VALUES (${uploadId}, ${input.ownerId}, ${input.index}, ${input.data})
    ON CONFLICT (upload_id, idx) DO UPDATE SET data = EXCLUDED.data, created_at = NOW()
  `;

  const pieces = (await sql`
    SELECT idx, octet_length(data)::int AS bytes FROM research_upload_chunks
    WHERE upload_id = ${uploadId} ORDER BY idx
  `) as { idx: number; bytes: number }[];
  const have = new Set(pieces.map((p) => p.idx));
  const missing: number[] = [];
  for (let i = 0; i < pieces[pieces.length - 1].idx; i++) if (!have.has(i)) missing.push(i);
  return {
    ok: true,
    progress: {
      uploadId,
      pieces: pieces.length,
      totalBytes: pieces.reduce((sum, p) => sum + p.bytes, 0),
      missing,
    },
  };
}

/** The pieces joined in order; every index from 0 to the last must be there. */
export async function readUpload(
  uploadId: string,
  ownerId: string
): Promise<{ ok: true; html: string } | { ok: false; error: string }> {
  const sql = getSql();
  const rows = (await sql`
    SELECT idx, owner_id, data FROM research_upload_chunks
    WHERE upload_id = ${uploadId} ORDER BY idx
  `) as { idx: number; owner_id: string; data: string }[];
  if (rows.length === 0 || rows[0].owner_id !== ownerId) return { ok: false, error: notFound(uploadId) };
  const gap = rows.findIndex((row, i) => row.idx !== i);
  if (gap !== -1) {
    return { ok: false, error: `Upload "${uploadId}" is missing piece ${gap}. Send it with upload_html_chunk, then try again.` };
  }
  return { ok: true, html: rows.map((row) => row.data).join("") };
}

export async function deleteUpload(uploadId: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM research_upload_chunks WHERE upload_id = ${uploadId}`;
}
