import Link from "next/link";
import { C, FONTS } from "@/lib/theme";
import { APP } from "@/lib/company";
import type { Locale } from "@/lib/locale";
import InlineLanguageSwitcher from "@/components/InlineLanguageSwitcher";
import Wordmark from "@/components/brand/Wordmark";
import { Inner, labelText } from "@/components/brand/ui";

/**
 * 全ページ共通のフッター。app/layout.tsx から {children} の下に置いている。
 * ブランドブックの表紙（黄色の面に、右下の BAKERIZATION）を踏襲している。
 *
 * Google の OAuth 審査は「プライバシーポリシーがホームページからリンクされて
 * いること」を求めるので、この導線は消さないこと。
 */
export default function SiteFooter({ locale }: { locale: Locale }) {
  const link = { color: C.onMain, textDecoration: "none" } as const;
  return (
    <footer style={{ background: C.main, color: C.onMain }}>
      <Inner style={{ padding: "64px 64px 40px" }}>
        <div
          className="mob-stack"
          style={{
            ...labelText,
            display: "flex",
            alignItems: "center",
            gap: 28,
            flexWrap: "wrap",
          }}
        >
          <Link href="/app" style={{ ...link, textTransform: "none", letterSpacing: "0.06em" }}>
            {APP.name}
          </Link>
          <Link href="/research" style={link}>
            Research
          </Link>
          <Link href="/privacy" style={link}>
            {locale === "en" ? "Privacy Policy" : "プライバシーポリシー"}
          </Link>
          <InlineLanguageSwitcher locale={locale} separator=" · " />
        </div>
        <div
          className="mob-stack"
          style={{
            marginTop: 72,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <span style={{ fontFamily: FONTS.label, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            © {new Date().getFullYear()} Bakerization · We Bake the Future · All rights reserved
          </span>
          <Wordmark height={26} color={C.onMain} />
        </div>
      </Inner>
    </footer>
  );
}
