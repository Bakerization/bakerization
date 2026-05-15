"use client";

import { useTheme } from "@/components/ThemeProvider";
import { C, FONTS } from "@/lib/theme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        isDark ? "Switch to light theme" : "Switch to dark theme"
      }
      title={isDark ? "Light mode" : "Dark mode"}
      style={{
        width: 32,
        height: 32,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${C.line}`,
        background: "transparent",
        color: C.sub,
        cursor: "pointer",
        padding: 0,
        fontFamily: FONTS.mono,
      }}
    >
      {/* Sun/Moon glyph — uses text glyph to avoid extra SVG asset */}
      <span
        aria-hidden
        style={{
          fontSize: 14,
          lineHeight: 1,
          color: C.accent,
        }}
      >
        {isDark ? "☼" : "☾"}
      </span>
    </button>
  );
}
