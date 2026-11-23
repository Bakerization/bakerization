import { neon } from "@neondatabase/serverless";
import { IKEDA } from "@/lib/ikeda-config";

export function ikedaSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  // Do not capture an AbortSignal here: long-running index jobs reuse this client.
  return neon(process.env.DATABASE_URL);
}
export async function ensureIkedaTables() {
  const sql = ikedaSql();
  await sql`CREATE EXTENSION IF NOT EXISTS vector`;
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;
  await sql`CREATE TABLE IF NOT EXISTS ikeda_documents (
    post_slug TEXT PRIMARY KEY REFERENCES blog_posts(slug) ON DELETE CASCADE,
    source_hash TEXT NOT NULL, index_version INT NOT NULL,
    body_text TEXT NOT NULL, thought JSONB NOT NULL,
    themes TEXT[] NOT NULL, concepts TEXT[] NOT NULL,
    embedding_model TEXT NOT NULL, indexed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql.query(`CREATE TABLE IF NOT EXISTS ikeda_chunks (
    id TEXT PRIMARY KEY, post_slug TEXT NOT NULL REFERENCES ikeda_documents(post_slug) ON DELETE CASCADE,
    ordinal INT NOT NULL, body_text TEXT NOT NULL, token_count INT NOT NULL,
    embedding VECTOR(${IKEDA.embeddingDimensions}) NOT NULL,
    UNIQUE(post_slug, ordinal)
  )`);
  await ensureIkedaEmbeddingTable();
  await sql`CREATE INDEX IF NOT EXISTS ikeda_chunks_vector_idx ON ikeda_chunks USING hnsw (embedding vector_cosine_ops)`;
  await sql`CREATE INDEX IF NOT EXISTS ikeda_chunks_text_idx ON ikeda_chunks USING gin (body_text gin_trgm_ops)`;
  await sql`CREATE INDEX IF NOT EXISTS ikeda_documents_themes_idx ON ikeda_documents USING gin (themes)`;
  await sql`CREATE TABLE IF NOT EXISTS ikeda_daily_usage (
    day DATE PRIMARY KEY, request_count INT NOT NULL DEFAULT 0, visitors JSONB NOT NULL DEFAULT '{}',
    input_tokens BIGINT NOT NULL DEFAULT 0, output_tokens BIGINT NOT NULL DEFAULT 0
  )`;
}

export async function ensureIkedaEmbeddingTable() {
  const sql = ikedaSql();
  await sql.query(`CREATE TABLE IF NOT EXISTS ikeda_chunk_embeddings (
    chunk_id TEXT NOT NULL REFERENCES ikeda_chunks(id) ON DELETE CASCADE,
    embedding_model TEXT NOT NULL,source_hash TEXT NOT NULL,
    embedding VECTOR(${IKEDA.embeddingDimensions}) NOT NULL,
    PRIMARY KEY(chunk_id,embedding_model)
  )`);
  await sql`CREATE INDEX IF NOT EXISTS ikeda_chunk_embeddings_vector_idx ON ikeda_chunk_embeddings USING hnsw(embedding vector_cosine_ops)`;
}
