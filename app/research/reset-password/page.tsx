import type { Metadata } from "next";
import SetPasswordForm from "@/components/research/SetPasswordForm";
import { getServerLocale } from "@/lib/i18n";
import { getResearchCopy } from "@/lib/research-copy";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getResearchCopy(await getServerLocale()).meta.reset, robots: { index: false, follow: false } };
}

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  return <SetPasswordForm mode="reset" token={token} invalid={Boolean(params.error)} />;
}
