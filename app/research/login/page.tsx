import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "メンバー認証 | Bakerization Research",
  robots: { index: false, follow: false },
};

export default async function ResearchLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  // Already signed in and not in the middle of an OAuth authorization → go in.
  const session = await getAuthSession();
  if (session && !params.client_id) {
    const cb = typeof params.callbackUrl === "string" && params.callbackUrl.startsWith("/research") ? params.callbackUrl : "/research";
    redirect(cb);
  }
  const notice =
    params.invite === "done"
      ? "パスワードを設定しました。招待メールのアドレスでログインしてください。"
      : params.reset === "done"
        ? "パスワードを再設定しました。新しいパスワードでログインしてください。"
        : undefined;
  return (
    <LoginForm
      kicker="▍RESEARCH — SIGN IN"
      title="メンバー認証"
      defaultCallback="/research"
      allowedPrefixes={["/research"]}
      forgotHref="/research/forgot"
      notice={notice}
    />
  );
}
