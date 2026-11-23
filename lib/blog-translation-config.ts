/** Translation settings shared by the on-demand API and archive backfill. */
export const BLOG_TRANSLATION = {
  model: "gpt-5.4-mini",
  batchCharacters: 6000,
  koreanBatchCharacters: 3000,
  segmentCharacters: 3000,
  concurrency: 2,
  minimumIntervalMs: 3100,
  outputTokens: 14000,
  koreanOutputTokens: 18000,
  requestTimeoutMs: 60_000,
  articleTimeoutMs: 240_000,
  leaseSeconds: 270,
  requestBytes: 2048,
} as const;
