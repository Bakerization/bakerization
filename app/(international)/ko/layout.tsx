import type { ReactNode } from "react";
import InternationalDocument from "@/components/international/InternationalDocument";

export default function KoreanLayout({ children }: { children: ReactNode }) {
  return <InternationalDocument language="ko">{children}</InternationalDocument>;
}
