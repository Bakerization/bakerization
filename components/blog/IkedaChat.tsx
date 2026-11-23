"use client";
import { IKEDA_ARTICLE_SLUG } from "@/lib/ikeda-sources";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Wordmark from "@/components/brand/Wordmark";
import { IKEDA, IKEDA_THEMES, IKEDA_PENDING_KEY } from "@/lib/ikeda-config";
import { readSse } from "@/lib/ikeda-stream";
import { formatBlogDate } from "@/lib/blog-format";
import type { ChatMessage, IkedaSource, Thought } from "@/lib/ikeda-types";
import {
  withBlogLanguage as withLang,
  type BlogLanguage as Locale,
  blogFont,
} from "@/lib/blog-language";
import { blogText, blogTheme, conceptQuestion } from "@/lib/blog-copy";
import BlogLanguageSwitcher from "./BlogLanguageSwitcher";
import styles from "./IkedaChat.module.css";

type Scope = { theme?: string; year?: number; article?: string };
type Message = ChatMessage & {
  state?: "done" | "streaming" | "stopped" | "error";
  error?: string;
};
type Thread = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  scope: Scope;
};
const STORAGE = "bakerization.ikeda.chats.v1",
  ACTIVE = "bakerization.ikeda.active.v1";
const emptyThread = (): Thread => ({
  id: "",
  title: "新しいチャット",
  messages: [],
  updatedAt: Date.now(),
  scope: {},
});
function Icon({
  name,
}: {
  name: "menu" | "plus" | "arrow" | "close" | "square" | "book";
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "menu" ? (
        <path d="M4 6h16M4 12h12M4 18h16" />
      ) : name === "plus" ? (
        <path d="M12 5v14M5 12h14" />
      ) : name === "arrow" ? (
        <path d="M12 19V5m-6 6 6-6 6 6" />
      ) : name === "close" ? (
        <path d="m6 6 12 12M6 18 18 6" />
      ) : name === "square" ? (
        <rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor" />
      ) : (
        <path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1m0-14c3-2 6-2 9-1v14c-3-1-6-1-9 1V6Z" />
      )}
    </svg>
  );
}
function safeSource(s: unknown): s is IkedaSource {
  if (!s || typeof s !== "object") return false;
  const x = s as IkedaSource;
  return (
    typeof x.title === "string" &&
    typeof x.excerpt === "string" &&
    IKEDA_ARTICLE_SLUG.test(x.slug) &&
    x.url === `/blog/${x.slug}` &&
    Number.isInteger(x.number) &&
    Number.isFinite(Date.parse(x.date))
  );
}
function restoredThreads(value: unknown): Thread[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (x) =>
        x &&
        typeof x.id === "string" &&
        typeof x.title === "string" &&
        Array.isArray(x.messages),
    )
    .slice(0, IKEDA.savedChats)
    .map((x) => ({
      ...x,
      scope: x.scope || {},
      messages: x.messages
        .filter(
          (m: Message) =>
            ["user", "assistant"].includes(m.role) &&
            typeof m.content === "string",
        )
        .slice(-IKEDA.savedMessages)
        .map((m: Message) => ({
          ...m,
          sources: Array.isArray(m.sources) ? m.sources.filter(safeSource) : [],
        })),
    }));
}

export default function IkedaChat({
  initialQuestion = "",
  initialScope = {},
  locale = "ja",
}: {
  initialQuestion?: string;
  initialScope?: Scope;
  locale?: Locale;
}) {
  const router = useRouter();
  const tr = (ja: string, en: string) => blogText(locale, ja, en);
  const [ready, setReady] = useState(false);
  const [thread, setThread] = useState<Thread>(emptyThread);
  const [history, setHistory] = useState<Thread[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [panel, setPanel] = useState<IkedaSource | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const initialized = useRef(false),
    threadRef = useRef(thread),
    abortRef = useRef<AbortController | null>(null),
    sequence = useRef(0),
    scrollRef = useRef<HTMLDivElement | null>(null),
    inputRef = useRef<HTMLTextAreaElement | null>(null),
    atBottom = useRef(true);
  threadRef.current = thread;
  function stop() {
    sequence.current++;
    abortRef.current?.abort();
    setLoading(false);
    setThread((t) => ({
      ...t,
      messages: t.messages.map((m) =>
        m.state === "streaming" ? { ...m, state: "stopped" } : m,
      ),
    }));
  }
  function newChat() {
    stop();
    setThread({ ...emptyThread(), id: crypto.randomUUID() });
    setDraft("");
    setPanel(null);
    setSidebar(false);
    router.replace(withLang("/blog/chat", locale));
    inputRef.current?.focus();
  }
  async function openSource(source: IkedaSource) {
    setPanel(source);
    if (!source.thought) {
      try {
        const r = await fetch(`/api/ikeda/article/${source.slug}`);
        if (r.ok) {
          const data = await r.json();
          setPanel((p) =>
            p?.slug === source.slug
              ? { ...p, thought: data.thought as Thought }
              : p,
          );
        }
      } catch {}
    }
  }
  async function send(
    question: string,
    scope?: Scope,
    baseOverride?: Thread,
    retry = false,
  ) {
    const q = question.trim();
    if (!q || q.length > IKEDA.questionCharacters) return;
    abortRef.current?.abort();
    const requestId = ++sequence.current;
    const abort = new AbortController();
    abortRef.current = abort;
    const base = baseOverride || threadRef.current;
    const prior = retry ? base.messages.slice(0, -2) : base.messages;
    const current: Thread = {
      ...base,
      id: base.id || crypto.randomUUID(),
      title:
        prior.find((m) => m.role === "user")?.content.slice(0, 26) ||
        q.slice(0, 26),
      scope: scope || base.scope,
      updatedAt: Date.now(),
      messages: [
        ...prior,
        { role: "user", content: q },
        { role: "assistant", content: "", sources: [], state: "streaming" },
      ],
    };
    setThread(current);
    setDraft("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setLoading(true);
    setSidebar(false);
    atBottom.current = true;
    const edit = (patch: Partial<Message>, delta?: string) => {
      if (sequence.current !== requestId) return;
      setThread((t) =>
        t.id !== current.id
          ? t
          : {
              ...t,
              messages: t.messages.map((m, i) =>
                i === t.messages.length - 1
                  ? {
                      ...m,
                      ...patch,
                      ...(delta !== undefined
                        ? { content: m.content + delta }
                        : {}),
                    }
                  : m,
              ),
            },
      );
    };
    try {
      const response = await fetch("/api/ikeda/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          question: q,
          history: prior
            .slice(-IKEDA.historyMessages)
            .map((m) => ({ role: m.role, content: m.content.slice(0, 5000) })),
          ...current.scope,
        }),
        signal: abort.signal,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          (response.status === 429
            ? tr(
                "少し待ってからお試しください。",
                "Please wait a little before trying again.",
              )
            : "") ||
            tr(
              "回答を作れませんでした。もう一度お試しください。",
              "Could not generate an answer. Please try again.",
            ),
        );
      }
      if (!response.body)
        throw new Error(
          tr(
            "接続が切れました。もう一度お試しください。",
            "Connection lost. Please try again.",
          ),
        );
      let done = false;
      for await (const event of readSse(response.body)) {
        if (sequence.current !== requestId) break;
        if (event.type === "sources")
          edit({
            sources: (event.sources as IkedaSource[]).filter(safeSource),
          });
        if (event.type === "delta") edit({}, String(event.text || ""));
        if (event.type === "done") {
          done = true;
          edit({
            sources: (event.sources as IkedaSource[]).filter(safeSource),
            state: "done",
          });
        }
        if (event.type === "error") throw new Error(String(event.message));
      }
      if (!done && !abort.signal.aborted)
        throw new Error(
          tr(
            "接続が途中で切れました。もう一度お試しください。",
            "The connection ended before the answer was complete. Please try again.",
          ),
        );
    } catch (error) {
      if (!abort.signal.aborted)
        edit({
          state: "error",
          error:
            error instanceof Error
              ? error.message
              : tr("接続できませんでした。", "Could not connect."),
        });
    } finally {
      if (sequence.current === requestId) setLoading(false);
    }
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      if (initialized.current) return;
      initialized.current = true;
      setReady(true);
      let saved: Thread[] = [];
      try {
        saved = restoredThreads(
          JSON.parse(localStorage.getItem(STORAGE) || "[]"),
        );
        setHistory(saved);
      } catch {}
      let pending: { question?: string } & Scope = {
        question: initialQuestion,
        ...initialScope,
      };
      try {
        const raw = sessionStorage.getItem(IKEDA_PENDING_KEY);
        if (raw) {
          pending = JSON.parse(raw);
          sessionStorage.removeItem(IKEDA_PENDING_KEY);
        }
      } catch {}
      if (typeof pending.question === "string" && pending.question.trim()) {
        const scope: Scope = {};
        if (IKEDA_THEMES.some((t) => t.id === pending.theme))
          scope.theme = pending.theme;
        if (
          typeof pending.year === "number" &&
          Number.isInteger(pending.year) &&
          pending.year >= 2009 &&
          pending.year <= 2100
        )
          scope.year = pending.year;
        if (IKEDA_ARTICLE_SLUG.test(pending.article || ""))
          scope.article = pending.article;
        const base = { ...emptyThread(), id: crypto.randomUUID(), scope };
        setThread(base);
        void send(pending.question, scope, base);
      } else {
        let active = "";
        try {
          active = localStorage.getItem(ACTIVE) || "";
        } catch {}
        setThread(
          saved.find((t) => t.id === active) || {
            ...emptyThread(),
            id: crypto.randomUUID(),
          },
        );
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []); // Initial question is consumed exactly once; later conversations are local.
  useEffect(() => {
    if (!initialized.current || loading || !thread.messages.length) return;
    setHistory((previous) => {
      let next = [
        { ...thread, messages: thread.messages.slice(-IKEDA.savedMessages) },
        ...previous.filter((t) => t.id !== thread.id),
      ]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, IKEDA.savedChats);
      const serialize = () =>
        JSON.stringify(
          next.map((t) => ({
            ...t,
            messages: t.messages.map((m) => ({
              ...m,
              sources: m.sources?.map(({ thought: _thought, ...s }) => s),
            })),
          })),
        );
      try {
        while (serialize().length > IKEDA.savedCharacters && next.length > 1)
          next = next.slice(0, -1);
        localStorage.setItem(STORAGE, serialize());
        localStorage.setItem(ACTIVE, thread.id);
      } catch {}
      return next;
    });
  }, [thread, loading]);
  useEffect(() => {
    const mq = matchMedia("(max-width:760px)");
    const change = () => setNarrow(mq.matches);
    change();
    mq.addEventListener("change", change);
    return () => mq.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebar(false);
        setPanel(null);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (atBottom.current && scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread.messages, loading]);
  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );
  return (
    <div className={styles.shell} style={{ fontFamily: blogFont(locale) }}>
      {sidebar && (
        <button
          className={`${styles.backdrop} ${styles.sideBackdrop}`}
          aria-label={tr("メニューを閉じる", "Close menu")}
          onClick={() => setSidebar(false)}
        />
      )}
      <aside
        id="ikeda-sidebar"
        className={`${styles.sidebar} ${sidebar ? styles.sidebarOpen : ""}`}
        inert={narrow && !sidebar}
      >
        <Link
          href={withLang("/", locale === "ja" ? "ja" : "en")}
          className={styles.sideLogo}
        >
          <Wordmark height={15} />
        </Link>
        <button className={styles.newChat} onClick={newChat}>
          <Icon name="plus" />
          {tr("新しいチャット", "New chat")}
        </button>
        <Link href={withLang("/blog", locale)} className={styles.sideLink}>
          <Icon name="book" />
          {tr("ブログを読む", "Read the blog")}
        </Link>
        <p className={styles.historyLabel}>
          {tr("このブラウザの履歴", "History on this browser")}
        </p>
        <nav
          className={styles.history}
          aria-label={tr("会話の履歴", "Chat history")}
        >
          {history.map((t) => (
            <button
              className={`${styles.historyButton} ${t.id === thread.id ? styles.historyActive : ""}`}
              key={t.id}
              onClick={() => {
                stop();
                setThread(t);
                setPanel(null);
                setSidebar(false);
                setDraft("");
              }}
            >
              {t.title}
            </button>
          ))}
        </nav>
        <div className={styles.sideFooter}>
          {tr(
            "公開記事から、考えのつながりへ。",
            "Explore connections across the articles.",
          )}
          <br />
          <span>IKEDA AI / BAKERIZATION</span>
          <br />
          <Link
            href={withLang("/privacy", locale === "ja" ? "ja" : "en")}
            style={{ color: "inherit", fontSize: 10 }}
          >
            {tr("プライバシー", "Privacy")}
          </Link>
        </div>
      </aside>
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <button
              className={`${styles.iconButton} ${styles.menuButton}`}
              aria-label={tr("メニューを開く", "Open menu")}
              aria-expanded={sidebar}
              aria-controls="ikeda-sidebar"
              onClick={() => setSidebar(!sidebar)}
            >
              <Icon name="menu" />
            </button>
            <span className={styles.avatar}>✳</span>
            {tr("池田AI", "Ikeda AI")}
            <small>BAKERIZATION</small>
          </div>
          <div className={styles.headerActions}>
            <BlogLanguageSwitcher language={locale} />
            <Link href={withLang("/blog", locale)}>
              {tr("記事アーカイブ ↗", "Article archive ↗")}
            </Link>
            <button
              className={styles.iconButton}
              onClick={newChat}
              aria-label={tr("新しいチャット", "New chat")}
            >
              <Icon name="plus" />
            </button>
          </div>
        </header>
        <div
          className={styles.scroll}
          ref={scrollRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            atBottom.current =
              el.scrollHeight - el.scrollTop - el.clientHeight < 120;
          }}
        >
          {!thread.messages.length ? (
            <section className={styles.welcome}>
              <h1>{tr("池田AIに質問する", "Ask Ikeda AI")}</h1>
              <div className={styles.suggestions}>
                {[
                  IKEDA_THEMES[0],
                  IKEDA_THEMES[1],
                  IKEDA_THEMES[2],
                  IKEDA_THEMES[7],
                ].map((t) => (
                  <button
                    key={t.id}
                    className={styles.suggestion}
                    disabled={!ready}
                    onClick={() =>
                      void send(blogTheme(t.id, locale, "question"))
                    }
                  >
                    <small>{blogTheme(t.id, locale)}</small>
                    {blogTheme(t.id, locale, "question")}
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <div className={styles.messages}>
              {thread.messages.map((m, i) =>
                m.role === "user" ? (
                  <div key={i} className={styles.userMessage}>
                    <div className={styles.userBubble}>{m.content}</div>
                  </div>
                ) : (
                  <section
                    key={i}
                    className={styles.assistantMessage}
                    aria-label={tr("池田AIの回答", "Ikeda AI response")}
                  >
                    <span className={styles.avatar} aria-hidden>
                      ✳
                    </span>
                    <div className={styles.assistantBody}>
                      <div className={styles.assistantLabel}>
                        {tr("池田AI", "Ikeda AI")}
                      </div>
                      {!m.content && m.state === "streaming" ? (
                        <div className={styles.loading} role="status">
                          <i />
                          <i />
                          <i />
                          <span>
                            {tr(
                              "記事を読み解いています",
                              "Reading the articles",
                            )}
                          </span>
                        </div>
                      ) : (
                        <div className={styles.answer}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ href, children }) => {
                                const match = href?.match(/^#source-(\d+)$/);
                                if (match) {
                                  const source = m.sources?.find(
                                    (s) => s.number === Number(match[1]),
                                  );
                                  return source ? (
                                    <button
                                      className={styles.citation}
                                      onClick={() => void openSource(source)}
                                      aria-label={
                                        locale === "ja"
                                          ? `参照記事${source.number}：${source.title}`
                                          : `${tr("", "Sources")} ${source.number}: ${source.title}`
                                      }
                                    >
                                      {source.number}
                                    </button>
                                  ) : (
                                    <span>{children}</span>
                                  );
                                }
                                const source = m.sources?.find(
                                  (s) => s.url === href,
                                );
                                return source ? (
                                  <Link
                                    href={withLang(source.url, locale)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {children}
                                  </Link>
                                ) : (
                                  <span>{children}</span>
                                );
                              },
                            }}
                          >
                            {m.content.replace(/\[(\d+)\](?!\()/g, (all, n) =>
                              m.sources?.some((s) => s.number === Number(n))
                                ? `[${n}](#source-${n})`
                                : all,
                            )}
                          </ReactMarkdown>
                        </div>
                      )}
                      {!!m.sources?.length && (
                        <details className={styles.sourceList}>
                          <summary>
                            {m.state === "done"
                              ? tr("参照した記事", "Sources")
                              : tr("参照記事の候補", "Possible sources")}{" "}
                            · {m.sources.length}
                          </summary>
                          <div className={styles.sourceCards}>
                            {m.sources.map((s) => (
                              <button
                                key={s.number}
                                className={styles.sourceCard}
                                onClick={() => void openSource(s)}
                              >
                                <small>
                                  <span>{s.number} · SOURCE</span>
                                  <time dateTime={s.date}>
                                    {formatBlogDate(s.date)}
                                  </time>
                                </small>
                                <strong>{s.title}</strong>
                              </button>
                            ))}
                          </div>
                        </details>
                      )}
                      {m.state === "stopped" && !m.content && (
                        <p style={{ fontSize: 11, color: "var(--sub)" }}>
                          {tr("生成を停止しました", "Generation stopped")}
                        </p>
                      )}
                      {m.error && (
                        <div className={styles.error} role="alert">
                          {m.error}
                          {i === thread.messages.length - 1 && (
                            <button
                              onClick={() =>
                                void send(
                                  thread.messages[i - 1]?.content || "",
                                  thread.scope,
                                  thread,
                                  true,
                                )
                              }
                            >
                              {tr("もう一度試す", "Try again")}
                            </button>
                          )}
                        </div>
                      )}
                      {m.content && m.state !== "streaming" && (
                        <div className={styles.messageActions}>
                          <button
                            onClick={() => {
                              void navigator.clipboard
                                .writeText(m.content)
                                .then(() => {
                                  setCopied(i);
                                  setTimeout(() => setCopied(null), 1800);
                                })
                                .catch(() => undefined);
                            }}
                          >
                            {copied === i
                              ? tr("コピーしました", "Copied")
                              : tr("コピー", "Copy")}
                          </button>
                          {m.state === "stopped" && (
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--sub)",
                                padding: 4,
                              }}
                            >
                              {tr("生成を停止しました", "Generation stopped")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                ),
              )}
            </div>
          )}
        </div>
        <footer className={styles.composerArea}>
          <div className={styles.composerInner}>
            <div className={styles.scope}>
              {thread.scope.year && (
                <button
                  onClick={() =>
                    setThread((t) => ({
                      ...t,
                      scope: { ...t.scope, year: undefined },
                    }))
                  }
                >
                  {thread.scope.year}
                  {locale === "ja" ? "年" : ""} ×
                </button>
              )}
              {thread.scope.theme && (
                <button
                  onClick={() =>
                    setThread((t) => ({
                      ...t,
                      scope: { ...t.scope, theme: undefined },
                    }))
                  }
                >
                  {blogTheme(thread.scope.theme, locale)} ×
                </button>
              )}
              {thread.scope.article && (
                <button
                  onClick={() =>
                    setThread((t) => ({
                      ...t,
                      scope: { ...t.scope, article: undefined },
                    }))
                  }
                >
                  {tr("この記事を起点に ×", "Starting from this article ×")}
                </button>
              )}
            </div>
            <form
              className={styles.composer}
              onSubmit={(e) => {
                e.preventDefault();
                if (!loading) void send(draft);
              }}
            >
              <label className={styles.srOnly} htmlFor="ikeda-message">
                {tr("池田AIに質問する", "Ask Ikeda AI")}
              </label>
              <textarea
                id="ikeda-message"
                ref={inputRef}
                disabled={!ready}
                value={draft}
                rows={1}
                maxLength={IKEDA.questionCharacters}
                placeholder={tr("池田AIに聞いてみる", "Ask Ikeda AI")}
                onChange={(e) => {
                  setDraft(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 170)}px`;
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    !e.nativeEvent.isComposing &&
                    e.nativeEvent.keyCode !== 229 &&
                    !loading
                  ) {
                    e.preventDefault();
                    void send(draft);
                  }
                }}
              />
              <div className={styles.composerBottom}>
                <span className={styles.composerHint}>
                  {tr(
                    "記事を根拠に、考えをたどる",
                    "Explore ideas through their sources",
                  )}
                </span>
                {loading ? (
                  <button
                    type="button"
                    className={styles.send}
                    onClick={stop}
                    aria-label={tr("生成を停止", "Stop generating")}
                  >
                    <Icon name="square" />
                  </button>
                ) : (
                  <button
                    className={styles.send}
                    type="submit"
                    disabled={!ready || !draft.trim()}
                    aria-label={tr("質問を送信", "Send question")}
                  >
                    <Icon name="arrow" />
                  </button>
                )}
              </div>
            </form>
            <p className={styles.disclaimer}>
              {tr(
                "公開記事に基づくAI。池田浩明本人の回答ではありません。履歴はこのブラウザに保存されます。",
                "AI grounded in published articles, not Hiroaki Ikeda himself. History stays in this browser.",
              )}
            </p>
          </div>
        </footer>
      </main>
      {panel && (
        <>
          <button
            className={`${styles.backdrop} ${styles.panelBackdrop}`}
            aria-label={tr("参照記事を閉じる", "Close source")}
            onClick={() => setPanel(null)}
          />
          <aside
            className={styles.panel}
            aria-label={tr("参照記事を読み解く", "Explore the source")}
          >
            <div className={styles.panelHeader}>
              SOURCE {panel.number}
              <button
                className={styles.iconButton}
                onClick={() => setPanel(null)}
                aria-label={tr("参照記事を閉じる", "Close source")}
              >
                <Icon name="close" />
              </button>
            </div>
            <time dateTime={panel.date}>{formatBlogDate(panel.date)}</time>
            <h2>{panel.title}</h2>
            <Link
              href={withLang(panel.url, locale)}
              className={styles.readArticle}
              target="_blank"
              rel="noopener noreferrer"
            >
              {tr("原文を読む ↗", "Read the article ↗")}
            </Link>
            {panel.thought ? (
              <>
                <p className={styles.panelSub}>
                  {tr("この記事の問い", "The article’s question (Japanese)")}
                </p>
                <p className={styles.panelQuestion}>{panel.thought.question}</p>
                <p className={styles.panelSub}>
                  {tr(
                    "AIによる読み解きと、その根拠",
                    "Source notes and evidence (Japanese)",
                  )}
                </p>
                {panel.thought.claims.map((c, i) => (
                  <div key={i} className={styles.panelClaim}>
                    <strong>{c.statement}</strong>
                    <p>{c.basis}</p>
                    <blockquote>{c.quote}</blockquote>
                    <small>
                      {c.voice === "interviewee"
                        ? tr("取材相手の発言", "Interviewee’s words")
                        : c.voice === "unclear"
                          ? tr(
                              "引用文（話者未確認）",
                              "Quotation; speaker unconfirmed",
                            )
                          : c.voice === "other_author"
                            ? tr("他筆者の文章", "Another writer’s words")
                            : panel.thought?.authorship === "ikeda_explicit"
                              ? tr("池田浩明の文章", "Hiroaki Ikeda’s words")
                              : tr(
                                  "記事中の文章（署名未確認）",
                                  "Article text; byline unconfirmed",
                                )}
                    </small>
                  </div>
                ))}
                <p className={styles.panelSub}>
                  {tr("つながる言葉", "Related concepts")}
                </p>
                <div className={styles.panelThemes}>
                  {panel.thought.concepts.map((concept) => (
                    <button
                      key={concept}
                      disabled={loading}
                      onClick={() => {
                        void send(conceptQuestion(concept, locale), {
                          ...thread.scope,
                          article: panel.slug,
                        });
                        setPanel(null);
                      }}
                    >
                      {concept} ↗
                    </button>
                  ))}
                </div>
                <div className={styles.panelThemes}>
                  {panel.themes.map((id) => (
                    <Link href={withLang(`/blog?theme=${id}`, locale)} key={id}>
                      {blogTheme(id, locale)} →
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.panelClaim}>
                <blockquote>{panel.excerpt}</blockquote>
              </div>
            )}
          </aside>
        </>
      )}
    </div>
  );
}
