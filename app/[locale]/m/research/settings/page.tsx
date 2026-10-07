import type { Metadata } from "next";
import { APP_URL } from "@/lib/site";
import { requireMember } from "@/lib/auth-server";
import { localeFromParams } from "@/lib/locale";
import { getResearchCopy } from "@/lib/research-copy";
import { PageFrame, SectionRule } from "@/components/research/ui-static";
import { SetCrumbs } from "@/components/research/crumbs";
import ApiKeysPanel from "@/components/research/ApiKeysPanel";
import ChangePasswordForm from "@/components/research/ChangePasswordForm";
import ConnectorGuide from "@/components/research/ConnectorGuide";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getResearchCopy(await localeFromParams(params)).settings.title, robots: { index: false, follow: false } };
}

export default async function SettingsPage({ params }: Props) {
  await requireMember();
  const locale = await localeFromParams(params);
  const t = getResearchCopy(locale);
  return (
    <PageFrame>
      <SetCrumbs items={[{ label: t.settings.title }]} />
      <SectionRule left="▍RESEARCH — SETTINGS" />
      <div style={{ display: "grid", gap: 24 }}>
        <ConnectorGuide appUrl={APP_URL} locale={locale} />
        <ApiKeysPanel />
        <ChangePasswordForm />
      </div>
    </PageFrame>
  );
}
