import type { Metadata } from "next";
import { APP_URL } from "@/lib/auth";
import { requireMember } from "@/lib/auth-server";
import { getServerLocale } from "@/lib/i18n";
import { getResearchCopy } from "@/lib/research-copy";
import { PageFrame, SectionRule } from "@/components/research/ui";
import { SetCrumbs } from "@/components/research/crumbs";
import ApiKeysPanel from "@/components/research/ApiKeysPanel";
import ChangePasswordForm from "@/components/research/ChangePasswordForm";
import ConnectorGuide from "@/components/research/ConnectorGuide";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getResearchCopy(await getServerLocale()).settings.title };
}

export default async function SettingsPage() {
  await requireMember();
  const locale = await getServerLocale();
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
