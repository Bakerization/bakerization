import Link from "next/link";
import { C, FONTS } from "@/lib/theme";
import { APP } from "@/lib/company";
import { Locale } from "@/lib/i18n";
import InlineLanguageSwitcher from "@/components/InlineLanguageSwitcher";

/**
 * 全ページ共通のフッター。app/layout.tsx から {children} の下に置いている。
 * もとは TopPage の中にあり、トップページにしか出ていなかった。
 * kiji hub とプライバシーポリシーへの導線をサイト全体で確保するために外に出した。
 *
 * Google の OAuth 審査は「プライバシーポリシーがホームページからリンクされて
 * いること」を求めるので、この導線は消さないこと。
 */
export default function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto" }}>
      <footer
        className="mob-footer"
        style={{
          padding: "48px 64px",
          background: C.slab,
          color: C.onSlab,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: FONTS.mono,
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: 18,
            letterSpacing: 0,
            textTransform: "none",
          }}
        >
          Bakerization
        </span>
        <span style={{ opacity: 0.65 }}>
          © {new Date().getFullYear()} Bakerization · We Bake the Future · ALL
          RIGHTS RESERVED
        </span>
        <span
          className="mob-flex-wrap"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            justifyContent: "center",
          }}
        >
          <Link
            href="/app"
            style={{
              color: C.onSlab,
              opacity: 0.85,
              textDecoration: "none",
              textTransform: "none",
              letterSpacing: "0.08em",
            }}
          >
            {APP.name}
          </Link>
          <Link
            href="/privacy"
            style={{ color: C.onSlab, opacity: 0.85, textDecoration: "none" }}
          >
            {locale === "en" ? "Privacy Policy" : "プライバシーポリシー"}
          </Link>
          <span style={{ opacity: 0.85 }}>
            <InlineLanguageSwitcher locale={locale} separator=" · " />
          </span>
        </span>
      </footer>
    </div>
  );
}
