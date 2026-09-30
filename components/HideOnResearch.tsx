"use client";

import { usePathname } from "next/navigation";

/** Renders children everywhere except under /research (which has its own chrome). */
export default function HideOnResearch({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/research" || pathname.startsWith("/research/")) return null;
  return <>{children}</>;
}
