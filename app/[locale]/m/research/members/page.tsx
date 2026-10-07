import type { Metadata } from "next";
import { requireResearchAdmin } from "@/lib/auth-server";
import { localeFromParams } from "@/lib/locale";
import { getResearchCopy } from "@/lib/research-copy";
import { PageFrame, SectionRule } from "@/components/research/ui-static";
import { SetCrumbs } from "@/components/research/crumbs";
import MembersPanel from "@/components/research/MembersPanel";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getResearchCopy(await localeFromParams(params)).members.title, robots: { index: false, follow: false } };
}

export default async function MembersPage({ params }: Props) {
  const session = await requireResearchAdmin();
  const t = getResearchCopy(await localeFromParams(params));
  return (
    <PageFrame>
      <SetCrumbs items={[{ label: t.members.title }]} />
      <SectionRule left="▍RESEARCH — MEMBERS" right="ADMIN ONLY" />
      <MembersPanel currentUserId={session.user.id} />
    </PageFrame>
  );
}
