"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Wordmark from "@/components/brand/Wordmark";
import { NAV_HEIGHT } from "@/components/brand/ui";
import type { Locale } from "@/lib/locale";
import { toPublicPathname } from "@/lib/public-pathname";
import { C, FONTS } from "@/lib/theme";

const LINKS: { label: string; href: string; drop?: string }[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/#services" },
  { label: "Product", href: "/app", drop: "kiji hub" },
  { label: "News", href: "/news" },
  { label: "Journal", href: "/blog" },
  { label: "Research", href: "/research" },
  { label: "Message", href: "/message" },
  { label: "Club", href: "/club" },
];

export default function Navbar({ locale }: { locale: Locale }) {
  const pathname = toPublicPathname(usePathname());
  const [openFor, setOpenFor] = useState<string | null>(null);
  // The mobile panel belongs to the page it was opened on; navigating closes it.
  const open = openFor === pathname;

  // /research has its own header (ResearchShell).
  if (pathname === "/research" || pathname.startsWith("/research/")) return null;

  const linkStyle = { color: "inherit", textDecoration: "none" } as const;
  const contactStyle = {
    padding: "9px 18px",
    borderRadius: 999,
    background: C.main,
    color: C.onMain,
    textDecoration: "none",
  } as const;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: C.bg,
        borderBottom: `1px solid ${C.line}`,
      }}
    >
      <nav
        className="mob-pad"
        style={{
          maxWidth: 1280,
          height: NAV_HEIGHT,
          margin: "0 auto",
          padding: "0 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          boxSizing: "border-box",
        }}
      >
        <Link href="/" aria-label="Bakerization — Home" style={{ color: C.ink }}>
          <Wordmark height={15} />
        </Link>
        <ul
          className="nav-links"
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            gap: 24,
            alignItems: "center",
            fontFamily: FONTS.label,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: C.ink,
          }}
        >
          {LINKS.map((x) => (
            <li key={x.label} className={x.drop ? "nav-drop" : undefined}>
              <Link href={x.href} style={linkStyle}>
                {x.label}
              </Link>
              {x.drop && (
                <div className="nav-drop-menu">
                  <Link
                    href={x.href}
                    style={{
                      display: "block",
                      padding: "10px 16px",
                      background: C.card,
                      border: `1px solid ${C.line}`,
                      color: C.ink,
                      textDecoration: "none",
                      textTransform: "none",
                      letterSpacing: "0.06em",
                      fontSize: 13,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {x.drop}
                  </Link>
                </div>
              )}
            </li>
          ))}
          <li>
            <Link href="/contact" style={contactStyle}>
              Contact
            </Link>
          </li>
          <li>
            <LanguageSwitcher locale={locale} />
          </li>
        </ul>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav-panel"
          onClick={() => setOpenFor(open ? null : pathname)}
          style={{
            alignItems: "center",
            padding: "9px 16px",
            borderRadius: 999,
            border: `1.5px solid ${C.ink}`,
            background: open ? C.ink : "transparent",
            color: open ? C.onSlab : C.ink,
            fontFamily: FONTS.label,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.14em",
            cursor: "pointer",
          }}
        >
          {open ? "CLOSE" : "MENU"}
        </button>
      </nav>
      <div
        id="site-nav-panel"
        className="nav-panel"
        data-open={open}
        style={{ background: C.bg, borderTop: `1px solid ${C.line}`, padding: "8px 20px 24px" }}
      >
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            fontFamily: FONTS.label,
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: C.ink,
          }}
        >
          {LINKS.map((x) => (
            <li key={x.label} style={{ borderBottom: `1px solid ${C.line}` }}>
              <Link
                href={x.href}
                onClick={() => setOpenFor(null)}
                style={{ ...linkStyle, display: "block", padding: "14px 0" }}
              >
                {x.label}
                {x.drop ? <span style={{ textTransform: "none", color: C.sub }}> — {x.drop}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Link
            href="/contact"
            onClick={() => setOpenFor(null)}
            style={{
              ...contactStyle,
              fontFamily: FONTS.label,
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.12em",
            }}
          >
            CONTACT
          </Link>
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </header>
  );
}
