import type { Metadata, MetadataRoute } from "next";
import { LOCALES, withLang, type Locale } from "@/lib/locale";
import { SITE_URL } from "@/lib/site";

// Canonical / hreflang / Open Graph in one place.
// URL policy: Japanese is the clean path, English is `path?lang=en`.

export const SITE_NAME = "Bakerization";
export const OG_LOCALE: Record<Locale, string> = { ja: "ja_JP", en: "en_US" };
/** app/opengraph-image.tsx */
export const DEFAULT_OG_IMAGE = "/opengraph-image";

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).href;
}

export function localizedPath(path: string, locale: Locale): string {
  return withLang(path, locale);
}

/** Canonical + hreflang. `available` = locales the page really has content for. */
export function buildAlternates(path: string, locale: Locale, available: readonly Locale[] = LOCALES): NonNullable<Metadata["alternates"]> {
  const shown = available.includes(locale) ? locale : available[0];
  const canonical = absoluteUrl(localizedPath(path, shown));
  if (available.length < 2) return { canonical };
  return {
    canonical,
    languages: {
      ja: absoluteUrl(localizedPath(path, "ja")),
      en: absoluteUrl(localizedPath(path, "en")),
      "x-default": absoluteUrl(localizedPath(path, "ja")),
    },
  };
}

type PageMetadataInput = {
  path: string;
  locale: Locale;
  /** Short title; the layout's template adds the site suffix (unless absoluteTitle). */
  title: string;
  absoluteTitle?: boolean;
  description?: string;
  available?: readonly Locale[];
  type?: "website" | "article";
  siteName?: string;
  /** Always set explicitly: a child's openGraph replaces the parent's wholesale. */
  images?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  robots?: Metadata["robots"];
};

export function pageMetadata(input: PageMetadataInput): Metadata {
  const available = input.available ?? LOCALES;
  const alternates = buildAlternates(input.path, input.locale, available);
  const shown = available.includes(input.locale) ? input.locale : available[0];
  const images = input.images?.length ? input.images : [DEFAULT_OG_IMAGE];
  const ogTitle = input.title;
  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates,
    robots: input.robots ?? { index: true, follow: true },
    openGraph: {
      type: input.type ?? "website",
      url: alternates.canonical as string,
      title: ogTitle,
      description: input.description,
      siteName: input.siteName ?? SITE_NAME,
      locale: OG_LOCALE[shown],
      alternateLocale: available.filter((l) => l !== shown).map((l) => OG_LOCALE[l]),
      images,
      ...(input.type === "article" ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: input.description,
      images,
    },
  };
}

/** One <url> per available locale, each listing every language version. */
export function sitemapEntries(
  path: string,
  opts: {
    lastModified?: Date;
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
    available?: readonly Locale[];
  } = {}
): MetadataRoute.Sitemap {
  const available = opts.available ?? LOCALES;
  const languages =
    available.length > 1
      ? Object.fromEntries(available.map((l) => [l, absoluteUrl(localizedPath(path, l))]))
      : undefined;
  return available.map((l) => ({
    url: absoluteUrl(localizedPath(path, l)),
    lastModified: opts.lastModified,
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    ...(languages ? { alternates: { languages } } : {}),
  }));
}
