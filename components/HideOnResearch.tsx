"use client";

import { usePathname } from "next/navigation";
import { toPublicPathname } from "@/lib/public-pathname";

/** Renders children everywhere except under /research (which has its own chrome). */
export default function HideOnResearch({ children }: { children: React.ReactNode }) {
  const pathname = toPublicPathname(usePathname());
  if (pathname === "/research" || pathname.startsWith("/research/")) return null;
  return <>{children}</>;
}
