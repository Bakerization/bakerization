import { TocItem } from "@/lib/blog-types";
import { toSlug } from "@/lib/slug";

function stripTags(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

// Widths from Next's default deviceSizes, so the optimizer serves them from cache.
const CONTENT_IMAGE_WIDTHS = [640, 828, 1080, 1200, 1920];
// The article column: 1280 max − 128 padding − 280 TOC − 56 gap ≈ 816 px.
const CONTENT_IMAGE_SIZES = "(max-width: 880px) calc(100vw - 40px), 816px";

/**
 * For an upload (/api/blob/…): a src + srcset through Next's image optimizer so
 * phones get a 640 px AVIF instead of the original. Null for any other URL.
 */
export function blobImageSources(src: string, sizes = CONTENT_IMAGE_SIZES) {
  if (!src.startsWith("/api/blob/")) return null;
  const url = encodeURIComponent(src);
  return {
    src: `/_next/image?url=${url}&w=1200&q=75`,
    srcSet: CONTENT_IMAGE_WIDTHS.map((w) => `/_next/image?url=${url}&w=${w}&q=75 ${w}w`).join(", "),
    sizes,
  };
}

/**
 * Makes the editor's <img> tags cheap to load: lazy + async decoding, and for
 * uploads a srcset through the image optimizer (see blobImageSources).
 */
export function optimizeContentImages(html: string): string {
  return html.replace(/<img\b([^>]*?)\s*\/?>/gi, (_tag, attrs: string) => {
    let a = attrs;
    if (!/\bloading=/i.test(a)) a += ' loading="lazy"';
    if (!/\bdecoding=/i.test(a)) a += ' decoding="async"';
    const src = a.match(/\bsrc="(\/api\/blob\/[^"]+)"/i);
    const opt = src && !/\bsrcset=/i.test(a) ? blobImageSources(src[1]) : null;
    if (src && opt) {
      a = a.replace(src[0], `src="${opt.src}" srcset="${opt.srcSet}" sizes="${opt.sizes}"`);
    }
    return `<img${a}>`;
  });
}

export function enrichHtmlWithToc(contentHtml: string): {
  html: string;
  toc: TocItem[];
} {
  const used = new Map<string, number>();
  const toc: TocItem[] = [];

  const html = contentHtml.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gim,
    (_, levelRaw: string, attrs: string, inner: string) => {
      const level = Number(levelRaw) as 2 | 3;
      const text = stripTags(inner);
      const base = toSlug(text || `section-${toc.length + 1}`);
      const count = (used.get(base) || 0) + 1;
      used.set(base, count);
      const id = count === 1 ? base : `${base}-${count}`;

      toc.push({ id, text: text || "Untitled", level });

      const attrsWithoutId = attrs.replace(/\sid=("[^"]*"|'[^']*')/gi, "");
      return `<h${level} id="${id}"${attrsWithoutId}>${inner}</h${level}>`;
    }
  );

  return { html, toc };
}
