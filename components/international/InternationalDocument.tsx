import type { CSSProperties, ReactNode } from "react";
import "@/app/globals.css";
import { INTERNATIONAL_COPY, type InternationalLanguage } from "@/lib/international";

export default function InternationalDocument({ children, language }: { children: ReactNode; language: InternationalLanguage }) {
  const font = language === "zh"
    ? '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
    : '"Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif';
  return (
    <html lang={INTERNATIONAL_COPY[language].language} data-scroll-behavior="smooth" style={{ "--font-body": font, "--font-display": font, "--font-label": font } as CSSProperties}>
      <body>{children}</body>
    </html>
  );
}
