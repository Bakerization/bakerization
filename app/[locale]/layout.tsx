import type { Metadata } from "next";
import {
  Indie_Flower,
  Inter_Tight,
  Jost,
  Yomogi,
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

// Thin grotesk for section titles ("Our Mission", "Product" in the brand book).
const fontDisplay = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-display",
  display: "swap",
});

// Futura-like labels, nav and page numbers. FONTS.label tries the system
// Futura first (Apple devices), so this is the fallback everywhere else.
const fontLabel = Jost({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-label",
  display: "swap",
});

// Handwritten pull quotes: Indie Flower draws the Latin letters (Yomogi's
// Latin is typewriter-like), Yomogi the Japanese. Yomogi is a CJK
// unicode-range family like Zen Kaku, so it isn't preloaded.
const fontHandLatin = Indie_Flower({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-hand-latin",
  display: "swap",
});

const fontHand = Yomogi({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-hand",
  display: "swap",
  preload: false,
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

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// Both languages are prerendered; pages below inherit these params.
// No `dynamicParams = false` here: Next evaluates it across every segment of a
// route, which would 404 the on-demand children (/news/[slug], /research/a/[id]).
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
      className={`${fontDisplay.variable} ${fontLabel.variable} ${fontHandLatin.variable} ${fontHand.variable} ${fontBody.variable} ${fontMono.variable}`}
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
