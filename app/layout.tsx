import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import Providers from "@/app/providers";
import { getServerLocale } from "@/lib/i18n";
import { THEME_COOKIE, normalizeTheme } from "@/lib/theme";
import Navbar from "@/components/Navbar";

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
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Zen+Kaku+Gothic+Antique:wght@300;400;500;700;900&family=Noto+Sans+JP:wght@300;400;500;600;700;800&family=Noto+Serif+JP:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body className={`antialiased theme-${theme}`}>
        <Providers theme={theme}>
          <Navbar locale={locale} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
