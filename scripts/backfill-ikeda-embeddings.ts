import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { IKEDA } from "../lib/ikeda-config";
import { ikedaSql, ensureIkedaEmbeddingTable } from "../lib/ikeda-schema";
import { embeddingReadiness } from "../lib/ikeda-embeddings";
import { embedTexts, AiProviderError } from "../lib/ikeda-provider";
const cache = ".cache/ikeda-openai";
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function main() {
  const write = process.argv.includes("--write");
  const sql = ikedaSql();
  const exists =
    await sql`SELECT to_regclass('ikeda_chunk_embeddings') IS NOT NULL AS exists`;
  if (!write) {
    console.log(
      JSON.stringify({
        write: false,
        readiness: exists[0].exists
          ? await embeddingReadiness()
          : { tableCreated: false },
      }),
    );
    return;
  }
  if (!process.env.OPENAI_API_KEY?.trim())
    throw Error("OpenAI organization API connection required");
  await ensureIkedaEmbeddingTable();
  await mkdir(cache, { recursive: true });
  const rows =
    await sql`SELECT c.id,c.body_text,p.title,d.source_hash FROM ikeda_chunks c JOIN ikeda_documents d ON d.post_slug=c.post_slug JOIN blog_posts p ON p.slug=c.post_slug LEFT JOIN ikeda_chunk_embeddings e ON e.chunk_id=c.id AND e.embedding_model=${IKEDA.embeddingModel} AND e.source_hash=d.source_hash WHERE p.published=TRUE AND d.source_hash=p.source_hash AND d.index_version=${IKEDA.version} AND e.chunk_id IS NULL ORDER BY c.id`;
  const limit =
    Number(process.argv.find((x) => x.startsWith("--limit="))?.slice(8)) ||
    rows.length;
  if (!Number.isSafeInteger(limit) || limit < 0) throw Error("Invalid limit");
  let processed = 0,
    reused = 0;
  for (
    let start = 0;
    start < Math.min(limit, rows.length);
    start += IKEDA.embeddingBatch
  ) {
    const batch = rows.slice(
      start,
      Math.min(start + IKEDA.embeddingBatch, limit),
    );
    const records = batch.map((r) => ({
      id: r.id,
      body_text: r.body_text,
      title: r.title,
      source_hash: r.source_hash,
      input: `${r.title}\n${r.body_text}`,
      key: createHash("sha256")
        .update(
          JSON.stringify([
            IKEDA.embeddingModel,
            IKEDA.embeddingDimensions,
            r.title,
            r.body_text,
          ]),
        )
        .digest("hex"),
      embedding: [] as number[],
    }));
    const needed: typeof records = [];
    for (const r of records) {
      try {
        const saved = JSON.parse(
          await readFile(`${cache}/${r.key}.json`, "utf8"),
        );
        if (
          Array.isArray(saved) &&
          saved.length === IKEDA.embeddingDimensions &&
          saved.every(Number.isFinite)
        ) {
          r.embedding = saved;
          reused++;
          continue;
        }
      } catch {}
      needed.push(r);
    }
    if (needed.length) {
      for (let attempt = 0; ; attempt++) {
        try {
          const vectors = await embedTexts(needed.map((r) => r.input));
          needed.forEach((r, i) => {
            r.embedding = vectors[i];
          });
          break;
        } catch (e) {
          if (
            attempt >= 5 ||
            (e instanceof AiProviderError &&
              [400, 401, 402, 403].includes(e.status))
          )
            throw e;
          await pause(
            e instanceof AiProviderError && e.retryAfterMs
              ? e.retryAfterMs
              : Math.min(20000, 2000 * (attempt + 1)),
          );
        }
      }
      for (const r of needed)
        await writeFile(`${cache}/${r.key}.json`, JSON.stringify(r.embedding));
    }
    const payload = records.map((r) => ({
      ...r,
      embedding: JSON.stringify(r.embedding),
    }));
    const saved =
      await sql`INSERT INTO ikeda_chunk_embeddings(chunk_id,embedding_model,source_hash,embedding)
    SELECT x.id,${IKEDA.embeddingModel},x.source_hash,x.embedding::vector FROM jsonb_to_recordset(${JSON.stringify(payload)}::jsonb) AS x(id text,body_text text,title text,source_hash text,embedding text)
    JOIN ikeda_chunks c ON c.id=x.id AND c.body_text=x.body_text JOIN ikeda_documents d ON d.post_slug=c.post_slug AND d.source_hash=x.source_hash JOIN blog_posts p ON p.slug=d.post_slug AND p.published=TRUE AND p.source_hash=d.source_hash AND p.title=x.title
    WHERE d.index_version=${IKEDA.version} ON CONFLICT(chunk_id,embedding_model) DO UPDATE SET source_hash=EXCLUDED.source_hash,embedding=EXCLUDED.embedding RETURNING chunk_id`;
    if (saved.length !== records.length)
      throw Error("Source changed during embedding backfill; rerun to resume");
    processed += records.length;
    console.log(
      JSON.stringify({
        processed,
        requested: Math.min(limit, rows.length),
        reused,
      }),
    );
    if (needed.length) await pause(IKEDA.indexEmbeddingIntervalMs);
  }
  const report = {
    at: new Date().toISOString(),
    model: IKEDA.embeddingModel,
    dimensions: IKEDA.embeddingDimensions,
    processed,
    reused,
    readiness: await embeddingReadiness(),
  };
  await writeFile(`${cache}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
  if (
    !process.argv.some((x) => x.startsWith("--limit=")) &&
    (!report.readiness.total || report.readiness.missing)
  )
    throw Error("OpenAI index is not ready");
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
