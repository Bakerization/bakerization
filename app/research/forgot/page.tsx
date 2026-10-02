import type { Metadata } from "next";
import ForgotForm from "@/components/research/ForgotForm";
import { getServerLocale } from "@/lib/i18n";
import { getResearchCopy } from "@/lib/research-copy";

export async function generateMetadata(): Promise<Metadata> {
  return { title: getResearchCopy(await getServerLocale()).meta.forgot, robots: { index: false, follow: false } };
}

export default function ForgotPage() {
  return <ForgotForm />;
}
