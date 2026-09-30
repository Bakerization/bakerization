import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/auth";
import { listPosts } from "@/lib/blog-store";
import { listPublicArtifacts } from "@/lib/research-store";
import { SERVICES } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/app`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/message`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${APP_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${APP_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${APP_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    ...SERVICES.map((s) => ({ url: `${APP_URL}/services/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];

  const [posts, artifacts] = await Promise.all([
    listPosts(false).catch(() => []),
    listPublicArtifacts().catch(() => []),
  ]);

  return [
    ...staticPages,
    ...posts.map((p) => ({ url: `${APP_URL}/blog/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...artifacts.map((a) => ({ url: `${APP_URL}/research/a/${a.id}`, lastModified: new Date(a.updatedAt), changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
