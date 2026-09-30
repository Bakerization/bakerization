import type { Metadata } from "next";
import SetPasswordForm from "@/components/research/SetPasswordForm";

export const metadata: Metadata = {
  title: "パスワードを設定 | Bakerization Research",
  robots: { index: false, follow: false },
};

export default async function InvitePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  return <SetPasswordForm mode="invite" token={token} invalid={Boolean(params.error)} />;
}
