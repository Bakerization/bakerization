export function toSlug(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, " and ")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || `post-${Date.now()}`;
}

export function toLinkSafeUrl(value: string) {
  return encodeURI(value.trim().replace(/[\u3000\s]+/g, " "));
}
