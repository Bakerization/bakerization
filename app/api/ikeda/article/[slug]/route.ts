import { IKEDA_ARTICLE_SLUG } from "@/lib/ikeda-sources";
import { getArticleThought } from "@/lib/blog-archive";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!IKEDA_ARTICLE_SLUG.test(slug))
    return Response.json({ error: "Not found" }, { status: 404 });
  const thought = await getArticleThought(slug);
  return thought
    ? Response.json({ thought }, { headers: { "Cache-Control": "no-store" } })
    : Response.json({ error: "Not found" }, { status: 404 });
}
