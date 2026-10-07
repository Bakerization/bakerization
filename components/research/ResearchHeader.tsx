"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { C, FONTS } from "@/lib/theme";
import type { Locale } from "@/lib/locale";
import { toPublicPathname } from "@/lib/public-pathname";
import { useCrumbs } from "@/components/research/crumbs";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export type ResearchHeaderLabels = { projects: string; settings: string; members: string; logout: string; menu: string };

type Props = {
  user: { name: string; email: string; role: string } | null;
  locale: Locale;
  /** Translated strings from the server, so the client bundle carries no dictionary. */
  labels: ResearchHeaderLabels;
};

const navLink: React.CSSProperties = {
  fontFamily: FONTS.mono,
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: C.sub,
  textDecoration: "none",
};

export default function ResearchHeader({ user, locale, labels: t }: Props) {
  // Public form of the path: on the server this can be /ja/… or /en/m/… .
  const pathname = toPublicPathname(usePathname());
  const router = useRouter();
  const crumbs = useCrumbs();
  const minimal = pathname === "/research/login" || pathname === "/research/consent";
  // Phones: member links fold into a menu so the language switcher always fits.
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);
  const member = !minimal && user ? user : null;

  async function signOut() {
    // The Better Auth client (~16 KB gz) is only needed by members who sign
    // out, so it is loaded on click rather than shipped to every visitor.
    const { authClient } = await import("@/lib/auth-client");
    await authClient.signOut();
    router.push("/research");
    router.refresh();
  }

  const signOutStyle: React.CSSProperties = { ...navLink, background: "transparent", border: `1px solid ${C.line}`, padding: "6px 10px", cursor: "pointer" };

  // The artifact viewer is full-viewport; its ⋯ panel carries the brand link and language switch.
  if (pathname.startsWith("/research/a/")) return null;

  return (
    <header
      className="rs-header"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        zIndex: 50,
        background: C.bg,
        borderBottom: `1px solid ${C.line}`,
        color: C.ink,
      }}
    >
      <div
        className="mob-pad"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          height: "100%",
          padding: "0 64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, minWidth: 0 }}>
          <Link href="/research" style={{ textDecoration: "none", color: C.ink, fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, letterSpacing: -0.3, whiteSpace: "nowrap" }}>
            Bakerization<span style={{ color: C.accent }}> / </span>Research
          </Link>
          {!minimal && crumbs.length > 0 ? (
            <nav className="mob-hide" aria-label="breadcrumb" style={{ display: "flex", gap: 8, minWidth: 0, ...navLink, textTransform: "none", letterSpacing: "0.06em", fontSize: 12 }}>
              {crumbs.map((c, i) => (
                <span key={`${c.label}-${i}`} style={{ display: "flex", gap: 8, minWidth: 0 }}>
                  <span aria-hidden>›</span>
                  {c.href ? (
                    <Link href={c.href} style={{ ...navLink, textTransform: "none", letterSpacing: "0.06em", fontSize: 12 }}>{c.label}</Link>
                  ) : (
                    <span style={{ color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}>{c.label}</span>
                  )}
                </span>
              ))}
            </nav>
          ) : null}
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
          {member ? (
            <span className="mob-hide" style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Link href="/research" style={navLink}>{t.projects}</Link>
              <Link href="/research/settings" style={navLink}>{t.settings}</Link>
              {member.role === "admin" ? <Link href="/research/members" style={navLink}>{t.members}</Link> : null}
              <span style={{ ...navLink, textTransform: "none", letterSpacing: 0, color: C.ink }}>{member.name}</span>
              <button type="button" onClick={() => void signOut()} style={signOutStyle}>
                {t.logout}
              </button>
            </span>
          ) : null}
          <LanguageSwitcher locale={locale} />
          {member ? (
            <button
              type="button"
              className="mob-only"
              aria-expanded={menuOpen}
              aria-label={t.menu}
              onClick={() => setMenuOpen((o) => !o)}
              style={{ ...signOutStyle, fontSize: 14, letterSpacing: 0, padding: "4px 10px" }}
            >
              {menuOpen ? "✕" : "≡"}
            </button>
          ) : null}
        </nav>
      </div>
      {member && menuOpen ? (
        <div
          className="mob-only mob-pad"
          style={{ position: "absolute", top: 56, left: 0, right: 0, flexDirection: "column", gap: 14, padding: "16px 20px 20px", background: C.bg, borderBottom: `1px solid ${C.line}` }}
        >
          <Link href="/research" style={navLink}>{t.projects}</Link>
          <Link href="/research/settings" style={navLink}>{t.settings}</Link>
          {member.role === "admin" ? <Link href="/research/members" style={navLink}>{t.members}</Link> : null}
          <span style={{ ...navLink, textTransform: "none", letterSpacing: 0, color: C.ink }}>{member.name}</span>
          <button type="button" onClick={() => void signOut()} style={{ ...signOutStyle, alignSelf: "flex-start" }}>
            {t.logout}
          </button>
        </div>
      ) : null}
    </header>
  );
}
