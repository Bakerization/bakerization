import { ikedaSql } from "./ikeda-schema";
import { IKEDA } from "./ikeda-config";

/** Keep legacy Gemini vectors intact. Equal dimensions never justify comparing
 * vectors from different models. Source hashes also prevent stale article edits. */
export { ensureIkedaEmbeddingTable } from "./ikeda-schema";

export async function embeddingReadiness() {
  const rows = await ikedaSql()`SELECT count(*)::int AS total,
    count(*) FILTER(WHERE e.chunk_id IS NULL OR e.source_hash<>d.source_hash OR vector_dims(e.embedding)<>${IKEDA.embeddingDimensions})::int AS missing
    FROM ikeda_chunks c JOIN ikeda_documents d ON d.post_slug=c.post_slug JOIN blog_posts p ON p.slug=c.post_slug
    LEFT JOIN ikeda_chunk_embeddings e ON e.chunk_id=c.id AND e.embedding_model=${IKEDA.embeddingModel}
    WHERE p.published=TRUE AND d.source_hash=p.source_hash AND d.index_version=${IKEDA.version}`;
  return rows[0] as { total: number; missing: number };
}
