import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { blobImageSources } from "@/lib/content-utils";

// Renders a news body (GFM Markdown). No hooks, so it works both in the public
// server components (zero client JS) and in the editor's live preview.
// react-markdown never renders raw HTML and strips javascript: URLs.

const NEWS_IMAGE_SIZES = "(max-width: 880px) 100vw, 760px";

function isExternal(href: string) {
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    const host = new URL(href).hostname;
    return host !== "bakerization.com" && !host.endsWith(".bakerization.com");
  } catch {
    return true;
  }
}

const components: Components = {
  a({ href, children, node: _node, ...rest }) {
    const url = href || "";
    return isExternal(url) ? (
      <a {...rest} href={url} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ) : (
      <a {...rest} href={url}>
        {children}
      </a>
    );
  },
  img({ src, alt, title, node: _node }) {
    const url = typeof src === "string" ? src : "";
    if (!url) return null;
    const opt = blobImageSources(url, NEWS_IMAGE_SIZES);
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={opt?.src ?? url}
        srcSet={opt?.srcSet}
        sizes={opt?.sizes}
        alt={alt || ""}
        title={title}
        loading="lazy"
        decoding="async"
      />
    );
  },
  table({ children, node: _node, ...rest }) {
    return (
      <div className="news-table-wrap">
        <table {...rest}>{children}</table>
      </div>
    );
  },
};

export default function NewsMarkdown({ source }: { source: string }) {
  return (
    <div className="rich-content news-content">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </Markdown>
    </div>
  );
}
