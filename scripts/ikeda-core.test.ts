import {
  createQuoteFilter,
  normalizeThoughtVoices,
} from "../lib/ikeda-citations";
import { test, expect } from "vitest";
import { IKEDA } from "../lib/ikeda-config";
import { chunkText, tokenCount, trimTokens } from "../lib/ikeda-tokens";
import {
  selectContext,
  buildAnswerInput,
  searchTerms,
  type Candidate,
} from "../lib/ikeda-retrieval";
import { readSse } from "../lib/ikeda-stream";
import { archiveFilters, archiveHref } from "../lib/blog-archive";
const thought = {
  authorship: "collective_unknown" as const,
  authorshipEvidence: "",
  summary: "小麦と人のつながり",
  themes: ["wheat"],
  question: "小麦が地域にもたらすものは？",
  concepts: ["小麦", "地域"],
  claims: [],
};
const candidate = (
  id: number,
  date: string,
  text = "小麦を育てる人と、パンを焼く人がつながる。",
): Candidate => ({
  id: `panlabo-${id}:0`,
  post_slug: `panlabo-${id}`,
  ordinal: 0,
  body_text: text,
  title: `小麦の記録${id}`,
  published_at: date,
  themes: ["wheat"],
  thought,
  score: 0.85,
});
test("Japanese chunks stay within budget and never split a Unicode character", () => {
  const text = "小麦とパン🥐𠮷野の香り。".repeat(300);
  const chunks = chunkText(text);
  expect(chunks.length).toBeGreaterThan(1);
  for (const c of chunks) {
    expect(tokenCount(c)).toBeLessThanOrEqual(IKEDA.chunkTokens);
    expect(c).not.toContain("�");
    expect(text).toContain(c);
  }
  expect(trimTokens(text, 40)).not.toContain("�");
});
test("chunks preserve original single and blank paragraph newlines", () => {
  const text =
    "  一行目のパン。\n二行目の小麦。\n\n  三行目の香り。\n\n".repeat(100);
  const chunks = chunkText(text);
  expect(chunks.length).toBeGreaterThan(1);
  for (const c of chunks) {
    expect(text).toContain(c);
    expect(tokenCount(c)).toBeLessThanOrEqual(IKEDA.chunkTokens);
  }
});
test("temporal questions retain early and late evidence and Japanese dates", () => {
  const candidates = [
    {
      ...candidate(3, "2024-05-25T22:48:00.000Z"),
      published_at: new Date("2024-05-25T22:48:00.000Z"),
    },
    candidate(2, "2015-01-01T03:00:00.000Z"),
    candidate(1, "2009-07-09T03:00:00.000Z"),
  ];
  const result = selectContext(
    candidates,
    "2009年から2024年で考えはどう変化した？",
  );
  expect(result.sources.map((s) => s.slug)).toContain("panlabo-1");
  expect(result.sources.map((s) => s.slug)).toContain("panlabo-3");
  expect(result.context).toContain("2024/05/26");
});
test("retrieval bounds sources and context, deduplicates a passage and rejects unrelated scores", () => {
  const items = Array.from({ length: 25 }, (_, i) =>
    candidate(i + 1, "2020-01-01T03:00:00Z", "パンと小麦。".repeat(70)),
  );
  const result = selectContext([...items, items[0]], "小麦");
  expect(result.sources.length).toBeLessThanOrEqual(IKEDA.sources);
  expect(result.contextTokens).toBeLessThanOrEqual(IKEDA.contextTokens);
  expect(new Set(result.sources.map((s) => s.slug)).size).toBe(
    result.sources.length,
  );
  expect(
    selectContext([{ ...items[0], score: 0.1 }], "宇宙船").sources,
  ).toEqual([]);
});
test("a large follow-up history cannot exceed the prompt budget", () => {
  const context = selectContext(
    Array.from({ length: 20 }, (_, i) =>
      candidate(i + 1, "2020-01-01T00:00:00Z", "パンは文化です。".repeat(40)),
    ),
    "小麦",
  );
  const history = Array.from({ length: 8 }, (_, i) => ({
    role: i % 2 ? ("assistant" as const) : ("user" as const),
    content: "過去の文章。".repeat(1000),
  }));
  const prompt = buildAnswerInput(
    "小麦の未来は？".repeat(180),
    history,
    context.context,
  );
  expect(prompt.estimatedInputTokens).toBeLessThanOrEqual(IKEDA.promptTokens);
  expect(JSON.parse(prompt.input).documents.length).toBeGreaterThan(0);
});
test("SSE decoding survives one-byte UTF-8 fragments and CRLF boundaries", async () => {
  const encoder = new TextEncoder();
  const data = encoder.encode(
    'data: {"type":"delta","text":"パン🥐の考え"}\r\n\r\ndata: {"type":"done"}\n\n',
  );
  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      for (const byte of data) c.enqueue(new Uint8Array([byte]));
      c.close();
    },
  });
  const events = [];
  for await (const e of readSse(stream)) events.push(e);
  expect(events).toEqual([
    { type: "delta", text: "パン🥐の考え" },
    { type: "done" },
  ]);
});
test("archive filters retain the selected year, order and page without accepting invalid inputs", () => {
  const f = archiveFilters({
    year: "2014",
    order: "asc",
    theme: "wheat",
    q: "小麦",
    page: "3",
  });
  expect(f).toMatchObject({
    year: 2014,
    order: "asc",
    theme: "wheat",
    page: 3,
  });
  expect(archiveHref(f, { page: 2 })).toBe(
    "/blog?year=2014&theme=wheat&q=%E5%B0%8F%E9%BA%A6&order=asc&page=2",
  );
  expect(
    archiveFilters({ year: "xyz", theme: "wrong", page: "-1" }),
  ).toMatchObject({ year: undefined, theme: undefined, page: 1 });
  expect(searchTerms("国産小麦を選ぶのはなぜ？")).toContain("小麦");
});

test("streaming quotes must match a source across delta boundaries and stay within two", () => {
  const filter = createQuoteFilter(["原文の言葉。別の言葉。三つ目。"]);
  const input = "説明「原文の言葉」。「言い換え」。「別の言葉」。「三つ目」。";
  const result =
    Array.from(input)
      .map((c) => filter.push(c))
      .join("") + filter.finish();
  expect(result).toBe("説明「原文の言葉」。言い換え。「別の言葉」。三つ目。");
  expect(createQuoteFilter([]).push("本文")).toBe("本文");
});

test("quoted interview passages never become confirmed narrator statements", () => {
  const quote = "生産者と利用者の声がつながり小麦を守ることができたからです。";
  const input = {
    ...thought,
    authorship: "ikeda_explicit" as const,
    claims: [
      { statement: "要点", basis: "理由", quote, voice: "narrator" as const },
    ],
  };
  const result = normalizeThoughtVoices(
    input,
    `－－なぜ残ったのですか。\n「${quote}」`,
  );
  expect(result.claims[0].voice).toBe("unclear");
  expect(normalizeThoughtVoices(input, quote).claims[0].voice).toBe("narrator");
});

test("article questions identify the anchor separately from related evidence", () => {
  const context = selectContext(
    [
      candidate(1, "2026-01-01T00:00:00Z"),
      candidate(2, "2025-01-01T00:00:00Z"),
    ],
    "この記事の考えは？",
  );
  const prompt = buildAnswerInput(
    "이 글의 핵심 생각을 설명해 주세요.",
    [],
    context.context,
    "panlabo-1",
  );
  const data = JSON.parse(prompt.input);
  expect(data.anchorArticle).toBe("panlabo-1");
  expect(data.documents[0].slug).toBe("panlabo-1");
  expect(prompt.estimatedInputTokens).toBeLessThanOrEqual(IKEDA.promptTokens);
});
