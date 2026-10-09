"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { C, FONTS } from "@/lib/theme";
import { useResearchI18n } from "@/components/research/ResearchI18n";
import { Button, buttonStyle, labelStyle, monoSmall, type ButtonSize } from "@/components/research/ui-static";

// Interactive / translated primitives for /research. The hook-free ones live
// in ui-static.tsx (server pages import from there) and are re-exported here
// so client components keep a single import.
export {
  Button,
  ButtonLink,
  Kicker,
  PageFrame,
  Panel,
  SectionRule,
  SourceBadge,
  buttonStyle,
  fieldStyle,
  labelStyle,
  monoSmall,
} from "@/components/research/ui-static";

export function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: ReactNode }) {
  const { t } = useResearchI18n();
  return (
    <label style={{ display: "block", marginBottom: 18 }}>
      <span style={labelStyle}>
        ▎{label}
        {required ? <span style={{ color: C.accent, marginLeft: 8 }}>{t.common.required}</span> : null}
      </span>
      {children}
      {hint ? <span style={{ display: "block", marginTop: 6, fontSize: 12, color: C.sub }}>{hint}</span> : null}
    </label>
  );
}

export function InlineError({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  const { t } = useResearchI18n();
  if (!children) return null;
  return (
    <p
      role="alert"
      style={{
        fontFamily: FONTS.mono,
        fontSize: 12,
        letterSpacing: "0.12em",
        color: C.alert,
        margin: "12px 0",
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <span>▲ {children}</span>
      {onClose ? (
        <button type="button" onClick={onClose} style={{ ...buttonStyle("ghost", "sm"), padding: "2px 6px" }}>
          {t.common.close}
        </button>
      ) : null}
    </p>
  );
}

/** Two-step delete: first click arms, second confirms, auto-disarms after 4 s. No confirm() dialogs. */
export function TwoStepDelete({
  label,
  confirmLabel,
  onConfirm,
  busy,
  size = "sm",
}: {
  label?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  busy?: boolean;
  size?: ButtonSize;
}) {
  const { t } = useResearchI18n();
  const [armed, setArmed] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  if (!armed) {
    return (
      <Button
        variant="danger"
        size={size}
        busy={busy}
        onClick={() => {
          setArmed(true);
          timer.current = window.setTimeout(() => setArmed(false), 4000);
        }}
      >
        {label ?? t.common.delete}
      </Button>
    );
  }
  return (
    <span style={{ display: "inline-flex", gap: 6 }}>
      <Button
        variant="accent"
        size={size}
        busy={busy}
        onClick={async () => {
          if (timer.current) window.clearTimeout(timer.current);
          await onConfirm();
          setArmed(false);
        }}
      >
        {confirmLabel ?? t.common.confirmDelete}
      </Button>
      <Button variant="ghost" size={size} onClick={() => setArmed(false)}>
        {t.common.cancel}
      </Button>
    </span>
  );
}

export function CopyButton({ text, label, size = "sm" }: { text: string; label?: string; size?: ButtonSize }) {
  const { t } = useResearchI18n();
  const [done, setDone] = useState(false);
  return (
    <Button
      size={size}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {done ? t.common.copied : (label ?? t.common.copy)}
    </Button>
  );
}

export function CopyBlock({ text, label }: { text: string; label?: string }) {
  return (
    <div style={{ position: "relative", margin: "8px 0 16px" }}>
      {label ? <div style={{ ...monoSmall, marginBottom: 6 }}>{label}</div> : null}
      <pre
        style={{
          margin: 0,
          background: C.paper,
          border: `1px solid ${C.line}`,
          padding: "14px 96px 14px 14px",
          fontFamily: FONTS.mono,
          fontSize: 12,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          color: C.ink,
        }}
      >
        {text}
      </pre>
      <div style={{ position: "absolute", top: label ? 26 : 8, right: 8 }}>
        <CopyButton text={text} />
      </div>
    </div>
  );
}

export function VisibilityBadge({ visibility }: { visibility: "members" | "public" }) {
  const { t } = useResearchI18n();
  const isPublic = visibility === "public";
  return (
    <span
      title={isPublic ? t.visibility.publicTitle : t.visibility.membersTitle}
      style={{
        display: "inline-block",
        fontFamily: FONTS.mono,
        fontSize: 10,
        letterSpacing: "0.18em",
        padding: "3px 7px",
        background: isPublic ? C.accent : "transparent",
        border: `1px solid ${isPublic ? C.accent : C.line}`,
        color: isPublic ? C.bg : C.sub,
      }}
    >
      {isPublic ? "PUBLIC" : "MEMBERS"}
    </span>
  );
}
