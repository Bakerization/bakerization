import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { BlogPost } from "@/lib/blog-types";

const BLOG_ASSET_PREFIX = "blog-assets/";
function getBlobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return url;
}

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function getSql() {
  return neon(getDatabaseUrl());
}

let ensureTablePromise: Promise<void> | null = null;

function toProxyUrl(pathname: string) {
  const encodedPath = pathname.split("/").map(encodeURIComponent).join("/");
  return `/api/blob/${encodedPath}`;
}

function sanitizeAssetPrefix(prefix?: string) {
  const cleaned = (prefix || BLOG_ASSET_PREFIX).trim().replace(/^\/+/, "");
  if (!cleaned.startsWith(BLOG_ASSET_PREFIX) || cleaned.includes("..")) {
    return BLOG_ASSET_PREFIX;
  }
  return cleaned.endsWith("/") ? cleaned : `${cleaned}/`;
}

function resolveAssetUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.startsWith("http") || trimmed.startsWith("/api/blob/")) {
    return trimmed;
  }
  return toProxyUrl(trimmed.replace(/^\/+/, ""));
}

async function ensureBlogTable() {
  if (!ensureTablePromise) {
    const sql = getSql();
    ensureTablePromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS blog_posts (
          slug TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          title_en TEXT NOT NULL DEFAULT '',
          excerpt TEXT NOT NULL DEFAULT '',
          excerpt_en TEXT NOT NULL DEFAULT '',
          hero_image_url TEXT NOT NULL DEFAULT '',
          content_html TEXT NOT NULL DEFAULT '',
          content_html_en TEXT NOT NULL DEFAULT '',
          published BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        ALTER TABLE blog_posts
        ADD COLUMN IF NOT EXISTS title_en TEXT NOT NULL DEFAULT ''
      `;
      await sql`
        ALTER TABLE blog_posts
        ADD COLUMN IF NOT EXISTS excerpt_en TEXT NOT NULL DEFAULT ''
      `;
      await sql`
        ALTER TABLE blog_posts
        ADD COLUMN IF NOT EXISTS content_html_en TEXT NOT NULL DEFAULT ''
      `;
    })();
  }

  await ensureTablePromise;
}

type DbBlogPostRow = {
  slug: string;
  title: string;
  title_en: string;
  excerpt: string;
  excerpt_en: string;
  hero_image_url: string;
  content_html: string;
  content_html_en: string;
  published: boolean;
  created_at: string | Date;
  updated_at: string | Date;
};

function mapDbRowToBlogPost(row: DbBlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    titleEn: row.title_en || "",
    excerpt: row.excerpt,
    excerptEn: row.excerpt_en || "",
    heroImageUrl: resolveAssetUrl(row.hero_image_url),
    contentHtml: row.content_html.replaceAll(/src="blob:([^"]+)"/g, 'src="$1"'),
    contentHtmlEn: (row.content_html_en || "").replaceAll(
      /src="blob:([^"]+)"/g,
      'src="$1"'
    ),
    published: row.published,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function toDateOrNow(value: string | undefined) {
  const parsed = value ? new Date(value) : new Date();
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
}

export async function listPosts(includeUnpublished = false) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  await ensureBlogTable();
  const sql = getSql();

  const rows = (includeUnpublished
    ? await sql`
        SELECT slug, title, title_en, excerpt, excerpt_en, hero_image_url, content_html, content_html_en, published, created_at, updated_at
        FROM blog_posts
        ORDER BY updated_at DESC
      `
    : await sql`
        SELECT slug, title, title_en, excerpt, excerpt_en, hero_image_url, content_html, content_html_en, published, created_at, updated_at
        FROM blog_posts
        WHERE published = TRUE
        ORDER BY updated_at DESC
      `) as DbBlogPostRow[];

  return rows.map(mapDbRowToBlogPost);
}

export async function getPost(slug: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  await ensureBlogTable();
  const sql = getSql();

  const rows = (await sql`
    SELECT slug, title, title_en, excerpt, excerpt_en, hero_image_url, content_html, content_html_en, published, created_at, updated_at
    FROM blog_posts
    WHERE slug = ${slug}
    LIMIT 1
  `) as DbBlogPostRow[];

  if (!rows[0]) {
    return null;
  }

  return mapDbRowToBlogPost(rows[0]);
}

export async function savePost(post: BlogPost) {
  await ensureBlogTable();
  const sql = getSql();

  await sql`
    INSERT INTO blog_posts (
      slug, title, title_en, excerpt, excerpt_en, hero_image_url, content_html, content_html_en, published, created_at, updated_at
    )
    VALUES (
      ${post.slug},
      ${post.title},
      ${post.titleEn || ""},
      ${post.excerpt},
      ${post.excerptEn || ""},
      ${post.heroImageUrl},
      ${post.contentHtml},
      ${post.contentHtmlEn || ""},
      ${post.published},
      ${toDateOrNow(post.createdAt).toISOString()},
      ${toDateOrNow(post.updatedAt).toISOString()}
    )
    ON CONFLICT (slug)
    DO UPDATE SET
      title = EXCLUDED.title,
      title_en = EXCLUDED.title_en,
      excerpt = EXCLUDED.excerpt,
      excerpt_en = EXCLUDED.excerpt_en,
      hero_image_url = EXCLUDED.hero_image_url,
      content_html = EXCLUDED.content_html,
      content_html_en = EXCLUDED.content_html_en,
      published = EXCLUDED.published,
      updated_at = EXCLUDED.updated_at
  `;
}

export async function uploadBlogAsset(file: File, prefix = BLOG_ASSET_PREFIX) {
  const token = getBlobToken();
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  }

  const fileExt = file.name.split(".").pop() || "bin";
  const fileBaseName = file.name.replace(/\.[^/.]+$/, "").toLowerCase();
  const sanitizedBase = fileBaseName.replace(/[^a-z0-9_-]+/g, "-");
  const safePrefix = sanitizeAssetPrefix(prefix);
  const path = `${safePrefix}${Date.now()}-${sanitizedBase}.${fileExt}`;

  const uploaded = await put(path, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type || "application/octet-stream",
    token,
  });

  return toProxyUrl(uploaded.pathname);
}
