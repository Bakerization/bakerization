/**
 * Theme tokens — single source of truth for inline styles.
 * The actual color values live in app/globals.css under :root / body.theme-*.
 * Use these as `style={{ background: C.bg }}` so the page reacts to the
 * <body className="theme-dark|theme-light"> switch without reload.
 */

export const C = {
  bg: "var(--bg)",
  paper: "var(--paper)",
  card: "var(--card)",
  ink: "var(--ink)",
  sub: "var(--sub)",
  line: "var(--line)",
  rule: "var(--rule)",
  accent: "var(--accent)",
  slab: "var(--slab)",
  onSlab: "var(--on-slab)",
  fieldBg: "var(--field-bg)",
  fieldBorder: "var(--field-border)",
} as const;

export const FONTS = {
  display:
    'var(--font-display), var(--font-body), system-ui, sans-serif',
  body: 'var(--font-body), system-ui, sans-serif',
  mono: 'var(--font-mono), ui-monospace, monospace',
} as const;

export type ThemeMode = "dark" | "light";

export const THEME_COOKIE = "theme";
export const DEFAULT_THEME: ThemeMode = "dark";

export function normalizeTheme(value: string | null | undefined): ThemeMode {
  return value === "light" ? "light" : "dark";
}
