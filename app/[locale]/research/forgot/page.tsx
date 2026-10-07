import type { Metadata } from "next";
import ForgotForm from "@/components/research/ForgotForm";
import { localeFromParams } from "@/lib/locale";
import { getResearchCopy } from "@/lib/research-copy";

type MetaProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: MetaProps): Promise<Metadata> {
  return { title: getResearchCopy(await localeFromParams(params)).meta.forgot, robots: { index: false, follow: false } };
}

export default function ForgotPage() {
  return <ForgotForm />;
}
