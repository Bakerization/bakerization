// Widths from Next's default deviceSizes, so the optimizer serves them from cache.
const CONTENT_IMAGE_WIDTHS = [640, 828, 1080, 1200, 1920];

/**
 * For an upload (/api/blob/…): a src + srcset through Next's image optimizer so
 * phones get a 640 px AVIF instead of the original. Null for any other URL.
 * `sizes` is the rendered width hint of the column the image sits in.
 */
export function blobImageSources(src: string, sizes: string) {
  if (!src.startsWith("/api/blob/")) return null;
  const url = encodeURIComponent(src);
  return {
    src: `/_next/image?url=${url}&w=1200&q=75`,
    srcSet: CONTENT_IMAGE_WIDTHS.map((w) => `/_next/image?url=${url}&w=${w}&q=75 ${w}w`).join(", "),
    sizes,
  };
}
