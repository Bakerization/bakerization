import type { ReactNode } from "react";
import InternationalDocument from "@/components/international/InternationalDocument";

export default function ChineseLayout({ children }: { children: ReactNode }) {
  return <InternationalDocument language="zh">{children}</InternationalDocument>;
}
