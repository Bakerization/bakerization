import { put } from "@vercel/blob";

// Admin image uploads (news covers and inline images) on Vercel Blob, served
// back through /api/blob/…. Every upload lives under "blog-assets/" — the
// name predates the removal of the blog and is kept so existing URLs resolve.
export const UPLOAD_PREFIX = "blog-assets/";

function toProxyUrl(pathname: string) {
  const encodedPath = pathname.split("/").map(encodeURIComponent).join("/");
  return `/api/blob/${encodedPath}`;
}

function sanitizeAssetPrefix(prefix?: string) {
  const cleaned = (prefix || UPLOAD_PREFIX).trim().replace(/^\/+/, "");
  if (!cleaned.startsWith(UPLOAD_PREFIX) || cleaned.includes("..")) {
    return UPLOAD_PREFIX;
  }
  return cleaned.endsWith("/") ? cleaned : `${cleaned}/`;
}

export async function uploadAsset(file: File, prefix = UPLOAD_PREFIX) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  }

  const fileExt = file.name.split(".").pop() || "bin";
  const fileBaseName = file.name.replace(/\.[^/.]+$/, "").toLowerCase();
  const sanitizedBase = fileBaseName.replace(/[^a-z0-9_-]+/g, "-");
  const safePrefix = sanitizeAssetPrefix(prefix);
  const path = `${safePrefix}${Date.now()}-${sanitizedBase}.${fileExt}`;

  const uploaded = await put(path, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type || "application/octet-stream",
    token,
  });

  return toProxyUrl(uploaded.pathname);
}
