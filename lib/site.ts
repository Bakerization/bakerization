// Canonical origin of the site. No imports, so the root layout, sitemap and
// robots can use it without loading Better Auth or the database pool.

function resolveSiteUrl() {
  const explicit = process.env.BETTER_AUTH_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
