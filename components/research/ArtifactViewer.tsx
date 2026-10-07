"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { C, FONTS } from "@/lib/theme";
import type { ArtifactVisibility, ResearchArtifactMeta } from "@/lib/research-types";
import { Button, ButtonLink, CopyButton, InlineError, SourceBadge, TwoStepDelete, VisibilityBadge, fieldStyle, monoSmall } from "@/components/research/ui";
import { formatBytes } from "@/lib/research-format";
import { rawArtifactHref, versionedArtifactHref } from "@/lib/research-url";
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

const actionLink: React.CSSProperties = {
  fontFamily: FONTS.mono,
  fontSize: 11,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: C.ink,
  textDecoration: "none",
  border: `1px solid ${C.line}`,
  padding: "8px 12px",
  whiteSpace: "nowrap",
};

/** Three horizontal dots, drawn so they stay crisp at any zoom. */
function Dots() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
      <circle cx="4" cy="10" r="2" fill="currentColor" />
      <circle cx="10" cy="10" r="2" fill="currentColor" />
      <circle cx="16" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}

/**
 * Full-viewport artifact viewer. No header or toolbar: everything about the
 * artifact (properties, download, open, copy URL, and member actions) lives in
 * a panel behind a round ⋯ button at the bottom right, shown only while the
 * pointer is over it (tap to toggle on touch screens, Enter from the keyboard).
 */
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

  // Panel visibility: hover (mouse), pinned (tap / click / keyboard), or held
  // open while a form control inside is in use.
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [selectActive, setSelectActive] = useState(false);
  const leaveTimer = useRef<number | null>(null);
  const fabRef = useRef<HTMLDivElement>(null);
  const open = hover || pinned || editing || selectActive;

  // Open HTML / download use the plain URL; the frame uses the content-addressed
  // one so browsers and the CDN can keep it.
  const rawHref = rawArtifactHref(artifact.id);
  const frameSrc = versionedArtifactHref(artifact.id, artifact.sha256);
  const canDelete = canManage;

  // The frame may finish loading before React hydrates, and a missed iframe
  // `load` is never replayed, so the loading hint also times out by itself.
  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!pinned) return;
    function onPointerDown(e: PointerEvent) {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) setPinned(false);
    }
    // Clicking into the iframe doesn't reach this document; it blurs the window instead.
    function onBlur() {
      setPinned(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("blur", onBlur);
    };
  }, [pinned]);

  useEffect(() => () => { if (leaveTimer.current) window.clearTimeout(leaveTimer.current); }, []);

  function onPointerEnter(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    setHover(true);
  }

  function onPointerLeave(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    // A short grace period so a slightly wobbly path from the button to the panel doesn't close it.
    leaveTimer.current = window.setTimeout(() => setHover(false), 180);
  }

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

  function cancelEdit() {
    setEditing(false);
    setDraftTitle(title);
    setDraftDescription(description);
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

  const meta = [anonymous ? null : (artifact.ownerName ?? "—"), formatDate(artifact.updatedAt), anonymous ? null : formatBytes(artifact.sizeBytes)]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="rs-viewer" style={{ position: "relative", height: "100vh", width: "100%" }}>
      {/* Always visible: the artifact must never wait for hydration to appear. */}
      <iframe
        src={frameSrc}
        title={title}
        sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads"
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        style={{ position: "relative", display: "block", width: "100%", height: "100%", border: 0, background: "#fff" }}
      />
      {/* Small hint that fades by itself (CSS) even if JS never runs. */}
      {!loaded ? (
        <div className="rs-veil" aria-hidden>
          {copy.common.loading}
        </div>
      ) : null}

      <div
        ref={fabRef}
        className="rs-fab"
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onKeyDown={(e) => {
          if (e.key === "Escape" && !editing) setPinned(false);
        }}
      >
        <button
          type="button"
          className="rs-fab-btn"
          aria-label={t.details}
          aria-expanded={open}
          aria-controls="rs-fab-panel"
          onClick={() => setPinned((p) => !p)}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: open ? C.ink : C.card,
            color: open ? C.bg : C.ink,
            border: `1.5px solid ${C.ink}`,
            boxShadow: "0 4px 14px rgba(28, 14, 2, 0.22)",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <Dots />
        </button>
        {/* paddingBottom bridges the gap so the pointer can travel from the button to the panel. */}
        <div
          id="rs-fab-panel"
          className="rs-fab-menu"
          data-open={open ? "true" : undefined}
          aria-hidden={!open}
          style={{ position: "absolute", right: 0, bottom: "100%", paddingBottom: 12 }}
        >
          <div
            className="rs-fab-panel"
            style={{
              background: C.bg,
              border: `1.5px solid ${C.ink}`,
              boxShadow: "0 12px 32px rgba(28, 14, 2, 0.18)",
              padding: 18,
              display: "grid",
              gap: 14,
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Link href="/research" style={{ textDecoration: "none", color: C.ink, fontFamily: FONTS.display, fontWeight: 700, fontSize: 14, letterSpacing: -0.2, whiteSpace: "nowrap" }}>
                Bakerization<span style={{ color: C.accent }}> / </span>Research
              </Link>
              <LanguageSwitcher locale={locale} />
            </div>

            {project ? (
              <ButtonLink href={`/research/p/${project.slug}`} size="sm" aria-label={t.backTo(project.name)} style={{ justifySelf: "start", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>
                ← {project.name}
              </ButtonLink>
            ) : null}

            {editing ? (
              <div style={{ display: "grid", gap: 8 }}>
                <input
                  style={{ ...fieldStyle, padding: "8px 10px" }}
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  maxLength={200}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); void save(); }
                    if (e.key === "Escape") cancelEdit();
                  }}
                  aria-label={copy.common.title}
                />
                <textarea
                  style={{ ...fieldStyle, padding: "8px 10px", minHeight: 72, resize: "vertical" }}
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  maxLength={2000}
                  placeholder={t.descriptionPlaceholder}
                  aria-label={copy.common.description}
                />
                <div style={{ display: "flex", gap: 6 }}>
                  <Button size="sm" variant="accent" busy={saving} onClick={() => void save()}>{copy.common.save}</Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>{copy.common.cancel}</Button>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 6, minWidth: 0 }}>
                <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 18, lineHeight: 1.35, letterSpacing: -0.4, fontWeight: 700, overflowWrap: "anywhere" }}>{title}</h1>
                {description ? <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: C.sub, overflowWrap: "anywhere" }}>{description}</p> : null}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 10px" }}>
                  {!anonymous ? <SourceBadge source={artifact.source} /> : null}
                  {!anonymous ? <VisibilityBadge visibility={visibility} /> : null}
                  <span style={{ ...monoSmall, textTransform: "none", letterSpacing: "0.1em" }}>{meta}</span>
                </div>
              </div>
            )}

            {error ? <InlineError onClose={() => setError("")}>{error}</InlineError> : null}

            {!editing ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                <a href={`${rawHref}?download=1`} style={actionLink}>{t.download}</a>
                <a href={rawHref} target="_blank" rel="noopener" style={actionLink}>{t.openHtml}</a>
                <CopyButton text={viewerUrl} label={t.copyUrl} />
              </div>
            ) : null}

            {!editing && !anonymous ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
                {canManage ? (
                  <select
                    aria-label={copy.visibility.label}
                    value={visibility}
                    disabled={visBusy}
                    onFocus={() => setSelectActive(true)}
                    onBlur={() => setSelectActive(false)}
                    onChange={(e) => void changeVisibility(e.target.value as ArtifactVisibility)}
                    style={{ ...fieldStyle, width: "auto", padding: "7px 10px", fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.12em", borderColor: visibility === "public" ? C.accent : C.fieldBorder }}
                  >
                    <option value="members">{copy.visibility.membersOption}</option>
                    <option value="public">{copy.visibility.publicOption}</option>
                  </select>
                ) : null}
                <Button size="sm" onClick={() => setEditing(true)}>{t.rename}</Button>
                {canDelete ? <TwoStepDelete busy={saving} onConfirm={remove} /> : null}
              </div>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  );
}
