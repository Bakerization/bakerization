import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import LoginForm from "@/components/auth/LoginForm";
import { getServerLocale } from "@/lib/i18n";
import { getResearchCopy } from "@/lib/research-copy";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getResearchCopy(await getServerLocale()).meta.login, robots: { index: false, follow: false } };
}

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
  const locale = await getServerLocale();
  const t = getResearchCopy(locale).login;
  const notice = params.invite === "done" ? t.noticeInvite : params.reset === "done" ? t.noticeReset : undefined;
  return (
    <LoginForm
      locale={locale}
      kicker="▍RESEARCH — SIGN IN"
      title={t.title}
      defaultCallback="/research"
      allowedPrefixes={["/research"]}
      forgotHref="/research/forgot"
      notice={notice}
    />
  );
}
