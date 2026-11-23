import { IKEDA } from "@/lib/ikeda-config";

export class AiProviderError extends Error {
  constructor(
    readonly status: number,
    readonly retryAfterMs = 0,
  ) {
    super(`AI provider HTTP ${status}`);
    this.name = "AiProviderError";
  }
}

/** The key must belong to the organization receiving the ChatGPT subscription
 * API grant. Never fall back to Vercel or another account. */
export async function aiFetch(
  path: "responses" | "embeddings",
  body: Record<string, unknown>,
  signal?: AbortSignal,
) {
  const token = process.env.OPENAI_API_KEY?.trim();
  if (!token) throw new AiProviderError(503);
  const organization = process.env.OPENAI_ORG_ID?.trim();
  const project = process.env.OPENAI_PROJECT_ID?.trim();
  const response = await fetch(`https://api.openai.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(organization ? { "OpenAI-Organization": organization } : {}),
      ...(project ? { "OpenAI-Project": project } : {}),
    },
    body: JSON.stringify(body),
    signal: signal ?? AbortSignal.timeout(90_000),
  });
  if (!response.ok) {
    // Provider bodies can contain input. Never log or return them to visitors.
    const seconds = Number(response.headers.get("retry-after") || 0) * 1000;
    const milliseconds = Number(response.headers.get("retry-after-ms") || 0);
    throw new AiProviderError(
      response.status,
      Math.min(
        60_000,
        Math.max(
          0,
          Number.isFinite(seconds) ? seconds : 0,
          Number.isFinite(milliseconds) ? milliseconds : 0,
        ),
      ),
    );
  }
  return response;
}
export async function embedTexts(
  texts: string[],
  signal?: AbortSignal,
): Promise<number[][]> {
  const response = await aiFetch(
    "embeddings",
    {
      model: IKEDA.embeddingModel,
      input: texts,
      dimensions: IKEDA.embeddingDimensions,
      encoding_format: "float",
    },
    signal,
  );
  const result = await response.json();
  const rows = result.data?.sort(
    (a: { index: number }, b: { index: number }) => a.index - b.index,
  );
  if (
    rows?.length !== texts.length ||
    rows.some(
      (r: { index: number; embedding: number[] }, i: number) =>
        r.index !== i ||
        r.embedding?.length !== IKEDA.embeddingDimensions ||
        r.embedding.some((x: number) => !Number.isFinite(x)),
    )
  )
    throw new Error("Invalid embedding response");
  return rows.map((r: { embedding: number[] }) => r.embedding);
}
