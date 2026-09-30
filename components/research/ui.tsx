"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { C, FONTS } from "@/lib/theme";

// Shared primitives for /research, styled from the site's C / FONTS tokens.

export const fieldStyle: CSSProperties = {
  width: "100%",
  background: C.fieldBg,
  color: C.ink,
  border: `1.5px solid ${C.fieldBorder}`,
  padding: "12px 14px",
  fontFamily: FONTS.body,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

export const labelStyle: CSSProperties = {
  display: "block",
  fontFamily: FONTS.mono,
  fontSize: 11,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: C.sub,
  marginBottom: 8,
};

export const monoSmall: CSSProperties = {
  fontFamily: FONTS.mono,
  fontSize: 11,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: C.sub,
};

export function Kicker({ children, tone = "accent", style }: { children: ReactNode; tone?: "accent" | "sub"; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: FONTS.mono,
        fontSize: 11,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: tone === "accent" ? C.accent : C.sub,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionRule({ left, right }: { left: ReactNode; right?: ReactNode }) {
  return (
    <div
      className="mob-flex-wrap"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        borderTop: `1px solid ${C.line}`,
        borderBottom: `1px solid ${C.line}`,
        padding: "14px 0",
        marginBottom: 28,
      }}
    >
      <Kicker>{left}</Kicker>
      {right ? <Kicker tone="sub">{right}</Kicker> : null}
    </div>
  );
}

export function PageFrame({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="mob-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 64px 96px", ...style }}>
      {children}
    </div>
  );
}

export function Panel({ children, strong, pad = 24, style }: { children: ReactNode; strong?: boolean; pad?: number; style?: CSSProperties }) {
  return (
    <div style={{ background: C.card, border: `1.5px solid ${strong ? C.ink : C.line}`, padding: pad, ...style }}>{children}</div>
  );
}

type Variant = "accent" | "outline" | "ghost" | "danger";
type Size = "sm" | "md";

export function buttonStyle(variant: Variant = "outline", size: Size = "md", disabled?: boolean): CSSProperties {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    textDecoration: "none",
    lineHeight: 1,
    whiteSpace: "nowrap",
    borderRadius: 0,
  };
  const sizing: CSSProperties =
    size === "sm"
      ? { padding: "8px 12px", fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase" }
      : { padding: "12px 18px", fontFamily: FONTS.body, fontSize: 14, fontWeight: 700, letterSpacing: 0.3 };
  const look: CSSProperties =
    variant === "accent"
      ? { background: C.accent, color: C.bg, border: `1.5px solid ${C.accent}` }
      : variant === "danger"
        ? { background: "transparent", color: C.accent, border: `1px solid ${C.accent}` }
        : variant === "ghost"
          ? { background: "transparent", color: C.sub, border: "1px solid transparent" }
          : { background: "transparent", color: C.ink, border: `1px solid ${C.line}` };
  return { ...base, ...sizing, ...look };
}

export function Button({
  variant = "outline",
  size = "md",
  busy,
  children,
  style,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; busy?: boolean }) {
  const isDisabled = disabled || busy;
  return (
    <button
      type="button"
      {...rest}
      disabled={isDisabled}
      style={{ ...buttonStyle(variant, size, isDisabled), cursor: busy ? "wait" : undefined, ...style }}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "outline",
  size = "md",
  children,
  style,
  ...rest
}: { href: string; variant?: Variant; size?: Size; children: ReactNode; style?: CSSProperties } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "style"
>) {
  return (
    <Link href={href} style={{ ...buttonStyle(variant, size), ...style }} {...rest}>
      {children}
    </Link>
  );
}

export function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 18 }}>
      <span style={labelStyle}>
        ▎{label}
        {required ? <span style={{ color: C.accent, marginLeft: 8 }}>必須</span> : null}
      </span>
      {children}
      {hint ? <span style={{ display: "block", marginTop: 6, fontSize: 12, color: C.sub }}>{hint}</span> : null}
    </label>
  );
}

export function InlineError({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      style={{
        fontFamily: FONTS.mono,
        fontSize: 12,
        letterSpacing: "0.12em",
        color: C.accent,
        margin: "12px 0",
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <span>▲ {children}</span>
      {onClose ? (
        <button type="button" onClick={onClose} style={{ ...buttonStyle("ghost", "sm"), padding: "2px 6px" }}>
          閉じる
        </button>
      ) : null}
    </p>
  );
}

/** Two-step delete: first click arms, second confirms, auto-disarms after 4 s. No confirm() dialogs. */
export function TwoStepDelete({
  label = "削除",
  confirmLabel = "本当に削除する",
  onConfirm,
  busy,
  size = "sm",
}: {
  label?: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  busy?: boolean;
  size?: Size;
}) {
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
        {label}
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
        {confirmLabel}
      </Button>
      <Button variant="ghost" size={size} onClick={() => setArmed(false)}>
        キャンセル
      </Button>
    </span>
  );
}

export function CopyButton({ text, label = "コピー", size = "sm" }: { text: string; label?: string; size?: Size }) {
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
      {done ? "コピーしました" : label}
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

export function SourceBadge({ source }: { source: "mcp" | "api" | "web" }) {
  const label = source === "mcp" ? "MCP" : source === "api" ? "API" : "WEB";
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: FONTS.mono,
        fontSize: 10,
        letterSpacing: "0.18em",
        padding: "3px 7px",
        border: `1px solid ${source === "mcp" ? C.accent : C.line}`,
        color: source === "mcp" ? C.accent : C.sub,
      }}
    >
      {label}
    </span>
  );
}
