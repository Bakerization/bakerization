import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import LoginForm from "@/components/auth/LoginForm";
import { localeFromParams } from "@/lib/locale";
import { getResearchCopy } from "@/lib/research-copy";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: getResearchCopy(await localeFromParams(params)).meta.login, robots: { index: false, follow: false } };
}

export default async function ResearchLoginPage({ params, searchParams }: Props) {
  const query = await searchParams;
  // Already signed in and not in the middle of an OAuth authorization → go in.
  const session = await getAuthSession();
  if (session && !query.client_id) {
    const cb = typeof query.callbackUrl === "string" && query.callbackUrl.startsWith("/research") ? query.callbackUrl : "/research";
    redirect(cb);
  }
  const locale = await localeFromParams(params);
  const t = getResearchCopy(locale).login;
  const notice = query.invite === "done" ? t.noticeInvite : query.reset === "done" ? t.noticeReset : undefined;
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
