import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import ConsentForm from "@/components/research/ConsentForm";
import { localeFromParams } from "@/lib/locale";
import { getResearchCopy } from "@/lib/research-copy";

type MetaProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: MetaProps): Promise<Metadata> {
  return { title: getResearchCopy(await localeFromParams(params)).meta.consent, robots: { index: false, follow: false } };
}

function hostOf(value: string | undefined) {
  if (!value) return "";
  try {
    return new URL(value).host;
  } catch {
    return value;
  }
}

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === "string") query.set(k, v);
  }

  const session = await getAuthSession();
  if (!session) {
    // Keep the signed OAuth query so sign-in can resume the authorization.
    redirect(`/research/login?${query.toString()}`);
  }

  const clientId = typeof params.client_id === "string" ? params.client_id : "";
  if (!clientId) redirect("/research");

  const clientHost = hostOf(clientId);
  const clientLabel = /claude\.(ai|com)$/.test(clientHost) ? "Claude（Anthropic）" : clientHost || clientId;
  const redirectHost = hostOf(typeof params.redirect_uri === "string" ? params.redirect_uri : undefined);
  const scopes = (typeof params.scope === "string" ? params.scope : "").split(" ").filter(Boolean);

  return (
    <ConsentForm
      clientLabel={clientLabel}
      redirectHost={redirectHost || clientHost}
      scopes={scopes.length ? scopes : ["research"]}
      userEmail={session.user.email}
    />
  );
}
