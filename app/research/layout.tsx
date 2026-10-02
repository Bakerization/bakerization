import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth-server";
import { getServerLocale } from "@/lib/i18n";
import { C, FONTS } from "@/lib/theme";
import { CrumbProvider } from "@/components/research/crumbs";
import { ResearchI18nProvider } from "@/components/research/ResearchI18n";
import ResearchHeader from "@/components/research/ResearchHeader";

// Members-only screens stay out of search results; public pages (index,
// projects, public artifacts) override robots in their own metadata.
export const metadata: Metadata = {
  title: { default: "Research", template: "%s | Bakerization Research" },
  robots: { index: false, follow: false, nocache: true },
};

// Layouts don't re-run on client navigation, so this layout never gates;
// members-only pages call requireMember()/requireResearchAdmin() themselves.
export default async function ResearchLayout({ children }: { children: React.ReactNode }) {
  const [session, locale] = await Promise.all([getAuthSession(), getServerLocale()]);
  const user = session
    ? { name: session.user.name, email: session.user.email, role: session.user.role ?? "member" }
    : null;

  return (
    <ResearchI18nProvider locale={locale}>
      <CrumbProvider>
        <ResearchHeader user={user} locale={locale} />
        <main className="rs-main" style={{ paddingTop: 56, minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: FONTS.body }}>
          {children}
        </main>
      </CrumbProvider>
    </ResearchI18nProvider>
  );
}
