import type { Locale } from "@/lib/locale";

// Plain helpers usable from both server and client components.
// The time zone is fixed so server and client render the same string.
export function formatDate(iso: string, locale: Locale = "ja") {
  try {
    return locale === "en"
      ? new Date(iso).toLocaleDateString("en-US", { timeZone: "Asia/Tokyo", year: "numeric", month: "short", day: "numeric" })
      : new Date(iso).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return iso.slice(0, 10);
  }
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
