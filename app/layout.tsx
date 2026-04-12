import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/app/providers";
import { getServerLocale } from "@/lib/i18n";
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

  return (
    <html lang={locale}>
      <body className="antialiased">
        <Providers>
          <Navbar locale={locale} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
