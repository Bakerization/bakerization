"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import BlogLanguageSwitcher from "@/components/blog/BlogLanguageSwitcher";
import { withBlogLanguage, type BlogLanguage } from "@/lib/blog-language";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Wordmark from "@/components/brand/Wordmark";
import { NAV_HEIGHT } from "@/components/brand/ui";
import type { Locale } from "@/lib/locale";
import { withLang } from "@/lib/locale";
import { toPublicPathname } from "@/lib/public-pathname";
import { C, FONTS } from "@/lib/theme";
import { PUBLIC_NAV_LINKS as LINKS } from "@/lib/navigation";

export default function Navbar({
  locale,
  readerLanguage = locale,
}: {
  locale: Locale;
  readerLanguage?: BlogLanguage;
}) {
  const pathname = toPublicPathname(usePathname());
  const blog = pathname === "/blog" || pathname.startsWith("/blog/");
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  if (
    pathname === "/research" ||
    pathname.startsWith("/research/") ||
    pathname === "/blog/chat"
  )
    return null;
  const linkStyle = { color: "inherit", textDecoration: "none" } as const;
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
        aria-label="Main"
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
        <Link
          href={withLang("/", locale)}
          aria-label="Bakerization — Home"
          style={{ color: C.ink }}
        >
          <Wordmark height={15} />
        </Link>
        <ul
          className="nav-links"
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            gap: 16,
            alignItems: "center",
            fontFamily: FONTS.label,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: "0.12em",
            color: C.ink,
          }}
        >
          {LINKS.map((x) => (
            <li key={x.label}>
              <Link
                href={
                  blog && x.href === "/blog"
                    ? withBlogLanguage(x.href, readerLanguage)
                    : withLang(x.href, locale)
                }
                style={linkStyle}
                aria-current={
                  pathname === x.href || pathname.startsWith(x.href + "/")
                    ? "page"
                    : undefined
                }
              >
                {x.label}
              </Link>
            </li>
          ))}
          <li>
            {blog ? (
              <BlogLanguageSwitcher language={readerLanguage} />
            ) : (
              <LanguageSwitcher locale={locale} />
            )}
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
        style={{
          background: C.bg,
          borderTop: `1px solid ${C.line}`,
          padding: "8px 20px 24px",
        }}
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
            color: C.ink,
          }}
        >
          {LINKS.map((x) => (
            <li key={x.label} style={{ borderBottom: `1px solid ${C.line}` }}>
              <Link
                href={
                  blog && x.href === "/blog"
                    ? withBlogLanguage(x.href, readerLanguage)
                    : withLang(x.href, locale)
                }
                onClick={() => setOpenFor(null)}
                style={{ ...linkStyle, display: "block", padding: "14px 0" }}
              >
                {x.label}
              </Link>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 20 }}>
          {blog ? (
            <BlogLanguageSwitcher language={readerLanguage} />
          ) : (
            <LanguageSwitcher locale={locale} />
          )}
        </div>
      </div>
    </header>
  );
}
