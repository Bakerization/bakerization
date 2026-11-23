import { test, expect, vi, afterEach } from "vitest";
import { aiFetch, embedTexts, AiProviderError } from "../lib/ikeda-provider";
import { IKEDA } from "../lib/ikeda-config";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
test("direct API requests use the linked OpenAI organization and never the Gateway", async () => {
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  vi.stubEnv("OPENAI_ORG_ID", "org-linked");
  vi.stubEnv("OPENAI_PROJECT_ID", "proj-blog");
  const fetcher = vi.fn(async () => Response.json({ status: "completed" }));
  vi.stubGlobal("fetch", fetcher);
  await aiFetch("responses", { model: IKEDA.answerModel, input: "パン" });
  expect(fetcher).toHaveBeenCalledTimes(1);
  const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
  expect(url).toBe("https://api.openai.com/v1/responses");
  const headers = new Headers(init.headers);
  expect(headers.get("Authorization")).toBe("Bearer test-key");
  expect(headers.get("OpenAI-Organization")).toBe("org-linked");
  expect(headers.get("OpenAI-Project")).toBe("proj-blog");
  expect(JSON.parse(init.body as string).model).toBe("gpt-5.4-mini");
});
test("a missing OpenAI connection makes no external request even when Gateway credentials exist", async () => {
  vi.stubEnv("OPENAI_API_KEY", "");
  vi.stubEnv("AI_GATEWAY_API_KEY", "unrelated-key");
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  await expect(aiFetch("responses", {})).rejects.toMatchObject({ status: 503 });
  expect(fetcher).not.toHaveBeenCalled();
});
test("rate-limit retries respect millisecond headers and never expose provider error text", async () => {
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json(
        { error: { message: "private question text" } },
        { status: 429, headers: { "retry-after-ms": "4200" } },
      ),
    ),
  );
  try {
    await aiFetch("responses", {});
    throw Error("expected provider error");
  } catch (e) {
    expect(e).toBeInstanceOf(AiProviderError);
    expect(e).toMatchObject({ status: 429, retryAfterMs: 4200 });
    expect(String(e)).not.toContain("private question");
  }
});
test("OpenAI embeddings keep the requested dimensions and reorder response indices", async () => {
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  const vector = (v: number) => Array(IKEDA.embeddingDimensions).fill(v);
  const fetcher = vi.fn(async () =>
    Response.json({
      data: [
        { index: 1, embedding: vector(2) },
        { index: 0, embedding: vector(1) },
      ],
    }),
  );
  vi.stubGlobal("fetch", fetcher);
  const result = await embedTexts(["小麦", "빵"]);
  expect(result[0][0]).toBe(1);
  expect(result[1][0]).toBe(2);
  const init = (fetcher.mock.calls[0] as unknown as [string, RequestInit])[1];
  expect(JSON.parse(init.body as string)).toMatchObject({
    model: "text-embedding-3-small",
    dimensions: 768,
    input: ["小麦", "빵"],
  });
});
test("duplicate embedding indices cannot silently attach a vector to the wrong passage", async () => {
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({
        data: [
          { index: 0, embedding: Array(768).fill(1) },
          { index: 0, embedding: Array(768).fill(2) },
        ],
      }),
    ),
  );
  await expect(embedTexts(["小麦", "パン"])).rejects.toThrow(
    "Invalid embedding response",
  );
});
