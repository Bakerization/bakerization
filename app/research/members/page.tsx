import type { Metadata } from "next";
import { requireResearchAdmin } from "@/lib/auth-server";
import { getServerLocale } from "@/lib/i18n";
import { getResearchCopy } from "@/lib/research-copy";
import { PageFrame, SectionRule } from "@/components/research/ui-static";
import { SetCrumbs } from "@/components/research/crumbs";
import MembersPanel from "@/components/research/MembersPanel";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getResearchCopy(await getServerLocale()).members.title };
}

export default async function MembersPage() {
  const session = await requireResearchAdmin();
  const t = getResearchCopy(await getServerLocale());
  return (
    <PageFrame>
      <SetCrumbs items={[{ label: t.members.title }]} />
      <SectionRule left="▍RESEARCH — MEMBERS" right="ADMIN ONLY" />
      <MembersPanel currentUserId={session.user.id} />
    </PageFrame>
  );
}
