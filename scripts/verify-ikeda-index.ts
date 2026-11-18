import { IKEDA_SOURCE_URL_PATTERNS } from "../lib/ikeda-sources";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { neonConfig } from "@neondatabase/serverless";
import { ikedaSql } from "../lib/ikeda-schema";
import { IKEDA } from "../lib/ikeda-config";
import { thoughtSchema } from "../lib/ikeda-types";
import { chunkText, tokenCount } from "../lib/ikeda-tokens";
import { embedTexts, AiProviderError } from "../lib/ikeda-provider";
import { normalizeThoughtVoices } from "../lib/ikeda-citations";
const compact = (s: string) => s.normalize("NFKC").replace(/\s+/g, "");
const whitespaceKey = (s: string) => s.replace(/\s+/g, "");
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
// Maintenance writes are idempotent. Retry transient connection failures per call.
neonConfig.fetchFunction = async (
  input: RequestInfo | URL,
  init?: RequestInit,
) => {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(input, {
        ...init,
        signal: AbortSignal.timeout(30_000),
      });
      if (response.status < 500 || attempt >= 4) {
        const bytes = await response.arrayBuffer();
        const headers = new Headers(response.headers);
        headers.delete("content-encoding");
        headers.delete("content-length");
        return new Response(bytes, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      }
      await response.body?.cancel();
    } catch (error) {
      if (attempt >= 4) throw error;
    }
    await wait(1000 * (attempt + 1));
  }
};
async function main() {
  const sql = ikedaSql();
  const repair = process.argv.includes("--repair");
  const rows =
    await sql`SELECT p.slug,p.title,p.author_name,p.source_hash AS current_hash,d.source_hash,d.index_version,d.embedding_model
   FROM blog_posts p LEFT JOIN ikeda_documents d ON d.post_slug=p.slug WHERE p.published=TRUE AND p.source_url LIKE ANY(${IKEDA_SOURCE_URL_PATTERNS}::text[]) ORDER BY p.slug`;
  const problems: string[] = [],
    repaired: string[] = [];
  let chunks = 0,
    claims = 0,
    lastEmbedding = 0;
  const authorship: Record<string, number> = {};
  const thoughtFixes: { slug: string; thought: unknown }[] = [];
  const fixes: {
    row: (typeof rows)[number];
    texts: string[];
    previous: number;
  }[] = [];
  const signature = JSON.stringify(
    rows.map((r) => [
      r.slug,
      r.current_hash,
      r.source_hash,
      r.index_version,
      r.embedding_model,
    ]),
  );
  let resumed = false;
  if (repair && process.argv.includes("--resume")) {
    try {
      const plan = JSON.parse(
        await readFile(".cache/ikeda/verification-plan.json", "utf8"),
      );
      if (plan.signature === signature) {
        const remaining =
          await sql`SELECT DISTINCT d.post_slug FROM ikeda_documents d JOIN blog_posts p ON p.slug=d.post_slug LEFT JOIN ikeda_chunks c ON c.post_slug=d.post_slug WHERE c.id IS NULL OR position(c.body_text in coalesce(nullif(d.body_text,''),p.title))=0 OR c.token_count>${IKEDA.chunkTokens} OR vector_dims(c.embedding)<>${IKEDA.embeddingDimensions}`;
        const slugs = new Set(remaining.map((r) => r.post_slug));
        fixes.push(
          ...plan.fixes.filter((f: (typeof fixes)[number]) =>
            slugs.has(f.row.slug),
          ),
        );
        problems.push(...plan.problems);
        thoughtFixes.push(...plan.thoughtFixes);
        Object.assign(authorship, plan.authorship);
        claims = plan.claims;
        chunks = plan.chunks;
        resumed = true;
        console.log(
          `Resumed verified plan; ${fixes.length} articles need repair`,
        );
      }
    } catch {
      /* Rebuild the plan when it is absent or out of date. */
    }
  }
  if (!resumed) {
    for (let start = 0; start < rows.length; start += 100) {
      const group = rows.slice(start, start + 100);
      const documents =
        await sql`SELECT post_slug,body_text,thought FROM ikeda_documents WHERE post_slug=ANY(${group.map((r) => r.slug)})`;
      const bySlug = new Map(documents.map((d) => [d.post_slug, d]));
      for (const row of group) Object.assign(row, bySlug.get(row.slug));
      const passages =
        await sql`SELECT post_slug,body_text,token_count,vector_dims(embedding) AS dimensions FROM ikeda_chunks WHERE post_slug=ANY(${group.map((r) => r.slug)})`;
      for (const row of group) {
        if (
          !row.source_hash ||
          row.current_hash !== row.source_hash ||
          row.index_version !== IKEDA.version ||
          row.embedding_model !== IKEDA.embeddingModel
        ) {
          problems.push(`${row.slug}: stale or missing index`);
          continue;
        }
        const parsedThought = thoughtSchema.parse(row.thought);
        const thought = normalizeThoughtVoices(parsedThought, row.body_text, {
          slug: row.slug,
          authorName: row.author_name,
        });
        if (JSON.stringify(thought) !== JSON.stringify(parsedThought)) {
          if (repair) {
            row.thought = thought;
            thoughtFixes.push({ slug: row.slug, thought });
          } else
            problems.push(`${row.slug}: quoted interview voice needs review`);
        }
        authorship[thought.authorship] =
          (authorship[thought.authorship] || 0) + 1;
        if (
          thought.authorshipEvidence &&
          !compact(row.body_text).includes(compact(thought.authorshipEvidence))
        )
          problems.push(`${row.slug}: unsupported authorship evidence`);
        for (const c of thought.claims) {
          claims++;
          if (!compact(row.body_text).includes(compact(c.quote)))
            problems.push(`${row.slug}: unsupported quote`);
        }
        const own = passages.filter((c) => c.post_slug === row.slug);
        chunks += own.length;
        const bad =
          !own.length ||
          own.some(
            (c) =>
              c.dimensions !== IKEDA.embeddingDimensions ||
              c.token_count > IKEDA.chunkTokens ||
              !(row.body_text || row.title).includes(c.body_text),
          );
        if (bad && repair) {
          const texts = chunkText(row.body_text || row.title);
          if (
            texts.some(
              (t) =>
                !(row.body_text || row.title).includes(t) ||
                tokenCount(t) > IKEDA.chunkTokens,
            )
          )
            throw Error(`Invalid repair: ${row.slug}`);
          fixes.push({ row, texts, previous: own.length });
        } else if (bad)
          problems.push(`${row.slug}: missing, corrupted or oversized passage`);
      }
      console.log(
        `Checked ${Math.min(rows.length, start + 100)}/${rows.length}; repairs needed ${fixes.length}`,
      );
    }
    await mkdir(".cache/ikeda", { recursive: true });
    if (repair)
      await writeFile(
        ".cache/ikeda/verification-plan.json",
        JSON.stringify({
          signature,
          fixes,
          problems,
          thoughtFixes,
          authorship,
          claims,
          chunks,
        }),
      );
  }
  await mkdir(".cache/ikeda", { recursive: true });
  let reusedEmbeddings = 0,
    newEmbeddings = 0;
  for (let start = 0; start < fixes.length; start += 100) {
    const group = fixes
      .slice(start, start + 100)
      .map((fix) => ({ ...fix, embeddings: [] as number[][] }));
    const old =
      await sql`SELECT post_slug,body_text,embedding::text AS vector FROM ikeda_chunks WHERE post_slug=ANY(${group.map((f) => f.row.slug)})`;
    const reusable = new Map<string, number[]>(
      old.map((c) => [
        `${c.post_slug}:${whitespaceKey(c.body_text)}`,
        JSON.parse(c.vector),
      ]),
    );
    const pending: {
      fix: (typeof group)[number];
      index: number;
      input: string;
    }[] = [];
    for (const fix of group)
      fix.texts.forEach((text, i) => {
        const prior = reusable.get(`${fix.row.slug}:${whitespaceKey(text)}`);
        // Reuse vectors only when the words match exactly and whitespace differs.
        if (prior?.length === IKEDA.embeddingDimensions) {
          fix.embeddings[i] = prior;
          reusedEmbeddings++;
        } else
          pending.push({ fix, index: i, input: `${fix.row.title}\n${text}` });
      });
    for (let i = 0; i < pending.length; i += IKEDA.embeddingBatch) {
      const batch = pending.slice(i, i + IKEDA.embeddingBatch);
      for (let attempt = 0; ; attempt++) {
        await wait(
          Math.max(
            0,
            IKEDA.indexEmbeddingIntervalMs - (Date.now() - lastEmbedding),
          ),
        );
        lastEmbedding = Date.now();
        try {
          const vectors = await embedTexts(batch.map((p) => p.input));
          batch.forEach((p, n) => {
            p.fix.embeddings[p.index] = vectors[n];
          });
          newEmbeddings += vectors.length;
          break;
        } catch (e) {
          if (
            attempt >= 4 ||
            (e instanceof AiProviderError && [401, 402, 403].includes(e.status))
          )
            throw e;
          await wait(
            e instanceof AiProviderError && e.retryAfterMs
              ? e.retryAfterMs
              : 2000 * (attempt + 1),
          );
        }
      }
    }
    for (let offset = 0; offset < group.length; offset += 5) {
      const batch = group.slice(offset, offset + 5);
      const payload = batch.flatMap(({ row, texts, embeddings }) =>
        texts.map((text, i) => ({
          id: `${row.slug}:${i}`,
          post_slug: row.slug,
          ordinal: i,
          body_text: text,
          token_count: tokenCount(text),
          embedding: JSON.stringify(embeddings[i]),
        })),
      );
      await sql.transaction([
        sql`DELETE FROM ikeda_chunks WHERE post_slug=ANY(${batch.map((f) => f.row.slug)})`,
        sql`INSERT INTO ikeda_chunks(id,post_slug,ordinal,body_text,token_count,embedding) SELECT x.id,x.post_slug,x.ordinal,x.body_text,x.token_count,x.embedding::vector FROM jsonb_to_recordset(${JSON.stringify(payload)}::jsonb) AS x(id text,post_slug text,ordinal int,body_text text,token_count int,embedding text)`,
      ]);
    }
    for (const { row, texts, embeddings, previous } of group) {
      chunks += texts.length - previous;
      repaired.push(row.slug);
      await writeFile(
        `.cache/ikeda/${row.slug}.json`,
        JSON.stringify({
          version: IKEDA.version,
          model: IKEDA.embeddingModel,
          hash: row.source_hash,
          thought: row.thought,
          chunks: texts.map((text, i) => ({
            text,
            tokens: tokenCount(text),
            embedding: embeddings[i],
          })),
        }),
      );
    }
    console.log(
      `Repaired ${repaired.length}/${fixes.length}; reused ${reusedEmbeddings}; embedded ${newEmbeddings}`,
    );
  }
  const report = {
    verifiedAt: new Date().toISOString(),
    articles: rows.length,
    chunks: Number(
      (await sql`SELECT count(*)::int AS count FROM ikeda_chunks`)[0].count,
    ),
    claims,
    authorship,
    sourceHashesVerified:
      rows.length - problems.filter((x) => x.includes("stale")).length,
    embeddingModel: IKEDA.embeddingModel,
    dimensions: IKEDA.embeddingDimensions,
    thoughtSpeakersCorrected: thoughtFixes.length,
    reusedEmbeddings,
    newEmbeddings,
    repaired,
    problems,
  };
  for (let offset = 0; offset < thoughtFixes.length; offset += 10) {
    const batch = thoughtFixes.slice(offset, offset + 10);
    await sql`UPDATE ikeda_documents d SET thought=x.thought FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb) AS x(slug text,thought jsonb) WHERE d.post_slug=x.slug`;
  }
  await mkdir(".cache/ikeda", { recursive: true });
  await writeFile(
    ".cache/ikeda/verification.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify({ ...report, repaired: repaired.length }, null, 2),
  );
  if (problems.length) process.exitCode = 1;
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
