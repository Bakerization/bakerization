import type { Metadata } from "next";
import SetPasswordForm from "@/components/research/SetPasswordForm";
import { getServerLocale } from "@/lib/i18n";
import { getResearchCopy } from "@/lib/research-copy";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getResearchCopy(await getServerLocale()).meta.invite, robots: { index: false, follow: false } };
}

export default async function InvitePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  return <SetPasswordForm mode="invite" token={token} invalid={Boolean(params.error)} />;
}
