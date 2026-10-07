import { SITE_URL } from "@/lib/site";
import { getArtifactMeta, readArtifactHtml } from "@/lib/research-store";
import { artifactCacheTag, artifactVersion } from "@/lib/research-url";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const NO_STORE = { "cache-control": "private, no-store" };

// Vercel-only TTLs (stripped before the browser). The versioned URL changes
// whenever the HTML changes, so these only bound how long a public→members
// flip can keep serving from the CDN if the tag purge doesn't reach it.
const CDN_VERSIONED = "public, s-maxage=600, stale-while-revalidate=60";
const CDN_PLAIN = "public, s-maxage=300, stale-while-revalidate=60";

/**
 * Serves an artifact's HTML for the sandboxed <iframe>.
 * The CSP `sandbox` directive (no allow-same-origin) makes the document an
 * opaque origin even when opened directly, so its scripts can't read the
 * member's cookies or call same-origin APIs with credentials.
 *
 * Order matters for speed: the small metadata row is read first, the ETag is
 * answered before the (up to 2 MB) body is read, and Better Auth is only
 * loaded on the members-only branch.
 */
export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const meta = await getArtifactMeta(id);
  if (!meta) {
    return new Response("Not found", { status: 404, headers: NO_STORE });
  }

  // Public artifacts (visibility = "public") are viewable by anyone with the link
  // and may be indexed; the canonical page is the viewer.
  const isPublic = meta.visibility === "public";
  if (!isPublic) {
    // Outsiders get the same 404 as for a missing id (no hint that it exists).
    const { getActor } = await import("@/lib/research-auth");
    const actor = await getActor(request);
    if (!actor) {
      return new Response("Not found", { status: 404, headers: NO_STORE });
    }
  }

  const url = new URL(request.url);
  const etag = `"${meta.sha256}"`;
  const versioned = isPublic && url.searchParams.get("v") === artifactVersion(meta.sha256);

  const headers: Record<string, string> = {
    "content-type": "text/html; charset=utf-8",
    "content-security-policy":
      "sandbox allow-scripts allow-forms allow-popups allow-modals allow-downloads; frame-ancestors 'self'",
    "x-frame-options": "SAMEORIGIN",
    "cache-control": "private, no-cache",
    etag,
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer",
    "cross-origin-resource-policy": "same-origin",
    "x-robots-tag": isPublic ? "index, follow" : "noindex, nofollow",
  };
  if (isPublic) {
    headers.link = `<${SITE_URL}/research/a/${meta.id}>; rel="canonical"`;
    headers["cache-control"] = versioned
      ? "public, max-age=31536000, immutable"
      : "public, max-age=0, must-revalidate";
    headers["vercel-cdn-cache-control"] = versioned ? CDN_VERSIONED : CDN_PLAIN;
    headers["vercel-cache-tag"] = artifactCacheTag(meta.id);
  }

  if (url.searchParams.get("download") === "1") {
    const filename = `${meta.title.replace(/[^\w぀-鿿.-]+/g, "_").slice(0, 80) || "artifact"}.html`;
    headers["content-disposition"] = `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`;
  } else {
    headers["content-disposition"] = "inline";
  }

  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch && ifNoneMatch.split(",").some((tag) => tag.trim().replace(/^W\//, "") === etag)) {
    return new Response(null, { status: 304, headers });
  }

  const html = await readArtifactHtml(meta.id);
  if (html === null) {
    return new Response("Not found", { status: 404, headers: NO_STORE });
  }
  return new Response(html, { status: 200, headers });
}
