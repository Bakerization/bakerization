import { getVercelOidcToken } from "@vercel/oidc";
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

export async function gatewayToken() {
  if (process.env.AI_GATEWAY_API_KEY?.trim())
    return process.env.AI_GATEWAY_API_KEY.trim();
  return getVercelOidcToken();
}
export async function aiFetch(
  path: "responses" | "embeddings",
  body: Record<string, unknown>,
  signal?: AbortSignal,
) {
  const token = await gatewayToken();
  const response = await fetch(`https://ai-gateway.vercel.sh/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: signal ?? AbortSignal.timeout(90_000),
  });
  if (!response.ok) {
    // Provider bodies can contain input. Never log or return them to visitors.
    throw new AiProviderError(
      response.status,
      Math.min(60_000, Number(response.headers.get("retry-after") || 0) * 1000),
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
      (r: { embedding: number[] }) =>
        r.embedding?.length !== IKEDA.embeddingDimensions ||
        r.embedding.some((x: number) => !Number.isFinite(x)),
    )
  )
    throw new Error("Invalid embedding response");
  return rows.map((r: { embedding: number[] }) => r.embedding);
}
