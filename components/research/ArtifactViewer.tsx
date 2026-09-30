"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { C, FONTS } from "@/lib/theme";
import type { ResearchArtifactMeta, ResearchProject } from "@/lib/research-types";
import { Button, ButtonLink, CopyButton, InlineError, SourceBadge, TwoStepDelete, fieldStyle } from "@/components/research/ui";
import { formatBytes, formatDate } from "@/lib/research-format";

type Props = { artifact: ResearchArtifactMeta; project: ResearchProject; canDelete: boolean; viewerUrl: string };

export default function ArtifactViewer({ artifact, project, canDelete, viewerUrl }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(artifact.title);
  const [description, setDescription] = useState(artifact.description);
  const [draftTitle, setDraftTitle] = useState(artifact.title);
  const [draftDescription, setDraftDescription] = useState(artifact.description);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const rawHref = `/research/raw/${artifact.id}`;

  async function save() {
    if (!draftTitle.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/research/artifacts/${artifact.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: draftTitle.trim(), description: draftDescription.trim() }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("保存に失敗しました。");
      return;
    }
    setTitle(draftTitle.trim());
    setDescription(draftDescription.trim());
    setEditing(false);
  }

  async function remove() {
    setSaving(true);
    const res = await fetch(`/api/research/artifacts/${artifact.id}`, { method: "DELETE" });
    if (!res.ok) {
      setSaving(false);
      setError("削除に失敗しました。");
      return;
    }
    router.push(`/research/p/${project.slug}`);
    router.refresh();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>
      <div
        className="mob-pad mob-flex-wrap"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "10px 24px",
          borderBottom: `1px solid ${C.line}`,
          background: C.bg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
          <ButtonLink href={`/research/p/${project.slug}`} size="sm">← {project.name}</ButtonLink>
          {editing ? (
            <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 240, flexWrap: "wrap" }}>
              <input
                style={{ ...fieldStyle, padding: "8px 10px", flex: 1, minWidth: 200 }}
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                maxLength={200}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); void save(); }
                  if (e.key === "Escape") { setEditing(false); setDraftTitle(title); setDraftDescription(description); }
                }}
                aria-label="タイトル"
              />
              <input
                style={{ ...fieldStyle, padding: "8px 10px", flex: 2, minWidth: 200 }}
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                maxLength={2000}
                placeholder="説明を追加…"
                aria-label="説明"
              />
              <Button size="sm" variant="accent" busy={saving} onClick={() => void save()}>保存</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setDraftTitle(title); setDraftDescription(description); }}>キャンセル</Button>
            </div>
          ) : (
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 18, letterSpacing: -0.4, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h1>
                <SourceBadge source={artifact.source} />
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.12em", color: C.sub, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {description ? `${description} · ` : ""}
                {artifact.ownerName ?? "—"} · {formatDate(artifact.updatedAt)} · {formatBytes(artifact.sizeBytes)}
              </div>
            </div>
          )}
        </div>
        {!editing ? (
          <div className="mob-flex-wrap" style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Button size="sm" onClick={() => setEditing(true)}>名前変更</Button>
            <a href={rawHref} target="_blank" rel="noopener" style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C.ink, textDecoration: "none", border: `1px solid ${C.line}`, padding: "8px 12px" }}>
              HTMLを開く ↗
            </a>
            <a href={`${rawHref}?download=1`} style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C.ink, textDecoration: "none", border: `1px solid ${C.line}`, padding: "8px 12px" }}>
              ダウンロード
            </a>
            <CopyButton text={viewerUrl} label="URLをコピー" />
            {canDelete ? <TwoStepDelete busy={saving} onConfirm={remove} /> : null}
          </div>
        ) : null}
      </div>
      {error ? (
        <div className="mob-pad" style={{ padding: "0 24px" }}>
          <InlineError onClose={() => setError("")}>{error}</InlineError>
        </div>
      ) : null}
      <div style={{ position: "relative", flex: 1, minHeight: 0, margin: 0, width: "100%" }}>
        {!loaded ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.28em", color: C.sub }}>
            読み込み中…
          </div>
        ) : null}
        <iframe
          src={rawHref}
          title={title}
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          style={{ position: "relative", display: "block", width: "100%", height: "100%", border: 0, borderTop: `1px solid ${C.line}`, background: "#fff", opacity: loaded ? 1 : 0, transition: "opacity .2s" }}
        />
      </div>
    </div>
  );
}
