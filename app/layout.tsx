import type { Metadata } from "next";
import {
  Space_Grotesk,
  Zen_Kaku_Gothic_Antique,
  JetBrains_Mono,
  Quicksand,
} from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";
import { getServerLocale } from "@/lib/i18n";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import HideOnResearch from "@/components/HideOnResearch";

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

const fontBody = Zen_Kaku_Gothic_Antique({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
  preload: false,
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
  display: "swap",
});

const fontRound = Quicksand({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-round",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bakerization — We Bake the Future",
  description:
    "Bakerizationはパン屋の社会課題を解決するために生まれた団体です。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html
      lang={locale}
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} ${fontRound.variable}`}
    >
      <body className="antialiased">
        <Providers>
          <Navbar locale={locale} />
          {children}
          <HideOnResearch>
            <SiteFooter locale={locale} />
          </HideOnResearch>
        </Providers>
      </body>
    </html>
  );
}
