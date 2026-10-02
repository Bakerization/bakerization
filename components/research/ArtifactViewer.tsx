"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { C, FONTS } from "@/lib/theme";
import type { ArtifactVisibility, ResearchArtifactMeta } from "@/lib/research-types";
import { Button, ButtonLink, CopyButton, InlineError, SourceBadge, TwoStepDelete, VisibilityBadge, fieldStyle } from "@/components/research/ui";
import { formatBytes } from "@/lib/research-format";
import { useResearchI18n } from "@/components/research/ResearchI18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type Props = {
  artifact: ResearchArtifactMeta;
  /** Where "←" leads; null only if the project couldn't be loaded. */
  project: { slug: string; name: string } | null;
  /** owner or admin: may delete and change visibility */
  canManage: boolean;
  anonymous: boolean;
  viewerUrl: string;
};

export default function ArtifactViewer({ artifact, project, canManage, anonymous, viewerUrl }: Props) {
  const router = useRouter();
  const { t: copy, formatDate, locale } = useResearchI18n();
  const t = copy.viewer;
  const [title, setTitle] = useState(artifact.title);
  const [description, setDescription] = useState(artifact.description);
  const [draftTitle, setDraftTitle] = useState(artifact.title);
  const [draftDescription, setDraftDescription] = useState(artifact.description);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [visibility, setVisibility] = useState<ArtifactVisibility>(artifact.visibility);
  const [visBusy, setVisBusy] = useState(false);
  /** mobile only: the toolbar folds to one row; this reveals meta + actions */
  const [open, setOpen] = useState(false);
  const rawHref = `/research/raw/${artifact.id}`;
  const canDelete = canManage;

  async function changeVisibility(next: ArtifactVisibility) {
    if (next === visibility) return;
    setVisBusy(true);
    setError("");
    const res = await fetch(`/api/research/artifacts/${artifact.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visibility: next }),
    });
    setVisBusy(false);
    if (!res.ok) {
      setError(copy.visibility.changeFailed);
      return;
    }
    setVisibility(next);
  }

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
      setError(t.saveFailed);
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
      setError(t.deleteFailed);
      return;
    }
    router.push(project ? `/research/p/${project.slug}` : "/research");
    router.refresh();
  }

  return (
    <div className="rs-viewer" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>
      <div
        className="mob-pad mob-flex-wrap rs-vbar"
        data-open={open ? "true" : undefined}
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
        <div className="rs-vbar-main" style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
          {project ? (
            <ButtonLink href={`/research/p/${project.slug}`} size="sm" aria-label={t.backTo(project.name)} style={{ flexShrink: 0 }}>
              ←<span className="mob-hide"> {project.name}</span>
            </ButtonLink>
          ) : (
            <ButtonLink href="/research" size="sm" aria-label={t.backHome} style={{ flexShrink: 0 }}>
              ←<span className="mob-hide"> Research</span>
            </ButtonLink>
          )}
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
                aria-label={copy.common.title}
              />
              <input
                style={{ ...fieldStyle, padding: "8px 10px", flex: 2, minWidth: 200 }}
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
                maxLength={2000}
                placeholder={t.descriptionPlaceholder}
                aria-label={copy.common.description}
              />
              <Button size="sm" variant="accent" busy={saving} onClick={() => void save()}>{copy.common.save}</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setDraftTitle(title); setDraftDescription(description); }}>{copy.common.cancel}</Button>
            </div>
          ) : (
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 18, letterSpacing: -0.4, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h1>
                <span className="rs-vbar-extra" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  {!anonymous ? <SourceBadge source={artifact.source} /> : null}
                  {!anonymous ? <VisibilityBadge visibility={visibility} /> : null}
                </span>
              </div>
              <div className="rs-vbar-extra" style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.12em", color: C.sub, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {description ? `${description} · ` : ""}
                {anonymous ? "Bakerization Research" : (artifact.ownerName ?? "—")} · {formatDate(artifact.updatedAt)}
                {anonymous ? "" : ` · ${formatBytes(artifact.sizeBytes)}`}
              </div>
            </div>
          )}
          {!editing ? (
            <Button
              size="sm"
              className="mob-only"
              aria-expanded={open}
              aria-label={t.details}
              onClick={() => setOpen((o) => !o)}
              style={{ marginLeft: "auto", flexShrink: 0 }}
            >
              {open ? "✕" : "⋯"}
            </Button>
          ) : null}
        </div>
        {!editing ? (
          <div className="mob-flex-wrap rs-vbar-extra rs-vbar-actions" style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {canManage ? (
              <select
                aria-label={copy.visibility.label}
                value={visibility}
                disabled={visBusy}
                onChange={(e) => void changeVisibility(e.target.value as ArtifactVisibility)}
                style={{ ...fieldStyle, width: "auto", padding: "7px 10px", fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.12em", borderColor: visibility === "public" ? C.accent : C.fieldBorder }}
              >
                <option value="members">{copy.visibility.membersOption}</option>
                <option value="public">{copy.visibility.publicOption}</option>
              </select>
            ) : null}
            {!anonymous ? <Button size="sm" onClick={() => setEditing(true)}>{t.rename}</Button> : null}
            <a href={rawHref} target="_blank" rel="noopener" style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C.ink, textDecoration: "none", border: `1px solid ${C.line}`, padding: "8px 12px" }}>
              {t.openHtml}
            </a>
            <a href={`${rawHref}?download=1`} style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C.ink, textDecoration: "none", border: `1px solid ${C.line}`, padding: "8px 12px" }}>
              {t.download}
            </a>
            <CopyButton text={viewerUrl} label={t.copyUrl} />
            {canDelete ? <TwoStepDelete busy={saving} onConfirm={remove} /> : null}
            {/* Phones hide the site header on this page, so the switcher lives in the ⋯ panel. */}
            <span className="mob-only">
              <LanguageSwitcher locale={locale} />
            </span>
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
            {copy.common.loading}
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
