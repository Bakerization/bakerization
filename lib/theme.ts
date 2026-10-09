/**
 * Theme tokens — single source of truth for inline styles.
 * The actual color values live in app/globals.css under :root.
 * Use these as `style={{ background: C.bg }}`.
 */

export const C = {
  bg: "var(--bg)",
  paper: "var(--paper)",
  card: "var(--card)",
  ink: "var(--ink)",
  sub: "var(--sub)",
  line: "var(--line)",
  lineStrong: "var(--line-strong)",
  rule: "var(--rule)",
  accent: "var(--accent)",
  slab: "var(--slab)",
  onSlab: "var(--on-slab)",
  onSlabSoft: "var(--on-slab-soft)",
  main: "var(--main)",
  onMain: "var(--on-main)",
  alert: "var(--alert)",
  fieldBg: "var(--field-bg)",
  fieldBorder: "var(--field-border)",
} as const;

export const FONTS = {
  display:
    'var(--font-display), var(--font-body), system-ui, sans-serif',
  body: 'var(--font-body), system-ui, sans-serif',
  mono: 'var(--font-mono), ui-monospace, monospace',
  // Futura first (macOS / iOS ship it); Jost is the free Futura-like fallback.
  label: 'Futura, "Futura PT", var(--font-label), var(--font-body), sans-serif',
  // Handwritten Japanese for pull quotes (the brand book's azuki-style pen).
  // English pages swap in a Latin hand first: see `.brand-hand` in globals.css.
  hand: 'var(--font-hand), var(--font-body), system-ui, sans-serif',
} as const;
