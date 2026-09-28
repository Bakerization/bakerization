"use client";

import { useRef, useState } from "react";
import { C, FONTS } from "@/lib/theme";
import type { ResearchArtifactMeta } from "@/lib/research-types";
import { Button, Field, InlineError, Panel, fieldStyle } from "@/components/research/ui";

const MAX_CLIENT_BYTES = 5 * 1024 * 1024;

type Props = {
  projectSlug: string;
  onUploaded: (artifact: ResearchArtifactMeta) => void;
  onClose: () => void;
};

function titleFromHtml(html: string, fileName: string) {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html"); // never executes scripts
    const t = doc.title?.trim();
    if (t) return t.slice(0, 200);
  } catch {
    /* ignore */
  }
  return fileName.replace(/\.html?$/i, "").slice(0, 200);
}

export default function UploadPanel({ projectSlug, onUploaded, onClose }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState("");
  const [fileName, setFileName] = useState("");
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function applyHtml(next: string, name: string) {
    setHtml(next);
    setFileName(name);
    if (!titleTouched) setTitle(titleFromHtml(next, name));
  }

  async function takeFile(file: File | undefined) {
    if (!file) return;
    setError("");
    const lower = file.name.toLowerCase();
    if (!(lower.endsWith(".html") || lower.endsWith(".htm") || file.type === "text/html")) {
      setError(".html ファイルのみ対応しています。");
      return;
    }
    if (file.size > MAX_CLIENT_BYTES) {
      setError("ファイルが大きすぎます（上限 5MB）。");
      return;
    }
    applyHtml(await file.text(), file.name);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!html.trim()) {
      setError("HTMLが空です。");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/research/artifacts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectSlug, title: title.trim(), description: description.trim(), html }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? String(res.status));
      }
      const { artifact } = (await res.json()) as { artifact: ResearchArtifactMeta };
      onUploaded(artifact);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg.includes("exceeds") ? "ファイルが大きすぎます（上限 2MB）。" : "アップロードに失敗しました。");
      setBusy(false);
    }
  }

  return (
    <Panel strong style={{ marginBottom: 24 }}>
      <form onSubmit={submit}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 20, letterSpacing: -0.4 }}>HTMLをアップロード</h2>
          <Button size="sm" variant="ghost" onClick={onClose} disabled={busy}>閉じる ✕</Button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); void takeFile(e.dataTransfer.files?.[0]); }}
          onClick={() => fileInput.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInput.current?.click(); }}
          style={{
            border: `1.5px dashed ${dragOver ? C.accent : C.line}`,
            background: dragOver ? C.paper : "transparent",
            padding: "26px 16px",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: 18,
            fontFamily: FONTS.mono,
            fontSize: 12,
            letterSpacing: "0.12em",
            color: C.sub,
          }}
        >
          {fileName ? `選択中: ${fileName}` : "ファイルを選択、またはここにドロップ（.html）"}
          <input
            ref={fileInput}
            type="file"
            accept=".html,.htm,text/html"
            style={{ display: "none" }}
            onChange={(e) => void takeFile(e.target.files?.[0])}
          />
        </div>

        <Field label="またはHTMLを貼り付け">
          <textarea
            style={{ ...fieldStyle, minHeight: 120, resize: "vertical", fontFamily: FONTS.mono, fontSize: 12 }}
            value={html}
            onChange={(e) => applyHtml(e.target.value, fileName)}
            placeholder="<!doctype html> …"
            spellCheck={false}
          />
        </Field>

        <div className="mob-1col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="タイトル" required>
            <input style={fieldStyle} value={title} onChange={(e) => { setTitle(e.target.value); setTitleTouched(true); }} maxLength={200} required />
          </Field>
          <Field label="説明（任意）">
            <input style={fieldStyle} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
          </Field>
        </div>

        <InlineError onClose={() => setError("")}>{error}</InlineError>
        <div style={{ display: "flex", gap: 10 }}>
          <Button type="submit" variant="accent" busy={busy}>{busy ? "アップロード中…" : "アップロード →"}</Button>
          <Button variant="ghost" onClick={onClose} disabled={busy}>キャンセル</Button>
        </div>
      </form>
    </Panel>
  );
}
