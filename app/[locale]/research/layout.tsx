import type { Metadata } from "next";
import { localeFromParams } from "@/lib/locale";
import ResearchShell from "@/components/research/ResearchShell";

// Anonymous /research tree: static / ISR pages for visitors without a session.
// Signed-in members never reach these: proxy.ts rewrites their requests to
// app/[locale]/m/research/*, which reads the session and renders the member
// UI. Hence no getAuthSession() here, so the pages below can be prerendered.
//
// Members-only screens stay out of search results; public pages (index,
// projects, public artifacts) override robots in their own metadata.
export const metadata: Metadata = {
  title: { default: "Research", template: "%s | Bakerization Research" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function ResearchLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = await localeFromParams(params);
  return (
    <ResearchShell locale={locale} user={null}>
      {children}
    </ResearchShell>
  );
}
