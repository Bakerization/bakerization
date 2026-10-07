import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth-server";
import { localeFromParams } from "@/lib/locale";
import ResearchShell from "@/components/research/ResearchShell";

// Member /research tree. Only reachable through proxy.ts, which rewrites
// /research* to /{locale}/m/research* when a session cookie is present
// (direct hits on /m/* are redirected away in next.config.ts). Everything
// here is rendered per request. The anonymous twin (../../research) emits
// the canonical URLs, so these pages are never indexed.
export const metadata: Metadata = {
  title: { default: "Research", template: "%s | Bakerization Research" },
  robots: { index: false, follow: false, nocache: true },
};

// Layouts don't re-run on client navigation, so this layout never gates;
// members-only pages call requireMember()/requireResearchAdmin() themselves.
export default async function MemberResearchLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const [session, locale] = await Promise.all([getAuthSession(), localeFromParams(params)]);
  const user = session
    ? { name: session.user.name, email: session.user.email, role: session.user.role ?? "member" }
    : null;

  return (
    <ResearchShell locale={locale} user={user}>
      {children}
    </ResearchShell>
  );
}
