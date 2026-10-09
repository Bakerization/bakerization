import type { MetadataRoute } from "next";
import { listPostSummaries } from "@/lib/blog-store";
import { listNewsSummaries } from "@/lib/news-store";
import { hasEnglishVersion } from "@/lib/blog-localize";
import { listPublicArtifacts, listPublicProjects } from "@/lib/research-store";
import { sitemapEntries } from "@/lib/seo";
import { SERVICES } from "@/lib/services";

// ISR: regenerated when a post or research artifact changes (revalidatePath in
// the stores) and at most hourly otherwise.
export const revalidate = 3600;

// Every two-language page appears once per language (clean URL = ja, ?lang=en = en),
// each entry listing both versions, as Google expects for hreflang in sitemaps.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [posts, news, artifacts, projects] = await Promise.all([
    listPostSummaries().catch(() => []),
    listNewsSummaries().catch(() => []),
    listPublicArtifacts().catch(() => []),
    listPublicProjects().catch(() => []),
  ]);
  const researchUpdated = artifacts[0] ? new Date(artifacts[0].updatedAt) : now;

  return [
    ...sitemapEntries("/", { lastModified: now, changeFrequency: "weekly", priority: 1 }),
    ...sitemapEntries("/about", { lastModified: now, changeFrequency: "monthly", priority: 0.8 }),
    ...sitemapEntries("/app", { lastModified: now, changeFrequency: "monthly", priority: 0.8 }),
    ...sitemapEntries("/message", { lastModified: now, changeFrequency: "monthly", priority: 0.6 }),
    ...sitemapEntries("/news", {
      lastModified: news[0] ? new Date(news[0].updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
    ...sitemapEntries("/blog", { lastModified: now, changeFrequency: "weekly", priority: 0.7 }),
    ...sitemapEntries("/research", { lastModified: researchUpdated, changeFrequency: "weekly", priority: 0.7 }),
    ...sitemapEntries("/club", { lastModified: now, changeFrequency: "monthly", priority: 0.6 }),
    ...sitemapEntries("/contact", { lastModified: now, changeFrequency: "yearly", priority: 0.4 }),
    ...sitemapEntries("/privacy", { lastModified: now, changeFrequency: "yearly", priority: 0.2, available: ["ja"] }),
    ...SERVICES.flatMap((s) => sitemapEntries(`/services/${s.slug}`, { lastModified: now, changeFrequency: "monthly", priority: 0.6 })),
    ...posts.flatMap((p) =>
      sitemapEntries(`/blog/${p.slug}`, {
        lastModified: new Date(p.updatedAt),
        changeFrequency: "monthly",
        priority: 0.6,
        available: hasEnglishVersion(p) ? ["ja", "en"] : ["ja"],
      })
    ),
    ...news.flatMap((n) =>
      sitemapEntries(`/news/${n.slug}`, {
        lastModified: new Date(n.updatedAt),
        changeFrequency: "monthly",
        priority: 0.6,
        available: n.hasEnglish ? ["ja", "en"] : ["ja"],
      })
    ),
    ...projects.flatMap((p) =>
      sitemapEntries(`/research/p/${p.slug}`, { lastModified: new Date(p.updatedAt), changeFrequency: "weekly", priority: 0.6 })
    ),
    ...artifacts.flatMap((a) =>
      sitemapEntries(`/research/a/${a.id}`, { lastModified: new Date(a.updatedAt), changeFrequency: "weekly", priority: 0.6 })
    ),
  ];
}
