import { NextRequest, NextResponse } from "next/server";
import { toLinkSafeUrl } from "@/lib/slug";

function extractMeta(html: string, property: string) {
  const byProperty = new RegExp(
    `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const byName = new RegExp(
    `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  );

  return html.match(byProperty)?.[1] || html.match(byName)?.[1] || "";
}

function extractTitle(html: string) {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  return titleMatch?.[1]?.trim() || "";
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const safeUrl = toLinkSafeUrl(rawUrl);
  let parsed: URL;
  try {
    parsed = new URL(safeUrl);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  const response = await fetch(parsed.toString(), {
    cache: "no-store",
    headers: { "User-Agent": "bakerization-blog-preview-bot" },
  });
  const html = await response.text();

  const title = extractMeta(html, "og:title") || extractTitle(html);
  const description =
    extractMeta(html, "og:description") || extractMeta(html, "description");
  const image = extractMeta(html, "og:image");

  return NextResponse.json({
    title: title || parsed.hostname,
    description,
    image,
    url: parsed.toString(),
  });
}
