"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Locale } from "@/lib/i18n";

const FONTS = {
  display:
    '"Space Grotesk", "Zen Kaku Gothic Antique", "Noto Sans JP", sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

export default function Navbar({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  // On the home page, TopPage renders its own integrated Nav — skip the global one.
  if (pathname === "/") return null;

  const t = {
    home: locale === "en" ? "Home" : "Home",
    services: locale === "en" ? "Services" : "Services",
    journal: locale === "en" ? "Journal" : "Journal",
    about: locale === "en" ? "About" : "About",
    contact: locale === "en" ? "Contact" : "Contact",
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "rgba(14,7,0,0.85)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid #3a2710",
      }}
    >
      <nav
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "16px 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: FONTS.display,
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: 0.3,
            color: "#f6e7c9",
            textDecoration: "none",
          }}
        >
          Bakerization
        </Link>
        <ul
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
            color: "#a88a5e",
          }}
        >
          <li>
            <Link
              href="/"
              style={{ color: "inherit", textDecoration: "none" }}
            >
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
              href="/#contact"
              style={{
                padding: "8px 14px",
                background: "#e89a1f",
                color: "#0e0700",
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
        </ul>
      </nav>
    </header>
  );
}
