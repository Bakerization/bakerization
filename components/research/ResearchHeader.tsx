"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { C, FONTS } from "@/lib/theme";
import { useCrumbs } from "@/components/research/crumbs";

type Props = { user: { name: string; email: string; role: string } | null };

const navLink: React.CSSProperties = {
  fontFamily: FONTS.mono,
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: C.sub,
  textDecoration: "none",
};

export default function ResearchHeader({ user }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = useCrumbs();
  const minimal = pathname === "/research/login" || pathname === "/research/consent";

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

        {!minimal && user ? (
          <nav style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Link href="/research" style={navLink}>プロジェクト</Link>
            <Link href="/research/settings" style={navLink}>設定</Link>
            {user.role === "admin" ? <Link href="/research/members" style={navLink}>メンバー</Link> : null}
            <span className="mob-hide" style={{ ...navLink, textTransform: "none", letterSpacing: 0, color: C.ink }}>{user.name}</span>
            <button
              type="button"
              onClick={async () => {
                await authClient.signOut();
                router.push("/research/login");
                router.refresh();
              }}
              style={{ ...navLink, background: "transparent", border: `1px solid ${C.line}`, padding: "6px 10px", cursor: "pointer" }}
            >
              ログアウト
            </button>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
