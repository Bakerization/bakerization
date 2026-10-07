// URL / cache-key helpers for artifact HTML. Import-free so client
// components, the raw route and the store can all share them.

const VERSION_LEN = 16;

/** Short content hash: a changed artifact gets a new raw URL (cache-busting). */
export function artifactVersion(sha256: string) {
  return sha256.slice(0, VERSION_LEN);
}

/** Plain raw URL (Open HTML, download, crawlers): revalidated on each use. */
export function rawArtifactHref(id: string) {
  return `/research/raw/${id}`;
}

/** Content-addressed raw URL for iframes: cached by browsers and the CDN. */
export function versionedArtifactHref(id: string, sha256: string) {
  return `${rawArtifactHref(id)}?v=${artifactVersion(sha256)}`;
}

/** Vercel CDN cache tag carried by raw responses, purged on mutation. */
export function artifactCacheTag(id: string) {
  return `research-artifact-${id}`;
}
