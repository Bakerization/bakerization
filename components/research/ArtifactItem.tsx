"use client";

import Link from "next/link";
import { useState } from "react";
import { C, FONTS } from "@/lib/theme";
import type { ResearchArtifactMeta, ResearchProject } from "@/lib/research-types";
import { Button, InlineError, SourceBadge, TwoStepDelete, VisibilityBadge, fieldStyle } from "@/components/research/ui";
import { formatBytes } from "@/lib/research-format";
import { useResearchI18n } from "@/components/research/ResearchI18n";
import ArtifactThumb from "@/components/research/ArtifactThumb";
import type { HandleProps } from "@/components/research/SortableItem";

export type ItemActions = {
  onRename: (id: string, title: string, description: string) => Promise<boolean>;
  onMove: (id: string, projectSlug: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onSetVisibility: (id: string, visibility: "members" | "public") => Promise<boolean>;
};

type Props = {
  artifact: ResearchArtifactMeta;
  projects: ResearchProject[];
  currentProjectId: string;
  canDelete: boolean;
  busy: boolean;
  handle: HandleProps;
  actions: ItemActions;
  layout: "row" | "card";
};

function DragHandle({ handle }: { handle: HandleProps }) {
  const { t } = useResearchI18n();
  return (
    <button
      ref={handle.ref}
      type="button"
      aria-label={t.item.dragHandle}
      {...handle.attributes}
      {...handle.listeners}
      style={{
        touchAction: "none",
        cursor: handle.isDragging ? "grabbing" : "grab",
        background: C.paper,
        border: `1px solid ${C.line}`,
        color: C.sub,
        width: 28,
        height: 28,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONTS.mono,
        fontSize: 12,
        padding: 0,
        flexShrink: 0,
      }}
    >
      ⋮⋮
    </button>
  );
}

export default function ArtifactItem({ artifact, projects, currentProjectId, canDelete, busy, handle, actions, layout }: Props) {
  const { t: copy, formatDate } = useResearchI18n();
  const t = copy.item;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(artifact.title);
  const [description, setDescription] = useState(artifact.description);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState("");
  const viewerHref = `/research/a/${artifact.id}`;
  const others = projects.filter((p) => p.id !== currentProjectId);

  async function saveRename() {
    if (!title.trim()) return;
    setError("");
    const ok = await actions.onRename(artifact.id, title.trim(), description.trim());
    if (ok) setEditing(false);
    else setError(t.updateFailed);
  }

  const meta = (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", alignItems: "center", fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.12em", color: C.sub }}>
      <SourceBadge source={artifact.source} />
      <VisibilityBadge visibility={artifact.visibility} />
      <span>{artifact.ownerName ?? "—"}</span>
      <span>{formatDate(artifact.updatedAt)}</span>
      <span>{formatBytes(artifact.sizeBytes)}</span>
    </div>
  );

  const titleBlock = editing ? (
    <div style={{ display: "grid", gap: 8 }}>
      <input
        style={{ ...fieldStyle, padding: "8px 10px" }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); void saveRename(); }
          if (e.key === "Escape") { setEditing(false); setTitle(artifact.title); setDescription(artifact.description); }
        }}
      />
      <textarea
        style={{ ...fieldStyle, padding: "8px 10px", minHeight: 56, resize: "vertical" }}
        placeholder={copy.common.descriptionOptional}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={2000}
      />
      <div style={{ display: "flex", gap: 6 }}>
        <Button size="sm" variant="accent" busy={busy} onClick={() => void saveRename()}>{copy.common.save}</Button>
        <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setTitle(artifact.title); setDescription(artifact.description); }}>{copy.common.cancel}</Button>
      </div>
    </div>
  ) : (
    <div style={{ minWidth: 0 }}>
      <Link href={viewerHref} style={{ color: C.ink, textDecoration: "none", fontWeight: 700, fontSize: 15, lineHeight: 1.4, display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
        {artifact.title}
      </Link>
      {artifact.description ? (
        <p style={{ margin: "4px 0 0", fontSize: 13, lineHeight: 1.6, color: C.sub, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {artifact.description}
        </p>
      ) : null}
    </div>
  );

  const actionsBlock = (
    <div className="mob-rs-actions" style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", justifyContent: layout === "row" ? "flex-end" : "flex-start" }}>
      <Link href={viewerHref} style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C.ink, textDecoration: "none", border: `1px solid ${C.line}`, padding: "8px 12px" }}>
        {t.open}
      </Link>
      {!editing ? <Button size="sm" onClick={() => setEditing(true)} disabled={busy}>{t.rename}</Button> : null}
      {others.length > 0 ? (
        moving ? (
          <select
            autoFocus
            defaultValue=""
            disabled={busy}
            onBlur={() => setMoving(false)}
            onChange={async (e) => {
              const slug = e.target.value;
              if (!slug) return;
              setError("");
              const ok = await actions.onMove(artifact.id, slug);
              if (!ok) setError(t.moveFailed);
              setMoving(false);
            }}
            style={{ ...fieldStyle, width: "auto", padding: "7px 10px", fontFamily: FONTS.mono, fontSize: 11 }}
          >
            <option value="">{t.moveTo}</option>
            {others.map((p) => (
              <option key={p.id} value={p.slug}>{p.name}</option>
            ))}
          </select>
        ) : (
          <Button size="sm" onClick={() => setMoving(true)} disabled={busy}>{t.move}</Button>
        )
      ) : null}
      {canDelete ? (
        <Button
          size="sm"
          disabled={busy}
          onClick={async () => {
            setError("");
            const next = artifact.visibility === "public" ? "members" : "public";
            const ok = await actions.onSetVisibility(artifact.id, next);
            if (!ok) setError(copy.visibility.changeFailed);
          }}
        >
          {artifact.visibility === "public" ? copy.visibility.makeMembers : copy.visibility.makePublic}
        </Button>
      ) : null}
      {canDelete ? (
        <TwoStepDelete
          busy={busy}
          onConfirm={async () => {
            setError("");
            const ok = await actions.onDelete(artifact.id);
            if (!ok) setError(t.deleteFailed);
          }}
        />
      ) : null}
    </div>
  );

  if (layout === "card") {
    return (
      <article style={{ background: C.card, border: `1.5px solid ${C.ink}`, display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ position: "relative" }}>
          <Link href={viewerHref} style={{ display: "block" }} tabIndex={-1} aria-hidden>
            <ArtifactThumb id={artifact.id} title={artifact.title} version={artifact.sha256} kicker={`▍/${artifact.projectSlug}`} fluid />
          </Link>
          <div style={{ position: "absolute", top: 8, right: 8 }}>
            <DragHandle handle={handle} />
          </div>
        </div>
        <div style={{ padding: 16, display: "grid", gap: 10, flex: 1 }}>
          {titleBlock}
          {meta}
          <InlineError onClose={() => setError("")}>{error}</InlineError>
          {actionsBlock}
        </div>
      </article>
    );
  }

  return (
    <article
      className="mob-rs-row"
      style={{
        display: "grid",
        gridTemplateColumns: "28px 160px minmax(0, 1fr) auto",
        gap: 16,
        alignItems: "center",
        background: C.card,
        border: `1.5px solid ${C.line}`,
        padding: 12,
      }}
    >
      <DragHandle handle={handle} />
      <Link href={viewerHref} tabIndex={-1} aria-hidden style={{ display: "block" }}>
        <ArtifactThumb id={artifact.id} title={artifact.title} version={artifact.sha256} width={160} height={100} />
      </Link>
      <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
        {titleBlock}
        {meta}
        <InlineError onClose={() => setError("")}>{error}</InlineError>
      </div>
      {actionsBlock}
    </article>
  );
}
