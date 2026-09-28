import { createHash } from "node:crypto";

export const MAX_HTML_BYTES = 2 * 1024 * 1024; // 2 MB (Vercel body cap is 4.5 MB)
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2000;

export type HtmlValidation =
  | { ok: true; html: string; sizeBytes: number; sha256: string }
  | { ok: false; error: string; status: 400 | 413 };

export function sha256Hex(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/**
 * Validates an artifact's HTML. No sanitising happens here: isolation comes from
 * the sandboxed iframe + CSP on the raw route, not from rewriting the markup.
 */
export function validateArtifactHtml(input: unknown): HtmlValidation {
  if (typeof input !== "string") {
    return { ok: false, error: "html must be a string", status: 400 };
  }
  // Strip a UTF-8 BOM and normalise line endings.
  const html = input.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  if (!html.trim()) {
    return { ok: false, error: "html is empty", status: 400 };
  }
  if (html.includes("\0")) {
    return { ok: false, error: "html contains a NUL byte", status: 400 };
  }
  const sizeBytes = Buffer.byteLength(html, "utf8");
  if (sizeBytes > MAX_HTML_BYTES) {
    return {
      ok: false,
      error: `html exceeds ${MAX_HTML_BYTES} bytes (${sizeBytes})`,
      status: 413,
    };
  }
  if (!/<(!doctype|html|head|body|div|main|section|script|svg|p|h1|table)\b/i.test(html)) {
    return { ok: false, error: "html does not look like an HTML document", status: 400 };
  }
  return { ok: true, html, sizeBytes, sha256: sha256Hex(html) };
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(value: string) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    const lower = entity.toLowerCase();
    if (lower.startsWith("#x")) {
      const code = parseInt(lower.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    if (lower.startsWith("#")) {
      const code = parseInt(lower.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return ENTITIES[lower] ?? match;
  });
}

function collapse(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

/** Title from <title>, else the first <h1>, else the fallback. */
export function deriveTitle(html: string, fallback = "Untitled") {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const raw = title?.trim() || (h1 ? h1.replace(/<[^>]+>/g, "") : "");
  const cleaned = collapse(decodeEntities(raw));
  return (cleaned || fallback).slice(0, MAX_TITLE_LENGTH);
}

export function normalizeTitle(value: unknown, html?: string) {
  const given = typeof value === "string" ? collapse(value) : "";
  if (given) return given.slice(0, MAX_TITLE_LENGTH);
  return html ? deriveTitle(html) : "Untitled";
}

export function normalizeDescription(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n?/g, "\n").trim().slice(0, MAX_DESCRIPTION_LENGTH);
}
