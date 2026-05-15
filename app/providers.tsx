"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeMode } from "@/lib/theme";

export default function Providers({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: ThemeMode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider initial={theme}>{children}</ThemeProvider>
    </SessionProvider>
  );
}
