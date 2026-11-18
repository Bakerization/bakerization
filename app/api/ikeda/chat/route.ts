import { isIP } from "node:net";
import { IKEDA } from "@/lib/ikeda-config";
import { chatRequestSchema, type ChatEvent } from "@/lib/ikeda-types";
import {
  retrieve,
  buildAnswerInput,
  IKEDA_INSTRUCTIONS,
} from "@/lib/ikeda-retrieval";
import { aiFetch, AiProviderError } from "@/lib/ikeda-provider";
import { reserveIkedaRequest, recordIkedaUsage } from "@/lib/ikeda-quota";
import { readSse } from "@/lib/ikeda-stream";
import { createQuoteFilter } from "@/lib/ikeda-citations";

export const maxDuration = 60;
const headers = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};
function error(message: string, status: number) {
  return Response.json({ error: message }, { status, headers });
}
async function readBody(request: Request) {
  if (!request.body) throw Error("No body");
  const reader = request.body.getReader();
  let text = "",
    size = 0;
  const decoder = new TextDecoder("utf-8", { fatal: true });
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > IKEDA.bodyBytes) {
        await reader.cancel();
        throw Error("Too large");
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}
export async function POST(request: Request) {
  if (
    request.headers.get("origin") !== new URL(request.url).origin ||
    ["cross-site", "same-site"].includes(
      request.headers.get("sec-fetch-site") || "",
    )
  )
    return error("このサイトの画面から質問してください。", 403);
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json")
    return error("質問を確認してください。", 415);
  if (Number(request.headers.get("content-length")) > IKEDA.bodyBytes)
    return error("質問を短くしてください。", 413);
  let parsed;
  try {
    parsed = chatRequestSchema.safeParse(await readBody(request));
  } catch {
    return error("質問を確認してください。", 400);
  }
  if (!parsed.success)
    return error(
      `質問は${IKEDA.questionCharacters}文字以内で入力してください。`,
      400,
    );
  const input = parsed.data;
  const manualAbort = new AbortController();
  const abort = AbortSignal.any([
    request.signal,
    manualAbort.signal,
    AbortSignal.timeout(53_000),
  ]);
  let context;
  try {
    const ip =
      request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() || "";
    const quota = await reserveIkedaRequest(isIP(ip) ? ip : "unknown");
    if (!quota.allowed)
      return error(
        quota.reason === "daily"
          ? "今日の利用上限に達しました。翌日以降にお試しください。"
          : "ただいま利用が集中しています。1分ほど待ってお試しください。",
        429,
      );
    context = await retrieve(input.question, input.history, input, abort);
  } catch (e) {
    console.error(
      "[ikeda] retrieval failed",
      e instanceof Error ? e.name : "Error",
    );
    if (e instanceof AiProviderError && e.status === 429)
      return error(
        "ただいま混み合っています。1分ほど待って、もう一度お試しください。",
        429,
      );
    return error("記事を検索できませんでした。もう一度お試しください。", 503);
  }
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (event: ChatEvent) => {
        if (!closed && !abort.aborted)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          );
      };
      try {
        emit({ type: "sources", sources: context.sources });
        if (!context.sources.length) {
          emit({
            type: "delta",
            text: "この範囲の記事からは、答えの根拠を見つけられませんでした。年代やテーマの絞り込みを外すか、パン・小麦・職人・食文化など、気になる言葉を加えてみてください。",
          });
          emit({
            type: "done",
            sources: [],
            usage: { inputTokens: 0, outputTokens: 0, contextTokens: 0 },
          });
          return;
        }
        const prompt = buildAnswerInput(
          input.question,
          input.history,
          context.context,
        );
        const response = await aiFetch(
          "responses",
          {
            model: IKEDA.answerModel,
            store: false,
            instructions: IKEDA_INSTRUCTIONS,
            input: prompt.input,
            reasoning: { effort: "none" },
            max_output_tokens: IKEDA.answerTokens,
            stream: true,
          },
          abort,
        );
        if (!response.body) throw Error("No stream");
        let answer = "",
          completed = false;
        const quotes = createQuoteFilter(
          JSON.parse(prompt.input).documents.map(
            (d: { text: string }) => d.text,
          ),
        );
        for await (const event of readSse(response.body)) {
          if (
            event.type === "response.output_text.delta" &&
            typeof event.delta === "string"
          ) {
            const text = quotes.push(event.delta);
            answer += text;
            if (text) emit({ type: "delta", text });
          }
          if (event.type === "response.completed") {
            const tail = quotes.finish();
            answer += tail;
            if (tail) emit({ type: "delta", text: tail });
            completed = true;
            const data = event.response as {
              usage?: { input_tokens?: number; output_tokens?: number };
            };
            const inputTokens = Number(data.usage?.input_tokens || 0),
              outputTokens = Number(data.usage?.output_tokens || 0);
            const used = new Set(
              [...answer.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])),
            );
            const sources = context.sources.filter((s) => used.has(s.number));
            await recordIkedaUsage(inputTokens, outputTokens).catch(() =>
              console.error("[ikeda] usage update failed"),
            );
            emit({
              type: "done",
              sources,
              usage: {
                inputTokens,
                outputTokens,
                contextTokens: prompt.contextTokens,
              },
            });
          }
          if (
            ["response.failed", "response.incomplete", "error"].includes(
              String(event.type),
            )
          )
            throw Error("Incomplete response");
        }
        if (!completed) throw Error("Stream interrupted");
      } catch (e) {
        if (!request.signal.aborted) {
          console.error(
            "[ikeda] answer failed",
            e instanceof Error ? e.name : "Error",
          );
          emit({
            type: "error",
            message: "回答を最後まで作れませんでした。もう一度お試しください。",
          });
        }
      } finally {
        closed = true;
        try {
          controller.close();
        } catch {}
      }
    },
    cancel() {
      manualAbort.abort();
    },
  });
  return new Response(stream, {
    headers: {
      ...headers,
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}
