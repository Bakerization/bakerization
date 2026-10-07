import type { Metadata } from "next";
import SetPasswordForm from "@/components/research/SetPasswordForm";
import { localeFromParams } from "@/lib/locale";
import { getResearchCopy } from "@/lib/research-copy";

type MetaProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: MetaProps): Promise<Metadata> {
  return { title: getResearchCopy(await localeFromParams(params)).meta.reset, robots: { index: false, follow: false } };
}

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  return <SetPasswordForm mode="reset" token={token} invalid={Boolean(params.error)} />;
}
