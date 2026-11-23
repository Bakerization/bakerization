import type { Metadata, MetadataRoute } from "next";
import {
  BLOG_LANGUAGES,
  withBlogLanguage,
  type BlogLanguage,
} from "./blog-language";
import { absoluteUrl, pageMetadata } from "./seo";
export const ALL_BLOG_LANGUAGES = Object.keys(BLOG_LANGUAGES) as BlogLanguage[];
type Input = Omit<
  Parameters<typeof pageMetadata>[0],
  "locale" | "available"
> & { locale: BlogLanguage; available?: BlogLanguage[] };
export function blogMetadata(input: Input): Metadata {
  const available = input.available || ALL_BLOG_LANGUAGES;
  const shown = available.includes(input.locale) ? input.locale : "ja";
  const result = pageMetadata({
    ...input,
    locale: input.locale === "ja" ? "ja" : "en",
    available: ["ja"],
  });
  const canonical = absoluteUrl(withBlogLanguage(input.path, shown));
  result.alternates = {
    canonical,
    languages: {
      ...Object.fromEntries(
        available.map((l) => [
          BLOG_LANGUAGES[l].hreflang,
          absoluteUrl(withBlogLanguage(input.path, l)),
        ]),
      ),
      "x-default": absoluteUrl(input.path),
    },
  };
  result.openGraph = {
    ...result.openGraph,
    url: canonical,
    locale: BLOG_LANGUAGES[shown].og,
    alternateLocale: available
      .filter((l) => l !== shown)
      .map((l) => BLOG_LANGUAGES[l].og),
  };
  return result;
}
export function blogSitemapEntries(
  path: string,
  opts: {
    lastModified?: Date;
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
    available?: BlogLanguage[];
  } = {},
): MetadataRoute.Sitemap {
  const { available = ALL_BLOG_LANGUAGES, ...rest } = opts;
  const languages = Object.fromEntries(
    available.map((l) => [
      BLOG_LANGUAGES[l].hreflang,
      absoluteUrl(withBlogLanguage(path, l)),
    ]),
  );
  return available.map((l) => ({
    url: absoluteUrl(withBlogLanguage(path, l)),
    ...rest,
    alternates: { languages },
  }));
}
