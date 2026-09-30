import type { Metadata } from "next";
import SetPasswordForm from "@/components/research/SetPasswordForm";

export const metadata: Metadata = {
  title: "パスワード再設定 | Bakerization Research",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  return <SetPasswordForm mode="reset" token={token} invalid={Boolean(params.error)} />;
}
