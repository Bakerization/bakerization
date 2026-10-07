import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth-server";
import { getServerLocale } from "@/lib/i18n";
import ResearchShell from "@/components/research/ResearchShell";

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
    <ResearchShell locale={locale} user={user}>
      {children}
    </ResearchShell>
  );
}
