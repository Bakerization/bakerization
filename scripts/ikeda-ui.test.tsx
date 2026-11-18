// @vitest-environment jsdom
import { StrictMode } from "react";
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { IKEDA_PENDING_KEY } from "../lib/ikeda-config";
import BlogAsk from "../components/blog/BlogAsk";
import IkedaChat from "../components/blog/IkedaChat";
const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
const source = {
  number: 1,
  slug: "panlabo-2228",
  title: "劣等生キタノカオリが残った理由",
  date: "2024-11-10T07:04:00.000Z",
  url: "/blog/panlabo-2228",
  excerpt: "みんなの声によって、奇跡的に残りました。",
  themes: ["wheat"],
};
function answerStream() {
  const events = [
    { type: "sources", sources: [source] },
    { type: "delta", text: "食べる人の声が、生産の継続につながりました。[1]" },
    {
      type: "done",
      sources: [source],
      usage: { inputTokens: 1000, outputTokens: 100, contextTokens: 700 },
    },
  ];
  return new Response(
    new ReadableStream({
      start(c) {
        for (const e of events)
          c.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(e)}\n\n`));
        c.close();
      },
    }),
    { status: 200, headers: { "Content-Type": "text/event-stream" } },
  );
}
function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => data.set(k, String(v)),
    removeItem: (k: string) => data.delete(k),
    clear: () => data.clear(),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() {
      return data.size;
    },
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("localStorage", memoryStorage());
  vi.stubGlobal("sessionStorage", memoryStorage());
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
test("a blog question moves to the dedicated chat without putting custom text in the URL", () => {
  render(<BlogAsk year={2014} theme="wheat" />);
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "国産小麦はなぜ大切？" },
  });
  fireEvent.submit(screen.getByRole("textbox").closest("form")!);
  expect(router.push).toHaveBeenCalledWith("/blog/chat");
  expect(JSON.parse(sessionStorage.getItem(IKEDA_PENDING_KEY)!)).toEqual({
    question: "国産小麦はなぜ大切？",
    year: 2014,
    theme: "wheat",
  });
});
test("Japanese IME Enter does not send; a normal Enter streams a sourced answer", async () => {
  const fetcher = vi.fn(async () => answerStream());
  vi.stubGlobal("fetch", fetcher);
  render(<IkedaChat />);
  const box = screen.getByRole("textbox");
  await waitFor(() => expect(box.hasAttribute("disabled")).toBe(false));
  fireEvent.change(box, { target: { value: "キタノカオリが残った理由は？" } });
  fireEvent.keyDown(box, { key: "Enter", isComposing: true, keyCode: 229 });
  expect(fetcher).not.toHaveBeenCalled();
  fireEvent.keyDown(box, { key: "Enter", isComposing: false, keyCode: 13 });
  await waitFor(() => expect(screen.getByText(/食べる人の声が/)).toBeTruthy());
  expect(fetcher).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: /参照記事1/ }));
  expect(
    (await screen.findByRole("link", { name: "原文を読む ↗" })).getAttribute(
      "href",
    ),
  ).toBe("/blog/panlabo-2228");
});
test("a question coming from the blog is consumed once under React StrictMode", async () => {
  const fetcher = vi.fn(async () => answerStream());
  vi.stubGlobal("fetch", fetcher);
  sessionStorage.setItem(
    IKEDA_PENDING_KEY,
    JSON.stringify({ question: "パンと食文化の関係は？" }),
  );
  render(
    <StrictMode>
      <IkedaChat />
    </StrictMode>,
  );
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(screen.getByText(/食べる人の声が/)).toBeTruthy());
  expect(sessionStorage.getItem(IKEDA_PENDING_KEY)).toBeNull();
});
test("stopping generation leaves the conversation usable", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      (_url, options) =>
        new Promise((_resolve, reject) =>
          options.signal.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          ),
        ),
    ),
  );
  render(<IkedaChat />);
  await new Promise((r) => setTimeout(r, 5));
  fireEvent.change(screen.getByRole("textbox"), {
    target: { value: "パンの未来は？" },
  });
  fireEvent.click(screen.getByRole("button", { name: "質問を送信" }));
  fireEvent.click(await screen.findByRole("button", { name: "生成を停止" }));
  expect(
    await screen.findByRole("button", { name: "質問を送信" }),
  ).toBeTruthy();
  expect(screen.getByText("生成を停止しました")).toBeTruthy();
});
