"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import NewsMarkdown from "@/components/news/NewsMarkdown";
import { fromDateInputValue, toDateInputValue } from "@/lib/news-format";
import type { NewsItem } from "@/lib/news-types";
import { toLinkSafeUrl, toSlug } from "@/lib/slug";
import { C, FONTS } from "@/lib/theme";

type Lang = "ja" | "en";

const INLINE_PREFIX = "blog-assets/news/";
const COVER_PREFIX = "blog-assets/news/cover/";

function asciiSlug(value: string) {
  return toSlug(value)
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uploadImage(file: File, prefix: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("prefix", prefix);
  const response = await fetch("/api/blog/upload", { method: "POST", body: form });
  const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || !data.url) throw new Error(data.error || "画像のアップロードに失敗しました。");
  return data.url;
}

function altFromFile(file: File) {
  return file.name.replace(/\.[^/.]+$/, "").replace(/[[\]]/g, "") || "image";
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: C.fieldBg,
  color: C.ink,
  border: `1.5px solid ${C.fieldBorder}`,
  padding: "12px 14px",
  fontFamily: FONTS.body,
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: FONTS.mono,
  fontSize: 11,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: C.sub,
  marginBottom: 8,
};

const toolButton: React.CSSProperties = {
  fontFamily: FONTS.mono,
  fontSize: 11,
  letterSpacing: "0.12em",
  padding: "8px 12px",
  background: "transparent",
  color: C.ink,
  border: `1px solid ${C.line}`,
  cursor: "pointer",
};

function tabStyle(active: boolean): React.CSSProperties {
  return {
    ...toolButton,
    letterSpacing: "0.2em",
    color: active ? C.bg : C.sub,
    background: active ? C.accent : "transparent",
    borderColor: active ? C.accent : C.line,
  };
}

function actionButton(primary: boolean, disabled: boolean): React.CSSProperties {
  return {
    padding: "14px 22px",
    fontFamily: FONTS.body,
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 0.3,
    border: primary ? "none" : `1.5px solid ${C.ink}`,
    background: primary ? C.accent : "transparent",
    color: primary ? C.bg : C.ink,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.6 : 1,
  };
}

export default function NewsEditor({ initialItem }: { initialItem?: NewsItem }) {
  const router = useRouter();
  const isEdit = Boolean(initialItem);

  const [title, setTitle] = useState(initialItem?.title ?? "");
  const [titleEn, setTitleEn] = useState(initialItem?.titleEn ?? "");
  const [summary, setSummary] = useState(initialItem?.summary ?? "");
  const [summaryEn, setSummaryEn] = useState(initialItem?.summaryEn ?? "");
  const [slug, setSlug] = useState(initialItem?.slug ?? "");
  const [date, setDate] = useState(toDateInputValue(initialItem?.publishedAt ?? new Date().toISOString()));
  const [coverImageUrl, setCoverImageUrl] = useState(initialItem?.coverImageUrl ?? "");
  const [body, setBody] = useState<Record<Lang, string>>({
    ja: initialItem?.bodyMd ?? "",
    en: initialItem?.bodyMdEn ?? "",
  });
  const [lang, setLang] = useState<Lang>("ja");
  const [uploading, setUploading] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const suggestedSlug = asciiSlug(titleEn) || "（英語タイトルから自動生成／空なら日付）";
  const published = initialItem?.published ?? false;

  // ── Markdown editing helpers ──────────────────────────────────
  function setCurrentBody(next: string) {
    setBody((prev) => ({ ...prev, [lang]: next }));
  }

  /** Replace the selection with `before + (selection || placeholder) + after`, keeping the inner text selected. */
  function wrapSelection(before: string, after: string, placeholder: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end, value } = ta;
    const inner = value.slice(start, end) || placeholder;
    setCurrentBody(value.slice(0, start) + before + inner + after + value.slice(end));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + inner.length);
    });
  }

  /** Prefix every line touched by the selection (headings, lists, quotes). */
  function prefixLines(prefix: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end, value } = ta;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEndIdx = value.indexOf("\n", end);
    const lineEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
    const block = value
      .slice(lineStart, lineEnd)
      .split("\n")
      .map((line) => prefix + line.replace(/^(#{1,6} |> |- )/, ""))
      .join("\n");
    setCurrentBody(value.slice(0, lineStart) + block + value.slice(lineEnd));
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(lineStart + block.length, lineStart + block.length);
    });
  }

  /** Insert text at `pos` in the given language's body (used after async uploads). */
  function insertAt(target: Lang, pos: number, text: string) {
    setBody((prev) => {
      const current = prev[target];
      const at = Math.min(pos, current.length);
      const needsBreakBefore = at > 0 && current[at - 1] !== "\n";
      const chunk = `${needsBreakBefore ? "\n" : ""}${text}\n`;
      return { ...prev, [target]: current.slice(0, at) + chunk + current.slice(at) };
    });
  }

  function addLink() {
    const url = window.prompt("リンクURL（https://…）", "https://");
    if (!url || url === "https://") return;
    wrapSelection("[", `](${toLinkSafeUrl(url)})`, "リンクテキスト");
  }

  async function insertImages(files: File[]) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    const target = lang;
    let pos = textareaRef.current?.selectionEnd ?? body[target].length;
    setMessage("");
    for (const file of images) {
      setUploading((n) => n + 1);
      try {
        const url = await uploadImage(file, INLINE_PREFIX);
        const text = `![${altFromFile(file)}](${url})`;
        insertAt(target, pos, text);
        pos += text.length + 2;
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "画像のアップロードに失敗しました。");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  async function onPickCover(file: File) {
    setUploading((n) => n + 1);
    setMessage("");
    try {
      setCoverImageUrl(await uploadImage(file, COVER_PREFIX));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "画像のアップロードに失敗しました。");
    } finally {
      setUploading((n) => n - 1);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.metaKey || e.ctrlKey)) return;
    if (e.key === "b") {
      e.preventDefault();
      wrapSelection("**", "**", "太字");
    } else if (e.key === "i") {
      e.preventDefault();
      wrapSelection("*", "*", "斜体");
    } else if (e.key === "k") {
      e.preventDefault();
      addLink();
    }
  }

  // ── Save / delete ─────────────────────────────────────────────
  async function save(nextPublished: boolean) {
    if (!title.trim()) {
      setMessage("タイトル（日本語）を入力してください。");
      return;
    }
    const publishedAt = fromDateInputValue(date);
    if (!publishedAt) {
      setMessage("掲載日を入力してください。");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: isEdit ? "update" : "create",
          slug: isEdit ? initialItem!.slug : slug || asciiSlug(titleEn),
          title,
          titleEn,
          summary,
          summaryEn,
          bodyMd: body.ja,
          bodyMdEn: body.en,
          coverImageUrl,
          published: nextPublished,
          publishedAt,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { item?: NewsItem; error?: string };
      if (!response.ok || !data.item) {
        setMessage(data.error || "保存に失敗しました。");
        return;
      }
      router.push(data.item.published ? `/news/${data.item.slug}` : "/admen/news");
      router.refresh();
    } catch {
      setMessage("保存に失敗しました。通信状況を確認してください。");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!initialItem) return;
    if (!window.confirm(`「${initialItem.title}」を削除します。元に戻せません。よろしいですか？`)) return;
    setSaving(true);
    const response = await fetch(`/api/news/${encodeURIComponent(initialItem.slug)}`, { method: "DELETE" });
    setSaving(false);
    if (!response.ok) {
      setMessage("削除に失敗しました。");
      return;
    }
    router.push("/admen/news");
    router.refresh();
  }

  const busy = saving || uploading > 0;
  const previewTitle = lang === "en" ? titleEn || title : title;

  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: FONTS.body, paddingTop: 96 }}>
      <div
        className="mob-pad"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "32px 48px 96px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div
          className="mob-flex-wrap"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            borderTop: `1px solid ${C.line}`,
            borderBottom: `1px solid ${C.line}`,
            padding: "16px 0",
          }}
        >
          <Link
            href="/admen/news"
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: C.accent,
              textDecoration: "none",
            }}
          >
            ▍ADMEN — {isEdit ? "Edit News" : "New News"}
          </Link>
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.22em",
              color: published ? C.accent : C.sub,
            }}
          >
            {isEdit ? (published ? "公開中" : "下書き") : "新規"}
          </span>
        </div>

        {/* Meta */}
        <section
          className="mob-1col"
          style={{
            background: C.card,
            border: `1.5px solid ${C.line}`,
            padding: 28,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          <label>
            <span style={labelStyle}>▎タイトル (JA) *</span>
            <input style={fieldStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ニュースのタイトル" />
          </label>
          <label>
            <span style={labelStyle}>▎Title (EN)</span>
            <input style={fieldStyle} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="English title (optional)" />
          </label>
          <label>
            <span style={labelStyle}>▎概要 (JA) — 一覧・SNS用</span>
            <textarea
              style={{ ...fieldStyle, minHeight: 84, resize: "vertical", lineHeight: 1.7 }}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="一覧やSNSシェア時に表示される1〜2文"
            />
          </label>
          <label>
            <span style={labelStyle}>▎Summary (EN)</span>
            <textarea
              style={{ ...fieldStyle, minHeight: 84, resize: "vertical", lineHeight: 1.7 }}
              value={summaryEn}
              onChange={(e) => setSummaryEn(e.target.value)}
              placeholder="One or two sentences (optional)"
            />
          </label>
          <label>
            <span style={labelStyle}>▎URL（スラッグ）{isEdit ? " — 変更不可" : ""}</span>
            {isEdit ? (
              <div style={{ ...fieldStyle, color: C.sub, fontFamily: FONTS.mono, fontSize: 13 }}>/news/{initialItem!.slug}</div>
            ) : (
              <input
                style={{ ...fieldStyle, fontFamily: FONTS.mono, fontSize: 13 }}
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}
                placeholder={suggestedSlug}
              />
            )}
          </label>
          <label>
            <span style={labelStyle}>▎掲載日</span>
            <input type="date" style={fieldStyle} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <div style={{ gridColumn: "1 / -1" }}>
            <span style={labelStyle}>▎カバー画像（任意・一覧とSNSシェアに使用）</span>
            <div className="mob-flex-wrap" style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImageUrl}
                  alt=""
                  style={{ width: 160, aspectRatio: "16/9", objectFit: "cover", border: `1px solid ${C.line}` }}
                />
              ) : null}
              <button type="button" style={toolButton} onClick={() => coverInputRef.current?.click()} disabled={busy}>
                {coverImageUrl ? "画像を変更" : "画像をアップロード"}
              </button>
              {coverImageUrl ? (
                <button type="button" style={{ ...toolButton, color: C.sub }} onClick={() => setCoverImageUrl("")}>
                  外す
                </button>
              ) : null}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onPickCover(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </section>

        {/* Body */}
        <section style={{ background: C.card, border: `1.5px solid ${C.line}` }}>
          <div
            className="mob-flex-wrap"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              padding: 12,
              borderBottom: `1px solid ${C.line}`,
              alignItems: "center",
            }}
          >
            <button type="button" style={tabStyle(lang === "ja")} onClick={() => setLang("ja")}>
              本文 JA
            </button>
            <button type="button" style={tabStyle(lang === "en")} onClick={() => setLang("en")}>
              Body EN
            </button>
            <span style={{ width: 1, alignSelf: "stretch", background: C.line, margin: "0 6px" }} />
            <button type="button" style={{ ...toolButton, fontWeight: 700 }} title="太字 (⌘B)" onClick={() => wrapSelection("**", "**", "太字")}>
              B
            </button>
            <button type="button" style={{ ...toolButton, fontStyle: "italic" }} title="斜体 (⌘I)" onClick={() => wrapSelection("*", "*", "斜体")}>
              I
            </button>
            <button type="button" style={toolButton} title="見出し" onClick={() => prefixLines("## ")}>
              H2
            </button>
            <button type="button" style={toolButton} title="小見出し" onClick={() => prefixLines("### ")}>
              H3
            </button>
            <button type="button" style={toolButton} title="箇条書き" onClick={() => prefixLines("- ")}>
              • リスト
            </button>
            <button type="button" style={toolButton} title="引用" onClick={() => prefixLines("> ")}>
              ❝ 引用
            </button>
            <button type="button" style={toolButton} title="リンク (⌘K)" onClick={addLink}>
              🔗 リンク
            </button>
            <button type="button" style={toolButton} title="画像を挿入" onClick={() => imageInputRef.current?.click()} disabled={busy}>
              🖼 画像
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              hidden
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) void insertImages(files);
                e.target.value = "";
              }}
            />
            {uploading > 0 ? (
              <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: C.accent, marginLeft: 8 }}>アップロード中…</span>
            ) : null}
          </div>

          <div className="mob-1col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 560 }}>
            <textarea
              ref={textareaRef}
              value={body[lang]}
              onChange={(e) => setCurrentBody(e.target.value)}
              onKeyDown={onKeyDown}
              onPaste={(e) => {
                const files = Array.from(e.clipboardData.files);
                if (files.some((f) => f.type.startsWith("image/"))) {
                  e.preventDefault();
                  void insertImages(files);
                }
              }}
              onDragOver={(e) => {
                if (e.dataTransfer.types.includes("Files")) {
                  e.preventDefault();
                  setDragOver(true);
                }
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                const files = Array.from(e.dataTransfer.files);
                setDragOver(false);
                if (files.length) {
                  e.preventDefault();
                  void insertImages(files);
                }
              }}
              placeholder={
                lang === "ja"
                  ? "Markdownで本文を書きます。\n\n## 見出し\n**太字** や [リンク](https://example.com)\n- 箇条書き\n\n画像はツールバー、貼り付け、ドラッグ&ドロップで挿入できます。"
                  : "Write the English body in Markdown (optional). Empty = the Japanese body is shown."
              }
              spellCheck={false}
              style={{
                ...fieldStyle,
                border: "none",
                borderRight: `1px solid ${C.line}`,
                outline: dragOver ? `2px dashed ${C.accent}` : "none",
                outlineOffset: -8,
                minHeight: 560,
                padding: 20,
                resize: "vertical",
                fontFamily: FONTS.mono,
                fontSize: 14,
                lineHeight: 1.8,
              }}
            />
            <div style={{ padding: "20px 24px", background: C.bg, overflowX: "auto" }}>
              <div style={{ ...labelStyle, marginBottom: 16 }}>Preview — {lang === "ja" ? "日本語" : "English"}</div>
              {previewTitle ? (
                <h1 style={{ margin: "0 0 20px", fontFamily: FONTS.display, fontSize: 28, lineHeight: 1.3, fontWeight: 700 }}>
                  {previewTitle}
                </h1>
              ) : null}
              {body[lang].trim() ? (
                <NewsMarkdown source={body[lang]} />
              ) : (
                <p style={{ color: C.sub, fontSize: 14 }}>
                  {lang === "en" ? "No English body: the Japanese body will be shown on ?lang=en." : "本文がまだありません。"}
                </p>
              )}
            </div>
          </div>
          <div
            style={{
              borderTop: `1px solid ${C.line}`,
              padding: "10px 14px",
              fontFamily: FONTS.mono,
              fontSize: 11,
              color: C.sub,
              lineHeight: 1.9,
            }}
          >
            ## 見出し · **太字** · *斜体* · [テキスト](URL) · ![説明](画像URL) · - 箇条書き · 1. 番号付き · &gt; 引用 · --- 区切り線 · | 表 | も使えます
          </div>
        </section>

        {message ? (
          <p role="alert" style={{ margin: 0, color: C.accent, fontSize: 14, fontWeight: 700 }}>
            {message}
          </p>
        ) : null}

        <div className="mob-flex-wrap" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button type="button" style={actionButton(true, busy)} disabled={busy} onClick={() => save(true)}>
            {saving ? "保存中…" : isEdit && published ? "更新して公開" : "公開する"}
          </button>
          <button type="button" style={actionButton(false, busy)} disabled={busy} onClick={() => save(false)}>
            {isEdit && published ? "非公開（下書き）に戻す" : "下書き保存"}
          </button>
          <span style={{ flex: 1 }} />
          {isEdit ? (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              style={{ ...toolButton, color: C.sub, padding: "12px 16px" }}
            >
              削除
            </button>
          ) : null}
        </div>
      </div>
    </main>
  );
}
