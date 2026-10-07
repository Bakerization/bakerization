import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { C, FONTS } from "@/lib/theme";

// Hook-free primitives for /research. No "use client" here on purpose: public
// pages render them as plain server output; client components import them too.
// Anything that needs useResearchI18n / state lives in ui.tsx.

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

export type ButtonVariant = "accent" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export function buttonStyle(variant: ButtonVariant = "outline", size: ButtonSize = "md", disabled?: boolean): CSSProperties {
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
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; busy?: boolean }) {
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
}: { href: string; variant?: ButtonVariant; size?: ButtonSize; children: ReactNode; style?: CSSProperties } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "style"
>) {
  return (
    <Link href={href} style={{ ...buttonStyle(variant, size), ...style }} {...rest}>
      {children}
    </Link>
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
