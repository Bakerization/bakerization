import { neon } from "@neondatabase/serverless";
import { revalidatePath } from "next/cache";
import type { NewsItem, NewsSummary } from "@/lib/news-types";

// Raw SQL on Neon. DDL runs only on writes and in `npm run ensure:tables`;
// reads tolerate a missing table.

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  return neon(url);
}

let ensureTablePromise: Promise<void> | null = null;

export async function ensureNewsTable() {
  if (!ensureTablePromise) {
    const sql = getSql();
    ensureTablePromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS news_posts (
          slug TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          title_en TEXT NOT NULL DEFAULT '',
          summary TEXT NOT NULL DEFAULT '',
          summary_en TEXT NOT NULL DEFAULT '',
          body_md TEXT NOT NULL DEFAULT '',
          body_md_en TEXT NOT NULL DEFAULT '',
          cover_image_url TEXT NOT NULL DEFAULT '',
          published BOOLEAN NOT NULL DEFAULT FALSE,
          published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS news_posts_published_at_idx
        ON news_posts (published, published_at DESC)
      `;
    })().catch((error) => {
      ensureTablePromise = null;
      throw error;
    });
  }
  await ensureTablePromise;
}

/** Reads on a brand-new database (table missing) return `fallback` instead of throwing. */
function withTable<T>(fallback: T, fn: () => Promise<T>): Promise<T> {
  return fn().catch((error: unknown) => {
    if ((error as { code?: string } | null)?.code === "42P01") return fallback;
    throw error;
  });
}

function toProxyUrl(pathname: string) {
  return `/api/blob/${pathname.split("/").map(encodeURIComponent).join("/")}`;
}

function resolveAssetUrl(value: string) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http") || trimmed.startsWith("/api/blob/")) return trimmed;
  return toProxyUrl(trimmed.replace(/^\/+/, ""));
}

function iso(value: string | Date) {
  return new Date(value).toISOString();
}

type DbNewsRow = {
  slug: string;
  title: string;
  title_en: string;
  summary: string;
  summary_en: string;
  body_md: string;
  body_md_en: string;
  cover_image_url: string;
  published: boolean;
  published_at: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
};

type DbSummaryRow = Omit<DbNewsRow, "body_md" | "body_md_en"> & { has_en: boolean };

function mapRow(row: DbNewsRow): NewsItem {
  return {
    slug: row.slug,
    title: row.title,
    titleEn: row.title_en || "",
    summary: row.summary || "",
    summaryEn: row.summary_en || "",
    bodyMd: row.body_md || "",
    bodyMdEn: row.body_md_en || "",
    coverImageUrl: resolveAssetUrl(row.cover_image_url),
    published: row.published,
    publishedAt: iso(row.published_at),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function mapSummary(row: DbSummaryRow): NewsSummary {
  return {
    slug: row.slug,
    title: row.title,
    titleEn: row.title_en || "",
    summary: row.summary || "",
    summaryEn: row.summary_en || "",
    coverImageUrl: resolveAssetUrl(row.cover_image_url),
    published: row.published,
    publishedAt: iso(row.published_at),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    hasEnglish: Boolean(row.has_en),
  };
}

/** News without the Markdown bodies, newest `published_at` first. */
export async function listNewsSummaries(
  opts: { includeUnpublished?: boolean; limit?: number } = {}
): Promise<NewsSummary[]> {
  if (!hasDatabaseUrl()) return [];
  const limit = Math.min(Math.max(Math.trunc(opts.limit ?? 1000), 1), 1000);
  return withTable([], async () => {
    const sql = getSql();
    const rows = (opts.includeUnpublished
      ? await sql`
          SELECT slug, title, title_en, summary, summary_en, cover_image_url, published,
                 published_at, created_at, updated_at,
                 (btrim(title_en) <> '' AND btrim(body_md_en) <> '') AS has_en
          FROM news_posts
          ORDER BY published_at DESC, created_at DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT slug, title, title_en, summary, summary_en, cover_image_url, published,
                 published_at, created_at, updated_at,
                 (btrim(title_en) <> '' AND btrim(body_md_en) <> '') AS has_en
          FROM news_posts
          WHERE published = TRUE
          ORDER BY published_at DESC, created_at DESC
          LIMIT ${limit}
        `) as DbSummaryRow[];
    return rows.map(mapSummary);
  });
}

export async function getNews(slug: string): Promise<NewsItem | null> {
  if (!hasDatabaseUrl()) return null;
  return withTable(null, async () => {
    const rows = (await getSql()`
      SELECT slug, title, title_en, summary, summary_en, body_md, body_md_en, cover_image_url,
             published, published_at, created_at, updated_at
      FROM news_posts
      WHERE slug = ${slug}
      LIMIT 1
    `) as DbNewsRow[];
    return rows[0] ? mapRow(rows[0]) : null;
  });
}

/**
 * Purges every prerendered page that shows news (internal route patterns, as
 * the public URLs are rewritten to /[locale]/…). Only valid inside a request.
 */
function revalidateNews() {
  try {
    revalidatePath("/[locale]/news", "layout"); // /news and /news/[slug], both languages
    revalidatePath("/[locale]", "page"); // home teaser
    revalidatePath("/sitemap.xml");
  } catch (error) {
    console.error("[news-store] revalidate failed", error);
  }
}

/** Inserts a new item. Returns false (and writes nothing) when the slug is taken. */
export async function createNews(item: NewsItem): Promise<boolean> {
  await ensureNewsTable();
  const rows = (await getSql()`
    INSERT INTO news_posts (
      slug, title, title_en, summary, summary_en, body_md, body_md_en, cover_image_url,
      published, published_at, created_at, updated_at
    )
    VALUES (
      ${item.slug}, ${item.title}, ${item.titleEn}, ${item.summary}, ${item.summaryEn},
      ${item.bodyMd}, ${item.bodyMdEn}, ${item.coverImageUrl}, ${item.published},
      ${item.publishedAt}, NOW(), NOW()
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING slug
  `) as { slug: string }[];
  if (rows.length > 0) revalidateNews();
  return rows.length > 0;
}

/** Updates an existing item (the slug never changes). Returns false when it doesn't exist. */
export async function updateNews(item: NewsItem): Promise<boolean> {
  await ensureNewsTable();
  const rows = (await getSql()`
    UPDATE news_posts SET
      title = ${item.title},
      title_en = ${item.titleEn},
      summary = ${item.summary},
      summary_en = ${item.summaryEn},
      body_md = ${item.bodyMd},
      body_md_en = ${item.bodyMdEn},
      cover_image_url = ${item.coverImageUrl},
      published = ${item.published},
      published_at = ${item.publishedAt},
      updated_at = NOW()
    WHERE slug = ${item.slug}
    RETURNING slug
  `) as { slug: string }[];
  if (rows.length > 0) revalidateNews();
  return rows.length > 0;
}

export async function deleteNews(slug: string): Promise<boolean> {
  await ensureNewsTable();
  const rows = (await getSql()`
    DELETE FROM news_posts WHERE slug = ${slug} RETURNING slug
  `) as { slug: string }[];
  if (rows.length > 0) revalidateNews();
  return rows.length > 0;
}
