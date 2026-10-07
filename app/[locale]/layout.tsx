import type { Metadata } from "next";
import {
  Space_Grotesk,
  Zen_Kaku_Gothic_Antique,
  JetBrains_Mono,
} from "next/font/google";
import "../globals.css";
import Providers from "@/app/providers";
import { LOCALES, localeFromParams } from "@/lib/locale";
import { SITE_URL } from "@/lib/site";
import { OG_LOCALE, SITE_NAME } from "@/lib/seo";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import HideOnResearch from "@/components/HideOnResearch";

// Root layout. Public URLs never show the locale: next.config.ts rewrites
// `/about` → `/ja/about` and `/about?lang=en` → `/en/about`, so every page
// below can be prerendered once per language with zero per-request work.

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

// Zen Kaku is a static-weight CJK family: every weight adds 121 unicode-range
// @font-face rules (~90 KB of render-blocking CSS). Only 400 and 700 are used.
const fontBody = Zen_Kaku_Gothic_Antique({
  subsets: ["latin"],
  weight: ["400", "700"],
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

// Quicksand is only used by the home hero; components/home/TopPage.tsx loads it.

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Both languages are prerendered; pages below inherit these params.
// No `dynamicParams = false` here: Next evaluates it across every segment of a
// route, which would 404 the on-demand children (/blog/[slug], /research/a/[id]).
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// Site-wide defaults. No `alternates` here: every page would inherit the root
// canonical. Pages set canonical / hreflang / OG through lib/seo.ts pageMetadata().
export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const locale = await localeFromParams(params);
  const description =
    locale === "en"
      ? "Bakerization was founded to solve the social challenges facing the bakery industry — protecting Japan's bread culture through research, technology and community."
      : "Bakerizationはパン屋の社会課題を解決するために生まれた団体です。調査・テクノロジー・コミュニティで日本のパン文化を守ります。";
  const verification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: "Bakerization — We Bake the Future", template: `%s | ${SITE_NAME}` },
    description,
    applicationName: SITE_NAME,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      images: ["/opengraph-image"],
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false, email: false, address: false },
    ...(verification ? { verification: { google: verification } } : {}),
  };
}

export default async function RootLayout({ children, params }: Props) {
  const locale = await localeFromParams(params);

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
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
