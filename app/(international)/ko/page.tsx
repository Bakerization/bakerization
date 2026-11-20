import InternationalLanding, { internationalMetadata } from "@/components/international/InternationalLanding";

export const metadata = internationalMetadata("ko");

export default function KoreanHome() {
  return <InternationalLanding language="ko" />;
}
