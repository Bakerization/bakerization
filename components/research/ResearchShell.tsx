import type { ReactNode } from "react";
import { C, FONTS } from "@/lib/theme";
import type { Locale } from "@/lib/locale";
import { getResearchCopy } from "@/lib/research-copy";
import { CrumbProvider } from "@/components/research/crumbs";
import { ResearchI18nProvider } from "@/components/research/ResearchI18n";
import ResearchHeader from "@/components/research/ResearchHeader";

export type ResearchShellUser = { name: string; email: string; role: string } | null;

/**
 * Chrome shared by every /research page: i18n + breadcrumb providers, the
 * fixed header and the main column. Server component; `user` is null for the
 * anonymous (static) pages and the signed-in member for the dynamic ones.
 */
export default function ResearchShell({ locale, user, children }: { locale: Locale; user: ResearchShellUser; children: ReactNode }) {
  const labels = getResearchCopy(locale).header;
  return (
    <ResearchI18nProvider locale={locale}>
      <CrumbProvider>
        <ResearchHeader user={user} locale={locale} labels={labels} />
        <main className="rs-main" style={{ paddingTop: 56, minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: FONTS.body }}>
          {children}
        </main>
      </CrumbProvider>
    </ResearchI18nProvider>
  );
}
