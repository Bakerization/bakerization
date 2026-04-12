import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { uploadBlogAsset } from "@/lib/blog-store";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function sanitizePrefix(prefix?: string) {
  if (!prefix) {
    return undefined;
  }
  const cleaned = prefix.trim().replace(/^\/+/, "");
  if (!cleaned) {
    return undefined;
  }
  if (cleaned.includes("..")) {
    return undefined;
  }
  return cleaned.endsWith("/") ? cleaned : `${cleaned}/`;
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (session?.user?.role !== "admin") {
    return unauthorized();
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const prefix = formData.get("prefix");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type." },
      { status: 400 }
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Max size is 10MB." },
      { status: 400 }
    );
  }

  try {
    const url = await uploadBlogAsset(
      file,
      sanitizePrefix(typeof prefix === "string" ? prefix : undefined)
    );
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Failed to upload blog asset.", error);
    return NextResponse.json(
      { error: "Failed to upload blog asset." },
      { status: 502 }
    );
  }
}
