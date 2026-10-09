import type { NewsItem } from "@/lib/news-types";
import { SITE_URL } from "@/lib/site";
import { toSlug } from "@/lib/slug";

// Shared by the admin editor's API (app/api/news/route.ts) and the MCP news
// tools (app/api/mcp/route.ts), so both write the same shape of item.

export const MAX_NEWS_TITLE = 200;
export const MAX_NEWS_SUMMARY = 400;
export const MAX_NEWS_BODY = 60_000;

export type NewsInput = Partial<Omit<NewsItem, "createdAt" | "updatedAt">>;

export type NewsInputResult = { ok: true; item: NewsItem } | { ok: false; error: string; status: number };

function str(value: unknown) {
  return typeof value === "string" ? value : "";
}

/** ASCII-only slug; Japanese titles fall back to a dated one. */
export function makeNewsSlug(input: Pick<NewsInput, "slug" | "titleEn">) {
  const candidate = str(input.slug).trim() || str(input.titleEn).trim();
  const slug = candidate ? toSlug(candidate).replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") : "";
  if (slug) return slug.slice(0, 80);
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `news-${day}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Cover images must be absolute https URLs or our own blob proxy paths. */
function isAllowedCover(url: string) {
  if (!url || url.startsWith("/api/blob/")) return true;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

/** Validate and normalize a create/update payload into a full NewsItem. */
export function buildNewsItem(input: NewsInput, mode: "create" | "update"): NewsInputResult {
  const title = str(input.title).trim();
  if (!title) return { ok: false, error: "タイトルを入力してください。", status: 400 };

  const publishedAt = new Date(str(input.publishedAt) || Date.now());
  if (Number.isNaN(publishedAt.getTime())) return { ok: false, error: "掲載日が不正です。", status: 400 };

  const slug = mode === "update" ? str(input.slug).trim() : makeNewsSlug(input);
  if (!slug) return { ok: false, error: "slug is required", status: 400 };

  const coverImageUrl = str(input.coverImageUrl).trim();
  if (!isAllowedCover(coverImageUrl)) {
    return { ok: false, error: "カバー画像は https:// の URL かアップロード済み画像にしてください。", status: 400 };
  }

  const now = new Date().toISOString();
  const item: NewsItem = {
    slug,
    title,
    titleEn: str(input.titleEn).trim(),
    summary: str(input.summary).trim(),
    summaryEn: str(input.summaryEn).trim(),
    bodyMd: str(input.bodyMd),
    bodyMdEn: str(input.bodyMdEn),
    coverImageUrl,
    published: Boolean(input.published),
    publishedAt: publishedAt.toISOString(),
    createdAt: now,
    updatedAt: now,
  };

  if (item.title.length > MAX_NEWS_TITLE || item.titleEn.length > MAX_NEWS_TITLE) {
    return { ok: false, error: `タイトルは${MAX_NEWS_TITLE}文字以内にしてください。`, status: 400 };
  }
  if (item.summary.length > MAX_NEWS_SUMMARY || item.summaryEn.length > MAX_NEWS_SUMMARY) {
    return { ok: false, error: `要約は${MAX_NEWS_SUMMARY}文字以内にしてください。`, status: 400 };
  }
  if (item.bodyMd.length > MAX_NEWS_BODY || item.bodyMdEn.length > MAX_NEWS_BODY) {
    return { ok: false, error: `本文は${MAX_NEWS_BODY.toLocaleString("en-US")}文字以内にしてください。`, status: 400 };
  }

  return { ok: true, item };
}

/** Public URL of a news item; English uses the ?lang=en form of the clean URL. */
export function newsUrl(slug: string, locale: "ja" | "en" = "ja") {
  const url = `${SITE_URL}/news/${encodeURIComponent(slug)}`;
  return locale === "en" ? `${url}?lang=en` : url;
}
