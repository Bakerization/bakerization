"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { Locale } from "@/lib/i18n";
import { C, FONTS } from "@/lib/theme";

export default function Navbar({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  // On the home page, TopPage renders its own integrated Nav — skip the global one.
  if (pathname === "/") return null;

  const t = {
    home: "Home",
    services: "Services",
    journal: "Journal",
    about: "About",
    contact: "Contact",
  };

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
        className="mob-pad mob-flex-wrap"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "16px 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: FONTS.display,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: 0.3,
            color: C.ink,
            textDecoration: "none",
          }}
        >
          Bakerization
        </Link>
        <ul
          className="mob-flex-wrap"
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            gap: 22,
            alignItems: "center",
            fontFamily: FONTS.mono,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.sub,
          }}
        >
          <li>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
              {t.home}
            </Link>
          </li>
          <li>
            <Link
              href="/#services"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {t.services}
            </Link>
          </li>
          <li>
            <Link
              href="/blog"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {t.journal}
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {t.about}
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              style={{
                padding: "8px 14px",
                background: C.accent,
                color: C.bg,
                fontWeight: 700,
                textDecoration: "none",
                letterSpacing: "0.18em",
              }}
            >
              {t.contact}
            </Link>
          </li>
          <li>
            <LanguageSwitcher locale={locale} />
          </li>
          <li style={{ display: "inline-flex", alignItems: "center" }}>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  );
}
