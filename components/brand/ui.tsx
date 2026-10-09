import Link from "next/link";
import Image from "next/image";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { C, FONTS } from "@/lib/theme";

// Brand-book primitives for the public site (Donut Inc. / Bakerization deck):
// green divider panels with yellow titles, quiet "Title / 日本語" headings,
// handwritten pull quotes, a yellow bar running in from the left edge, text
// set against a thin vertical rule, and full-bleed photos with white copy.
// Hook-free on purpose so server and client components can both use them.
// Mobile sizes live in globals.css under the brand-* classes. Subtitles are
// always Japanese (the deck's "English title / 日本語" pairing), in both locales.

/** Fixed site-header height (components/Navbar.tsx); pages pad their top by it. */
export const NAV_HEIGHT = 64;

export const labelText: CSSProperties = {
  fontFamily: FONTS.label,
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

/** Centered 1280px column with the site's side gutters. */
export function Inner({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`mob-pad${className ? ` ${className}` : ""}`}
      style={{ maxWidth: 1280, margin: "0 auto", padding: "0 64px", boxSizing: "border-box", ...style }}
    >
      {children}
    </div>
  );
}

/**
 * Section divider: a full-bleed green (or yellow) panel with a thin English
 * title, a "-　日本語" line and a page number in the bottom-left corner.
 */
export function SectionCover({
  title,
  sub,
  no,
  tone = "green",
  as: Tag = "h2",
  id,
  minHeight = 340,
  children,
}: {
  title: ReactNode;
  sub?: ReactNode;
  no?: string;
  tone?: "green" | "yellow";
  as?: ElementType;
  id?: string;
  minHeight?: number;
  children?: ReactNode;
}) {
  const green = tone === "green";
  const fg = green ? C.onSlab : C.onMain;
  return (
    <section
      id={id}
      className="brand-cover"
      style={{
        position: "relative",
        background: green ? C.slab : C.main,
        color: fg,
        minHeight,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Inner className="brand-cover-inner" style={{ width: "100%", padding: "88px 64px" }}>
        <Tag
          className="brand-cover-title"
          style={{
            margin: 0,
            fontFamily: FONTS.display,
            fontWeight: 300,
            fontSize: 88,
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            color: fg,
          }}
        >
          {title}
        </Tag>
        {sub ? (
          <p lang="ja" style={{ margin: "22px 0 0", display: "flex", gap: 18, fontSize: 15, lineHeight: 1.6, letterSpacing: "0.04em" }}>
            <span aria-hidden>-</span>
            <span>{sub}</span>
          </p>
        ) : null}
        {children}
      </Inner>
      {no ? (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: "max(20px, calc(50% - 616px))",
            bottom: 24,
            fontFamily: FONTS.label,
            fontSize: 15,
            letterSpacing: "0.04em",
            color: green ? C.onSlabSoft : C.onMain,
          }}
        >
          {no}
        </span>
      ) : null}
    </section>
  );
}

/** Content-page heading: "Colors" over a small "ブランドカラー". */
export function ContentHeading({
  title,
  sub,
  as: Tag = "h2",
  aside,
  style,
}: {
  title: ReactNode;
  sub?: ReactNode;
  as?: ElementType;
  aside?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      className="mob-stack"
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 24,
        marginBottom: 40,
        ...style,
      }}
    >
      <div>
        <Tag
          className="brand-heading"
          style={{
            margin: 0,
            fontFamily: FONTS.display,
            fontWeight: 400,
            fontSize: 40,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: C.ink,
          }}
        >
          {title}
        </Tag>
        {sub ? (
          <div lang="ja" style={{ marginTop: 8, fontSize: 12, letterSpacing: "0.06em", color: C.sub }}>
            {sub}
          </div>
        ) : null}
      </div>
      {aside}
    </div>
  );
}

/** Handwritten pull quote in green, set between “ and „ like the brand book. */
export function HandQuote({
  children,
  as: Tag = "p",
  size = 40,
  style,
}: {
  children: ReactNode;
  as?: ElementType;
  size?: number;
  style?: CSSProperties;
}) {
  const mark: CSSProperties = { fontFamily: FONTS.label, fontWeight: 500, color: C.ink };
  return (
    <Tag
      className="brand-hand"
      style={{
        margin: 0,
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        columnGap: "0.35em",
        fontFamily: FONTS.hand,
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1.55,
        letterSpacing: "0.08em",
        color: C.ink,
        ...style,
      }}
    >
      <span aria-hidden style={{ ...mark, fontSize: "0.8em", lineHeight: 1.2 }}>
        “
      </span>
      <span>
        {children}
        <span aria-hidden style={{ ...mark, fontSize: "0.8em", marginLeft: "0.4em", verticalAlign: "-0.15em" }}>
          „
        </span>
      </span>
    </Tag>
  );
}

/**
 * Yellow bar that runs in from the viewport's left edge and stops `reach`
 * of the way across the content column. Place it directly inside <Inner>.
 */
export function BrandBar({ reach = "62%", style }: { reach?: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      className="brand-bar"
      style={{
        height: 36,
        background: C.main,
        marginLeft: "calc(50% - 50vw)",
        width: `calc(50vw - 50% + ${reach})`,
        ...style,
      }}
    />
  );
}

/** Body copy set against a thin vertical rule. */
export function RuleText({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        borderLeft: `1px solid ${C.lineStrong}`,
        paddingLeft: 28,
        color: C.sub,
        fontSize: 16,
        lineHeight: 2,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export type BrandButtonVariant = "green" | "yellow" | "outline" | "outline-light";

export function brandButtonStyle(variant: BrandButtonVariant = "green"): CSSProperties {
  const look: CSSProperties =
    variant === "green"
      ? { background: C.slab, color: C.onSlab, border: `1.5px solid ${C.slab}` }
      : variant === "yellow"
        ? { background: C.main, color: C.onMain, border: `1.5px solid ${C.main}` }
        : variant === "outline-light"
          ? { background: "transparent", color: C.onSlabSoft, border: `1.5px solid ${C.onSlabSoft}` }
          : { background: "transparent", color: C.ink, border: `1.5px solid ${C.ink}` };
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "15px 28px",
    borderRadius: 999,
    fontFamily: FONTS.label,
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: "0.1em",
    lineHeight: 1.3,
    textDecoration: "none",
    cursor: "pointer",
    ...look,
  };
}

export function BrandButtonLink({
  href,
  variant = "green",
  arrow = true,
  children,
  style,
}: {
  href: string;
  variant?: BrandButtonVariant;
  arrow?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Link href={href} style={{ ...brandButtonStyle(variant), ...style }}>
      <span>{children}</span>
      {arrow ? <span aria-hidden>→</span> : null}
    </Link>
  );
}

/** Small uppercase text link ("VIEW ALL →", "← BACK"). */
export function TextLink({ href, children, style }: { href: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <Link href={href} style={{ ...labelText, color: C.ink, textDecoration: "none", whiteSpace: "nowrap", ...style }}>
      {children}
    </Link>
  );
}

/**
 * Full-bleed photograph with white copy over it (the deck's photo pages).
 * `src` is a prop so real photos can replace the placeholders later.
 */
export function PhotoSpread({
  src,
  alt = "",
  height = 560,
  children,
}: {
  src: string;
  alt?: string;
  height?: number;
  children?: ReactNode;
}) {
  return (
    <section className="brand-photo" style={{ position: "relative", height, overflow: "hidden", background: C.slab }}>
      <Image src={src} alt={alt} fill sizes="100vw" style={{ objectFit: "cover" }} />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(100deg, rgba(0,0,0,0) 35%, rgba(0,0,0,.42) 100%)",
        }}
      />
      {children ? (
        <Inner
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            paddingBottom: 64,
          }}
        >
          <div style={{ color: C.onSlabSoft, fontSize: 16, lineHeight: 2.2, letterSpacing: "0.06em", maxWidth: 440 }}>
            {children}
          </div>
        </Inner>
      ) : null}
    </section>
  );
}

/** Number in a circle — the deck's Experience diagram, used for 01 / 02 / 03. */
export function NumberDot({ n, tone = "yellow", size = 88 }: { n: string; tone?: "yellow" | "green"; size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: tone === "green" ? C.slab : C.main,
        color: tone === "green" ? C.onSlab : C.onMain,
        fontFamily: FONTS.label,
        fontSize: size * 0.3,
        fontWeight: 500,
        letterSpacing: "0.02em",
        flexShrink: 0,
      }}
    >
      {n}
    </span>
  );
}

/** Small in-card label led by a short yellow bar (replaces the old "▎Label"). */
export function SubLabel({ children, tone = "ink", style }: { children: ReactNode; tone?: "ink" | "light"; style?: CSSProperties }) {
  return (
    <div
      style={{
        ...labelText,
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: tone === "light" ? C.onSlab : C.ink,
        marginBottom: 16,
        ...style,
      }}
    >
      <span aria-hidden style={{ width: 18, height: 6, background: C.main, flexShrink: 0 }} />
      <span>{children}</span>
    </div>
  );
}
