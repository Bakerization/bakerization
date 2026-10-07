/**
 * The browser-facing pathname. During prerendering and behind the proxy's
 * member rewrite, `usePathname()` on the server sees the *internal* path
 * (`/ja/about`, `/en/m/research/...`); in the browser it is the public URL.
 * Stripping the internal prefixes keeps server and client branches identical
 * (no hydration mismatch). Every `usePathname()` consumer must use this.
 */
export function toPublicPathname(pathname: string): string {
  return (
    pathname
      .replace(/^\/(?:ja|en)(?=\/|$)/, "")
      .replace(/^\/m(?=\/|$)/, "") || "/"
  );
}
