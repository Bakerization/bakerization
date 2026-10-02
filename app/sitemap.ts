import type { MetadataRoute } from "next";
import { listPosts } from "@/lib/blog-store";
import { hasEnglishVersion } from "@/lib/blog-localize";
import { listPublicArtifacts, listPublicProjects } from "@/lib/research-store";
import { sitemapEntries } from "@/lib/seo";
import { SERVICES } from "@/lib/services";

export const dynamic = "force-dynamic";

// Every two-language page appears once per language (clean URL = ja, ?lang=en = en),
// each entry listing both versions, as Google expects for hreflang in sitemaps.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [posts, artifacts, projects] = await Promise.all([
    listPosts(false).catch(() => []),
    listPublicArtifacts().catch(() => []),
    listPublicProjects().catch(() => []),
  ]);
  const researchUpdated = artifacts[0] ? new Date(artifacts[0].updatedAt) : now;

  return [
    ...sitemapEntries("/", { lastModified: now, changeFrequency: "weekly", priority: 1 }),
    ...sitemapEntries("/about", { lastModified: now, changeFrequency: "monthly", priority: 0.8 }),
    ...sitemapEntries("/app", { lastModified: now, changeFrequency: "monthly", priority: 0.8 }),
    ...sitemapEntries("/message", { lastModified: now, changeFrequency: "monthly", priority: 0.6 }),
    ...sitemapEntries("/blog", { lastModified: now, changeFrequency: "weekly", priority: 0.7 }),
    ...sitemapEntries("/research", { lastModified: researchUpdated, changeFrequency: "weekly", priority: 0.7 }),
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
    ...projects.flatMap((p) =>
      sitemapEntries(`/research/p/${p.slug}`, { lastModified: new Date(p.updatedAt), changeFrequency: "weekly", priority: 0.6 })
    ),
    ...artifacts.flatMap((a) =>
      sitemapEntries(`/research/a/${a.id}`, { lastModified: new Date(a.updatedAt), changeFrequency: "weekly", priority: 0.6 })
    ),
  ];
}
