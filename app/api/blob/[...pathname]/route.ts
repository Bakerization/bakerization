import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ pathname: string[] }>;
};

const ALLOWED_PREFIXES = ["blog-assets/"];

// Uploads get a unique, never-reused path (uploadBlogAsset: timestamp +
// addRandomSuffix), so a URL's bytes never change: browsers may keep it for a
// year, and Vercel's CDN serves repeats without invoking this function.
const CACHE_HEADERS = {
  "cache-control": "public, max-age=31536000, immutable",
  "vercel-cdn-cache-control": "public, max-age=31536000",
};

function isAllowedPath(pathname: string) {
  return ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function safeDecodePathSegment(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function GET(request: Request, { params }: Params) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured." },
      { status: 500 }
    );
  }

  const pathSegments = (await params).pathname || [];
  const decodedSegments = pathSegments.map(safeDecodePathSegment);
  if (decodedSegments.some((segment) => segment === null)) {
    return notFound();
  }

  const pathname = decodedSegments.join("/");

  if (!pathname || !isAllowedPath(pathname)) {
    return notFound();
  }

  const ifNoneMatch = request.headers.get("if-none-match") ?? undefined;
  let blob: Awaited<ReturnType<typeof get>>;
  try {
    blob = await get(pathname, { access: "private", token, ifNoneMatch });
  } catch {
    return NextResponse.json({ error: "Failed to fetch blob." }, { status: 502 });
  }

  if (!blob) {
    return notFound();
  }
  if (blob.statusCode === 304) {
    return new NextResponse(null, { status: 304, headers: { ...CACHE_HEADERS, etag: blob.blob.etag } });
  }
  if (blob.statusCode !== 200) {
    return notFound();
  }

  return new NextResponse(blob.stream, {
    headers: {
      ...CACHE_HEADERS,
      "content-type": blob.blob.contentType,
      "content-length": String(blob.blob.size),
      etag: blob.blob.etag,
    },
  });
}
