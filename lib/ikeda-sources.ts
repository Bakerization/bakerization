/** Authorized source families and safe article IDs shared by indexing and UI. */
export const IKEDA_SOURCE_URL_PATTERNS = [
  "https://panlabo.jugem.jp/?eid=%",
  "https://www.asahi.com/and/w/article/%",
];
export const IKEDA_ARTICLE_SLUG = /^(?:panlabo-\d+|asahi-konopan-\d+)$/;
export function articleSourceLabel(url: string) {
  return url.startsWith("https://www.asahi.com/and/w/article/")
    ? "朝日新聞デジタルマガジン＆"
    : "パンラボ";
}
