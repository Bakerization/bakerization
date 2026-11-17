import { neon } from "@neondatabase/serverless";
import type { BlogPost, BlogPostSummary } from "@/lib/blog-types";

export const BLOG_PAGE_SIZE = 24;
function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  return neon(process.env.DATABASE_URL);
}

/** Additive migration: preserve every pre-existing Bakerization post. */
export async function ensureBlogTable() {
  const sql = getSql();
  await sql`CREATE TABLE IF NOT EXISTS blog_posts (
    slug TEXT PRIMARY KEY, title TEXT NOT NULL, title_en TEXT NOT NULL DEFAULT '',
    excerpt TEXT NOT NULL DEFAULT '', excerpt_en TEXT NOT NULL DEFAULT '',
    hero_image_url TEXT NOT NULL DEFAULT '', content_html TEXT NOT NULL DEFAULT '',
    content_html_en TEXT NOT NULL DEFAULT '', published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`ALTER TABLE blog_posts
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS source_url TEXT,
    ADD COLUMN IF NOT EXISTS author_name TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS source_html TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS source_hash TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS original_date TEXT NOT NULL DEFAULT ''`;
  await sql`UPDATE blog_posts SET published_at = created_at WHERE published_at IS NULL`;
  await sql`ALTER TABLE blog_posts ALTER COLUMN published_at SET NOT NULL, ALTER COLUMN published_at SET DEFAULT NOW()`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_source_url_idx ON blog_posts (source_url) WHERE source_url IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS blog_posts_published_date_idx ON blog_posts (published, published_at DESC, slug)`;
}

type DbRow = {
  slug: string; title: string; title_en: string; excerpt: string; excerpt_en: string;
  hero_image_url: string; content_html?: string; content_html_en?: string; published: boolean;
  published_at: string | Date; created_at: string | Date; updated_at: string | Date;
  source_url: string | null; author_name: string; category: string; has_en?: boolean;
};
function mapRow(row: DbRow): BlogPost {
  const hero = row.hero_image_url || "";
  return {
    slug: row.slug, title: row.title, titleEn: row.title_en || "",
    excerpt: row.excerpt || "", excerptEn: row.excerpt_en || "",
    heroImageUrl: hero && !hero.startsWith("http") && !hero.startsWith("/") ? `/api/blob/${hero}` : hero,
    contentHtml: row.content_html || "", contentHtmlEn: row.content_html_en || "",
    published: row.published, publishedAt: new Date(row.published_at).toISOString(),
    createdAt: new Date(row.created_at).toISOString(), updatedAt: new Date(row.updated_at).toISOString(),
    sourceUrl: row.source_url || "", authorName: row.author_name || "Bakerization", category: row.category || "",
  };
}
function summary(row: DbRow): BlogPostSummary {
  const { contentHtml: _body, contentHtmlEn: _bodyEn, ...post } = mapRow(row);
  return { ...post, hasEnglish: Boolean(row.has_en) };
}

/** Full summaries for sitemap only; never truncate the archive at 1,000 entries. */
export async function listPostSummaries(): Promise<BlogPostSummary[]> {
  if (!process.env.DATABASE_URL) return [];
  const rows = await getSql()`SELECT slug, title, title_en, excerpt, excerpt_en, hero_image_url,
    published, published_at, created_at, updated_at, source_url, author_name, category,
    (btrim(title_en) <> '' AND btrim(content_html_en) <> '') AS has_en
    FROM blog_posts WHERE published = TRUE ORDER BY published_at DESC, slug DESC`;
  return (rows as DbRow[]).map(summary);
}

export async function getBlogPage(page = 1) {
  if (!Number.isSafeInteger(page) || page < 1) throw new Error("Invalid blog page");
  if (!process.env.DATABASE_URL) return { posts: [] as BlogPostSummary[], total: 0, pageCount: 1 };
  const sql = getSql();
  const [counts, rows] = await Promise.all([
    sql`SELECT count(*)::int AS count FROM blog_posts WHERE published = TRUE`,
    sql`SELECT slug, title, title_en, excerpt, excerpt_en, hero_image_url,
      published, published_at, created_at, updated_at, source_url, author_name, category,
      (btrim(title_en) <> '' AND btrim(content_html_en) <> '') AS has_en
      FROM blog_posts WHERE published = TRUE ORDER BY published_at DESC, slug DESC
      LIMIT ${BLOG_PAGE_SIZE} OFFSET ${(page - 1) * BLOG_PAGE_SIZE}`,
  ]);
  const total = Number(counts[0].count);
  return { posts: (rows as DbRow[]).map(summary), total, pageCount: Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE)) };
}

/** Public reads always exclude drafts, including the legacy /api/blog/post route. */
export async function getPost(slug: string): Promise<BlogPost | null> {
  if (!process.env.DATABASE_URL) return null;
  const rows = await getSql()`SELECT slug, title, title_en, excerpt, excerpt_en, hero_image_url,
    content_html, content_html_en, published, published_at, created_at, updated_at,
    source_url, author_name, category FROM blog_posts WHERE slug = ${slug} AND published = TRUE LIMIT 1`;
  return rows[0] ? mapRow(rows[0] as DbRow) : null;
}

/** Adjacent articles without loading thousands of summaries for every article. */
export async function getAdjacentPosts(post: BlogPost) {
  const sql = getSql();
  const [older, newer] = await Promise.all([
    sql`SELECT slug, title FROM blog_posts WHERE published = TRUE AND
      (published_at, slug) < (${post.publishedAt}::timestamptz, ${post.slug})
      ORDER BY published_at DESC, slug DESC LIMIT 1`,
    sql`SELECT slug, title FROM blog_posts WHERE published = TRUE AND
      (published_at, slug) > (${post.publishedAt}::timestamptz, ${post.slug})
      ORDER BY published_at ASC, slug ASC LIMIT 1`,
  ]);
  return { older: older[0] as { slug: string; title: string } | undefined, newer: newer[0] as { slug: string; title: string } | undefined };
}
