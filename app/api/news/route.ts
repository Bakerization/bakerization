import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-server";
import { buildNewsItem, type NewsInput } from "@/lib/news-input";
import { createNews, updateNews } from "@/lib/news-store";

type Body = NewsInput & { mode?: "create" | "update" };

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
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
  const built = buildNewsItem(body, mode);
  if (!built.ok) return error(built.error, built.status);
  const { item } = built;

  if (mode === "create") {
    const created = await createNews(item);
    if (!created) return error(`slug「${item.slug}」は既に使われています。別のslugにしてください。`, 409);
  } else {
    const updated = await updateNews(item);
    if (!updated) return error("Not found", 404);
  }

  return NextResponse.json({ item });
}
