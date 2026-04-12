import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { BlogPost } from "@/lib/blog-types";
import { savePost } from "@/lib/blog-store";
import { toSlug } from "@/lib/slug";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (session?.user?.role !== "admin") {
    return unauthorized();
  }

  const body = (await request.json()) as Partial<BlogPost>;
  const now = new Date().toISOString();
  const slug = toSlug(body.slug || body.title || body.titleEn || "");

  const post: BlogPost = {
    slug,
    title: body.title?.trim() || "Untitled",
    titleEn: body.titleEn?.trim() || "",
    excerpt: body.excerpt?.trim() || "",
    excerptEn: body.excerptEn?.trim() || "",
    heroImageUrl: body.heroImageUrl?.trim() || "",
    contentHtml: body.contentHtml || "",
    contentHtmlEn: body.contentHtmlEn || "",
    published: Boolean(body.published),
    createdAt: body.createdAt || now,
    updatedAt: now,
  };

  await savePost(post);

  return NextResponse.json({ post });
}
