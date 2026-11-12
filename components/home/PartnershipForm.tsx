"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ContentHeading, Inner } from "@/components/brand/ui";
import { withLang, type Locale } from "@/lib/locale";
import type { PartnershipError, PartnershipResult } from "@/lib/partnership";
import styles from "./PartnershipForm.module.css";

const copy = {
  ja: {
    title: "共同事業を考える",
    intro: "社名を入れると、Bakerizationと一緒にできる事業を2案提案します。",
    company: "社名",
    placeholder: "会社名を入力",
    website: "公式サイトを追加（任意）",
    submit: "共同事業案をつくる",
    loading: "公開情報を調べ、事業案を作成しています。",
    examples: ["ドトールコーヒー", "レオン自動機", "Adjust"],
    newChat: "新しいチャット",
    you: "あなた",
    sources: "企業情報の出典",
    partnerRole: "相手企業の役割",
    bakerizationRole: "Bakerizationの役割",
    revenue: "収益モデル",
    pilot: "最初の実証",
    contact: "このアイデアを相談する",
    note: "AIが作成した検討用のアイデアです。",
    errors: {
      invalid_input: "社名または公式サイトの入力を確認してください。",
      needs_website: "企業を特定できませんでした。公式サイトを追加して、もう一度お試しください。",
      rate_limited: "本日の利用上限に達しました。明日またお試しください。",
      unavailable: "事業案を作成できませんでした。時間をおいてもう一度お試しください。",
    },
  },
  en: {
    title: "Explore a partnership",
    intro: "Enter a company name to get two ideas for working with Bakerization.",
    company: "Company name",
    placeholder: "Enter a company name",
    website: "Add an official website (optional)",
    submit: "Generate ideas",
    loading: "Researching the company and developing ideas.",
    examples: ["Starbucks", "Rheon", "Adjust"],
    newChat: "New chat",
    you: "You",
    sources: "Company sources",
    partnerRole: "Partner's role",
    bakerizationRole: "Bakerization's role",
    revenue: "Revenue model",
    pilot: "First pilot",
    contact: "Discuss these ideas",
    note: "AI-generated ideas for discussion.",
    errors: {
      invalid_input: "Check the company name or official website and try again.",
      needs_website: "We couldn't identify the company. Add its official website and try again.",
      rate_limited: "Today's usage limit has been reached. Try again tomorrow.",
      unavailable: "We couldn't generate ideas. Try again in a moment.",
    },
  },
} satisfies Record<Locale, { errors: Record<PartnershipError, string> } & Record<string, unknown>>;

const details = ["partnerRole", "bakerizationRole", "revenue", "pilot"] as const;

type Reply = { result: PartnershipResult } | { error: PartnershipError };
type Turn = { id: number; company: string; reply?: Reply };

export default function PartnershipForm({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const companyInput = useRef<HTMLInputElement>(null);
  const websiteDetails = useRef<HTMLDetailsElement>(null);
  const latestReply = useRef<HTMLHeadingElement>(null);
  const nextTurnId = useRef(0);
  const inFlight = useRef(false);
  const latest = turns.at(-1);
  const pending = Boolean(latest && !latest.reply);

  useEffect(() => {
    if (latest?.reply && "result" in latest.reply) latestReply.current?.focus();
  }, [latest]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = company.trim();
    if (inFlight.current || !name) return;
    inFlight.current = true;
    const id = ++nextTurnId.current;
    setTurns((previous) => [...previous.slice(-2), { id, company: name }]);

    let reply: Reply = { error: "unavailable" };
    try {
      const response = await fetch("/api/partnership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: name, website, locale }),
        signal: AbortSignal.timeout(65_000),
      });
      const payload = await response.json().catch(() => null);
      if (response.ok && payload) {
        reply = { result: payload as PartnershipResult };
        setCompany("");
        setWebsite("");
        if (websiteDetails.current) websiteDetails.current.open = false;
      } else if (response.status === 429) {
        reply = { error: "rate_limited" };
      } else if (typeof payload?.error === "string" && Object.hasOwn(t.errors, payload.error)) {
        reply = { error: payload.error as PartnershipError };
        if (payload.error === "needs_website" && websiteDetails.current) websiteDetails.current.open = true;
      }
    } catch {
      reply = { error: "unavailable" };
    } finally {
      setTurns((previous) => previous.map((turn) => turn.id === id ? { ...turn, reply } : turn));
      inFlight.current = false;
    }
  }

  function reset() {
    setTurns([]);
    setCompany("");
    setWebsite("");
    if (websiteDetails.current) websiteDetails.current.open = false;
    companyInput.current?.focus();
  }

  return (
    <section id="partnership" aria-label={t.title} className={styles.section}>
      <Inner className="mob-pad-v-sm" style={{ paddingTop: 82, paddingBottom: 82 }}>
        <div className={styles.chat}>
          <header className={styles.header}>
            <ContentHeading title={t.title} style={{ marginBottom: 0 }} />
            <p>{t.intro}</p>
            {latest && (
              <button className={styles.newChat} type="button" onClick={reset} disabled={pending}>
                {t.newChat}
              </button>
            )}
          </header>

          {turns.map((turn) => (
            <div className={styles.turn} key={turn.id}>
              <p className={styles.userMessage}>
                <span className={styles.visuallyHidden}>{t.you} </span>{turn.company}
              </p>
              <div className={styles.assistantMessage}>
                <span className={styles.avatar} aria-hidden="true">B</span>
                <div className={styles.reply}>
                  <div className={styles.sender}>Bakerization AI</div>
                  {!turn.reply ? (
                    <p role="status" className={styles.status}>{t.loading}</p>
                  ) : "error" in turn.reply ? (
                    <p role={turn === latest ? "alert" : undefined} className={styles.error}>{t.errors[turn.reply.error]}</p>
                  ) : (
                    <div className={styles.results}>
                      <h3 ref={turn === latest ? latestReply : null} tabIndex={-1}>{turn.reply.result.company} × Bakerization</h3>
                      <p>
                        {turn.reply.result.profile}{" "}
                        {turn.reply.result.sources.map((source, index) => (
                          <a
                            key={source.url}
                            className={styles.citation}
                            href={source.url}
                            title={source.title}
                            aria-label={t.sources + " " + (index + 1) + " · " + source.title}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            [{index + 1}]
                          </a>
                        ))}
                      </p>
                      {turn.reply.result.proposals.map((idea, index) => (
                        <article className={styles.idea} key={index}>
                          <h4>{idea.title}</h4>
                          <p>{idea.concept}</p>
                          <dl>
                            {details.map((detail) => (
                              <div key={detail}>
                                <dt>{t[detail]}</dt>
                                <dd>{idea[detail]}</dd>
                              </div>
                            ))}
                          </dl>
                        </article>
                      ))}
                      <Link className={styles.contact} href={withLang("/contact", locale)}>{t.contact} ↗</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <form className={styles.composer} onSubmit={submit} aria-busy={pending}>
            <div className={styles.inputRow}>
              <label className={styles.visuallyHidden} htmlFor="partnership-company">{t.company}</label>
              <input
                id="partnership-company"
                ref={companyInput}
                name="company"
                autoComplete="off"
                required
                maxLength={100}
                readOnly={pending}
                placeholder={t.placeholder}
                value={company}
                onChange={(event) => setCompany(event.target.value)}
              />
              <button className={styles.send} type="submit" disabled={pending || !company.trim()} aria-label={t.submit} title={t.submit}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5m-6 6 6-6 6 6" />
                </svg>
              </button>
            </div>
            <details ref={websiteDetails} className={styles.website}>
              <summary>{t.website}</summary>
              <input
                name="website"
                aria-label={t.website}
                maxLength={300}
                inputMode="url"
                readOnly={pending}
                placeholder="https://example.com"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </details>
          </form>

          {!latest && (
            <div className={styles.examples}>
              {t.examples.map((example) => (
                <button key={example} type="button" onClick={() => {
                  setCompany(example);
                  companyInput.current?.focus();
                }}>{example}</button>
              ))}
            </div>
          )}
          <p className={styles.note}>{t.note}</p>
        </div>
      </Inner>
    </section>
  );
}
