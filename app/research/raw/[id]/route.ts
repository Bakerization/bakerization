import { getActor } from "@/lib/research-auth";
import { getArtifactHtml } from "@/lib/research-store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const NO_STORE = { "cache-control": "private, no-store" };

/**
 * Serves an artifact's HTML for the sandboxed <iframe>.
 * The CSP `sandbox` directive (no allow-same-origin) makes the document an
 * opaque origin even when opened directly, so its scripts can't read the
 * member's cookies or call same-origin APIs with credentials.
 */
export async function GET(request: Request, { params }: Params) {
  const actor = await getActor(request);
  if (!actor) {
    return new Response("Unauthorized", { status: 401, headers: NO_STORE });
  }

  const { id } = await params;
  const artifact = await getArtifactHtml(id);
  if (!artifact) {
    return new Response("Not found", { status: 404, headers: NO_STORE });
  }

  const etag = `"${artifact.sha256}"`;
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
    "x-robots-tag": "noindex, nofollow",
  };

  const url = new URL(request.url);
  if (url.searchParams.get("download") === "1") {
    const filename = `${artifact.title.replace(/[^\w぀-鿿.-]+/g, "_").slice(0, 80) || "artifact"}.html`;
    headers["content-disposition"] = `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`;
  } else {
    headers["content-disposition"] = "inline";
  }

  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(artifact.html, { status: 200, headers });
}
