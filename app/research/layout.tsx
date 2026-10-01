import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth-server";
import { C, FONTS } from "@/lib/theme";
import { CrumbProvider } from "@/components/research/crumbs";
import ResearchHeader from "@/components/research/ResearchHeader";

export const metadata: Metadata = {
  title: "Research | Bakerization",
  robots: { index: false, follow: false, nocache: true },
};

// Layouts don't re-run on client navigation, so this layout never redirects;
// each page calls requireMember()/requireResearchAdmin() itself.
export default async function ResearchLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  const user = session
    ? { name: session.user.name, email: session.user.email, role: session.user.role ?? "member" }
    : null;

  return (
    <CrumbProvider>
      <ResearchHeader user={user} />
      <main className="rs-main" style={{ paddingTop: 56, minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: FONTS.body }}>
        {children}
      </main>
    </CrumbProvider>
  );
}
