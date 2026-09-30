import { APP_URL } from "@/lib/auth";
import { requireMember } from "@/lib/auth-server";
import { PageFrame, SectionRule } from "@/components/research/ui";
import { SetCrumbs } from "@/components/research/crumbs";
import ApiKeysPanel from "@/components/research/ApiKeysPanel";
import ChangePasswordForm from "@/components/research/ChangePasswordForm";
import ConnectorGuide from "@/components/research/ConnectorGuide";

export default async function SettingsPage() {
  await requireMember("/research/settings");
  return (
    <PageFrame>
      <SetCrumbs items={[{ label: "設定" }]} />
      <SectionRule left="▍RESEARCH — SETTINGS" />
      <div style={{ display: "grid", gap: 24 }}>
        <ConnectorGuide appUrl={APP_URL} />
        <ApiKeysPanel />
        <ChangePasswordForm />
      </div>
    </PageFrame>
  );
}
