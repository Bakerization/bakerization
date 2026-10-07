// Canonical origin of the site. No imports, so the root layout, sitemap, robots
// and the raw artifact route can use it without loading Better Auth or the
// database pool.

function resolveSiteUrl() {
  const explicit = process.env.BETTER_AUTH_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
export const APP_URL = SITE_URL;
export const MCP_RESOURCE = `${SITE_URL}/api/mcp`;
