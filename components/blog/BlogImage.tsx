import Image from "next/image";
import type { CSSProperties } from "react";

type Props = {
  src: string;
  alt: string;
  /**
   * Rendered width hints for next/image, e.g. "(max-width: 880px) 100vw, 400px".
   * Use plain `NNvw` terms (not calc()): next/image only derives the srcset
   * from those, and without one it emits every icon-sized candidate too.
   */
  sizes: string;
  /** Above the fold: preload instead of lazy-load. */
  priority?: boolean;
  style?: CSSProperties;
  /** Fixed box (thumbnails); otherwise fills a `position: relative` parent. */
  width?: number;
  height?: number;
};

/**
 * Blog images are uploads served through /api/blob/…; next/image resizes and
 * converts them (AVIF/WebP) and Vercel caches every variant. An external URL
 * pasted by an admin isn't on the optimizer's allow-list, so it falls back to
 * a plain lazy <img>.
 */
export default function BlogImage({ src, alt, sizes, priority, style, width, height }: Props) {
  if (!src.startsWith("/api/blob/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        width={width}
        height={height}
        style={style}
      />
    );
  }
  if (width && height) {
    return <Image src={src} alt={alt} width={width} height={height} sizes={sizes} style={style} />;
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} style={style} />;
}
