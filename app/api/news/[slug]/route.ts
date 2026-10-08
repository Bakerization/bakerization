import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-server";
import { deleteNews } from "@/lib/news-store";

type Params = { params: Promise<{ slug: string }> };

/** Delete a news item (admin only). */
export async function DELETE(_request: Request, { params }: Params) {
  const session = await getAuthSession();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const deleted = await deleteNews(slug);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
