import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { uploadBlogAsset } from "@/lib/blog-store";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const url = await uploadBlogAsset(
    file,
    typeof prefix === "string" ? prefix : undefined
  );
  return NextResponse.json({ url });
}
