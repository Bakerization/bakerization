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
