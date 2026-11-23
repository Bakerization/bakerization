import { load } from "cheerio";
import { sanitizeBlogHtml } from "./blog-html";

/** Translate text nodes only. Links, images, document structure and original HTML remain intact. */
export function planBlogTranslation(
  title: string,
  excerpt: string,
  html: string,
) {
  const $ = load(sanitizeBlogHtml(html), {}, false);
  const strings = [title, excerpt];
  const setters: ((text: string) => void)[] = [() => {}, () => {}];
  function walk(node: any) {
    if (node.type === "text" && node.data?.trim()) {
      const leading = node.data.match(/^\s*/)[0],
        trailing = node.data.match(/\s*$/)[0];
      strings.push(node.data.trim());
      setters.push((text) => {
        node.data = leading + text + trailing;
      });
    }
    for (const child of node.children || []) walk(child);
  }
  walk($.root()[0]);
  $("img[alt]").each((_, e) => {
    const img = $(e),
      alt = img.attr("alt")!.trim();
    if (alt) {
      strings.push(alt);
      setters.push((text) => {
        img.attr("alt", text);
      });
    }
  });
  return {
    strings,
    render(translated: string[]) {
      if (translated.length !== strings.length)
        throw Error("Translation segment mismatch");
      translated.forEach((text, i) => setters[i](text));
      return {
        title: translated[0],
        excerpt: translated[1],
        contentHtml: sanitizeBlogHtml($.html()),
      };
    },
  };
}
