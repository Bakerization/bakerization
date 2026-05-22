import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  Space_Grotesk,
  Zen_Kaku_Gothic_Antique,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";
import { getServerLocale } from "@/lib/i18n";
import { THEME_COOKIE, normalizeTheme } from "@/lib/theme";
import Navbar from "@/components/Navbar";

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
  const cookieStore = await cookies();
  const theme = normalizeTheme(cookieStore.get(THEME_COOKIE)?.value);

  return (
    <html
      lang={locale}
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
    >
      <body className={`antialiased theme-${theme}`}>
        <Providers theme={theme}>
          <Navbar locale={locale} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
