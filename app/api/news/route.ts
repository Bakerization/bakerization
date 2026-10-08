import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-server";
import { createNews, updateNews } from "@/lib/news-store";
import type { NewsItem } from "@/lib/news-types";
import { toSlug } from "@/lib/slug";

type Body = Partial<NewsItem> & { mode?: "create" | "update" };

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function str(value: unknown) {
  return typeof value === "string" ? value : "";
}

/** ASCII-only slug; Japanese titles fall back to a dated one. */
function makeSlug(body: Body) {
  const candidate = str(body.slug).trim() || str(body.titleEn).trim();
  const slug = candidate ? toSlug(candidate).replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") : "";
  if (slug) return slug.slice(0, 80);
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `news-${day}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Create or update a news item (admin only). */
export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (session?.user?.role !== "admin") return error("Unauthorized", 401);

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return error("Invalid JSON", 400);
  }

  const mode = body.mode === "update" ? "update" : "create";
  const title = str(body.title).trim();
  if (!title) return error("タイトルを入力してください。", 400);

  const publishedAt = new Date(str(body.publishedAt) || Date.now());
  if (Number.isNaN(publishedAt.getTime())) return error("掲載日が不正です。", 400);

  const slug = mode === "update" ? str(body.slug).trim() : makeSlug(body);
  if (!slug) return error("slug is required", 400);

  const now = new Date().toISOString();
  const item: NewsItem = {
    slug,
    title,
    titleEn: str(body.titleEn).trim(),
    summary: str(body.summary).trim(),
    summaryEn: str(body.summaryEn).trim(),
    bodyMd: str(body.bodyMd),
    bodyMdEn: str(body.bodyMdEn),
    coverImageUrl: str(body.coverImageUrl).trim(),
    published: Boolean(body.published),
    publishedAt: publishedAt.toISOString(),
    createdAt: now,
    updatedAt: now,
  };

  if (mode === "create") {
    const created = await createNews(item);
    if (!created) return error(`slug「${slug}」は既に使われています。別のslugにしてください。`, 409);
  } else {
    const updated = await updateNews(item);
    if (!updated) return error("Not found", 404);
  }

  return NextResponse.json({ item });
}
