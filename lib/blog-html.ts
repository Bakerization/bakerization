import sanitizeHtml from "sanitize-html";

export const BLOG_VIDEO_HOSTS = ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"];

/** Treat archived HTML as content: retain prose, photos and video, never scripts. */
export function sanitizeBlogHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "iframe", "del", "s", "sub", "sup"],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading", "decoding"],
      iframe: ["src", "title", "width", "height", "allowfullscreen", "loading"],
      "*": ["id"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"], iframe: ["https"] },
    allowProtocolRelative: false,
    allowedIframeHostnames: BLOG_VIDEO_HOSTS,
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, rel: "noopener noreferrer" } }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy", decoding: "async" } }),
      iframe: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
      // JUGEM's old editor sometimes wrapped the entire article in h1/font spans.
      h1: "h2",
    },
  });
}
