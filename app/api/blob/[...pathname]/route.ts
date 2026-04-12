import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

type Params = {
  params: Promise<{ pathname: string[] }>;
};

const ALLOWED_PREFIXES = ["blog-assets/"];

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

export async function GET(_: Request, { params }: Params) {
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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pathname = decodedSegments.join("/");

  if (!pathname || !isAllowedPath(pathname)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let blob: Awaited<ReturnType<typeof get>>;
  try {
    blob = await get(pathname, { access: "private", token });
  } catch {
    return NextResponse.json({ error: "Failed to fetch blob." }, { status: 502 });
  }

  if (!blob || blob.statusCode !== 200) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(blob.stream, {
    headers: {
      "content-type": blob.blob.contentType,
      "cache-control": "public, max-age=300",
      etag: blob.blob.etag,
    },
  });
}
