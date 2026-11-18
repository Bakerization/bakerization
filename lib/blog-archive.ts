import { cache } from "react";
import { BLOG_PAGE_SIZE, mapBlogSummary, type DbRow } from "@/lib/blog-store";
import { ikedaSql } from "@/lib/ikeda-schema";
import { IKEDA, IKEDA_THEMES } from "@/lib/ikeda-config";
import type { Thought } from "@/lib/ikeda-types";

export type ArchiveFilter = {
  year?: number;
  theme?: string;
  q: string;
  order: "asc" | "desc";
  page: number;
};
export type SearchParams = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;
export function archiveFilters(params: SearchParams): ArchiveFilter {
  const year = Number(first(params.year));
  const page = Number(first(params.page));
  const theme = first(params.theme);
  return {
    year:
      Number.isInteger(year) && year >= 2009 && year <= 2100 ? year : undefined,
    theme: IKEDA_THEMES.some((t) => t.id === theme) ? theme : undefined,
    q: (first(params.q) || "").trim().slice(0, 100),
    order: first(params.order) === "asc" ? "asc" : "desc",
    page: Number.isSafeInteger(page) && page > 0 && page < 10000 ? page : 1,
  };
}
export function archiveHref(
  filter: ArchiveFilter,
  patch: Partial<ArchiveFilter> = {},
) {
  const f = { ...filter, ...patch };
  const p = new URLSearchParams();
  if (f.year) p.set("year", String(f.year));
  if (f.theme) p.set("theme", f.theme);
  if (f.q) p.set("q", f.q);
  if (f.order === "asc") p.set("order", "asc");
  if (f.page > 1) {
    if (!p.size) return `/blog/page/${f.page}`;
    p.set("page", String(f.page));
  }
  return `/blog${p.size ? `?${p}` : ""}`;
}
export const getArchiveOverview = cache(async () => {
  const sql = ikedaSql();
  const [years, themes, stats] = await Promise.all([
    sql`SELECT EXTRACT(YEAR FROM published_at AT TIME ZONE 'Asia/Tokyo')::int AS year, count(*)::int AS count
      FROM blog_posts WHERE published = TRUE GROUP BY year ORDER BY year DESC`,
    sql`SELECT topic, count(*)::int AS count FROM ikeda_documents d JOIN blog_posts p ON p.slug = d.post_slug,
      unnest(d.themes) AS topic WHERE p.published = TRUE AND d.source_hash = p.source_hash AND d.index_version = ${IKEDA.version} GROUP BY topic`,
    sql`SELECT count(*)::int AS count, min(published_at) AS first, max(published_at) AS last FROM blog_posts WHERE published = TRUE`,
  ]);
  return {
    years: years as { year: number; count: number }[],
    themes: themes as { topic: string; count: number }[],
    total: Number(stats[0].count),
  };
});

export async function getArchivePage(filter: ArchiveFilter) {
  const sql = ikedaSql();
  const values: unknown[] = [];
  const value = (input: unknown) => {
    values.push(input);
    return `$${values.length}`;
  };
  const where = ["p.published = TRUE"];
  if (filter.year) {
    where.push(
      `p.published_at >= ${value(`${filter.year}-01-01T00:00:00+09:00`)}::timestamptz AND p.published_at < ${value(`${filter.year + 1}-01-01T00:00:00+09:00`)}::timestamptz`,
    );
  }
  if (filter.theme) where.push(`${value(filter.theme)} = ANY(d.themes)`);
  if (filter.q) {
    const pattern = value(`%${filter.q.replace(/[\\%_]/g, "\\$&")}%`);
    where.push(
      `(p.title ILIKE ${pattern} OR COALESCE(d.body_text,p.excerpt) ILIKE ${pattern})`,
    );
  }
  const from = `FROM blog_posts p LEFT JOIN ikeda_documents d ON d.post_slug = p.slug AND d.source_hash = p.source_hash AND d.index_version = ${IKEDA.version} WHERE ${where.join(" AND ")}`;
  const counts = await sql.query(
    `SELECT count(*)::int AS count ${from}`,
    values,
  );
  const total = Number(counts[0].count);
  const sort = filter.order === "asc" ? "ASC" : "DESC";
  const queryValues = [
    ...values,
    BLOG_PAGE_SIZE,
    (filter.page - 1) * BLOG_PAGE_SIZE,
  ];
  const rows = await sql.query(
    `SELECT p.slug,p.title,p.title_en,p.excerpt,p.excerpt_en,p.hero_image_url,p.published,p.published_at,p.created_at,p.updated_at,p.source_url,p.author_name,p.category,
    (btrim(p.title_en)<>'' AND btrim(p.content_html_en)<>'') AS has_en,
    d.thought->>'question' AS thought_question ${from}
    ORDER BY p.published_at ${sort},p.slug ${sort} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    queryValues,
  );
  return {
    posts: rows.map((r) => ({
      ...mapBlogSummary(r as DbRow),
      thoughtQuestion: String(r.thought_question || ""),
    })),
    total,
    pageCount: Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE)),
  };
}

export async function getArticleThought(slug: string): Promise<Thought | null> {
  const rows =
    await ikedaSql()`SELECT d.thought FROM ikeda_documents d JOIN blog_posts p ON p.slug = d.post_slug
    WHERE p.slug = ${slug} AND p.published = TRUE AND d.source_hash = p.source_hash AND d.index_version = ${IKEDA.version} LIMIT 1`;
  return (rows[0]?.thought as Thought) || null;
}
