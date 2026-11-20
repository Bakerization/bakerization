import InternationalLanding, { internationalMetadata } from "@/components/international/InternationalLanding";

export const metadata = internationalMetadata("zh");

export default function ChineseHome() {
  return <InternationalLanding language="zh" />;
}
