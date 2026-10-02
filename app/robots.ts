import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Admin / sign-in pages are noindex in their own metadata and deliberately not
// listed here: robots.txt is public, and listing them would advertise them.
export default function robots(): MetadataRoute.Robots {
  // Vercel preview deployments must never be indexed.
  if (process.env.VERCEL_ENV === "preview") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
