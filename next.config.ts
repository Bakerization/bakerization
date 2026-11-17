import type { NextConfig } from "next";

// Next's default list of bots that get metadata in the initial <head> instead of
// streamed, plus Googlebot, so canonical / hreflang are there on first byte.
const HTML_LIMITED_BOTS =
  /[\w-]+-Google|Google-[\w-]+|Googlebot|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight/i;

// ─────────────────────────────────────────────────────────────
// Locale routing. Pages live under app/[locale]/… so each language can be
// prerendered, but public URLs never show the locale:
//   /about          → /ja/about
//   /about?lang=en  → /en/about
// `afterFiles` runs after public/ files and non-dynamic routes (robots,
// sitemap, favicon, the OG images) have had their chance, and before dynamic
// routes, so `/research` can never reach app/[locale] as locale="research".
// Paths listed here are route handlers that live outside [locale], or are
// already internal, and must not be folded.
// ─────────────────────────────────────────────────────────────
const NOT_LOCALIZED =
  "api/|_next/|\\.well-known/|research/raw/|ja(?:/|$)|en(?:/|$)|m(?:/|$)|(?:.*/)?opengraph-image$";
const LANG_EN = [{ type: "query" as const, key: "lang", value: "en" }];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  compress: true,
  poweredByHeader: false,
  htmlLimitedBots: HTML_LIMITED_BOTS,
  async rewrites() {
    return {
      afterFiles: [
        { source: "/", has: LANG_EN, destination: "/en" },
        { source: "/", destination: "/ja" },
        { source: `/:path((?!${NOT_LOCALIZED}).+)`, has: LANG_EN, destination: "/en/:path" },
        { source: `/:path((?!${NOT_LOCALIZED}).+)`, destination: "/ja/:path" },
      ],
    };
  },
  async redirects() {
    // Internal paths must not be reachable as duplicate URLs. Redirects are
    // matched on the incoming URL only, before rewrites, so the rewritten
    // internal paths above never loop back here.
    return [
      { source: "/ja", destination: "/", permanent: true },
      { source: "/ja/:path+", destination: "/:path+", permanent: true },
      { source: "/en", destination: "/?lang=en", permanent: true },
      { source: "/en/:path+", destination: "/:path+?lang=en", permanent: true },
      { source: "/m", destination: "/", permanent: false },
      { source: "/m/:path+", destination: "/:path+", permanent: false },
    ];
  },
};

export default nextConfig;
