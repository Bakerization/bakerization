import { requireResearchAdmin } from "@/lib/auth-server";
import { PageFrame, SectionRule } from "@/components/research/ui";
import { SetCrumbs } from "@/components/research/crumbs";
import MembersPanel from "@/components/research/MembersPanel";

export default async function MembersPage() {
  const session = await requireResearchAdmin("/research/members");
  return (
    <PageFrame>
      <SetCrumbs items={[{ label: "メンバー" }]} />
      <SectionRule left="▍RESEARCH — MEMBERS" right="ADMIN ONLY" />
      <MembersPanel currentUserId={session.user.id} />
    </PageFrame>
  );
}
