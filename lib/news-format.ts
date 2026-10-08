import type { Locale } from "@/lib/locale";
import type { NewsItem, NewsSummary } from "@/lib/news-types";

// Pure helpers (no DB / server imports) so the client editor can use them too.

export function newsHasEnglish(item: NewsItem | NewsSummary) {
  if ("hasEnglish" in item) return item.hasEnglish;
  return Boolean(item.titleEn.trim() && item.bodyMdEn.trim());
}

type Localizable = {
  title: string;
  titleEn: string;
  summary: string;
  summaryEn: string;
  bodyMd?: string;
  bodyMdEn?: string;
};

/** English text when the item has an English title, Japanese otherwise. */
export function localizeNews(item: Localizable, locale: Locale) {
  const useEn = locale === "en" && Boolean(item.titleEn.trim());
  const bodyEn = (item.bodyMdEn || "").trim();
  return {
    title: useEn ? item.titleEn : item.title,
    summary: useEn ? item.summaryEn || item.summary : item.summary,
    bodyMd: useEn && bodyEn ? item.bodyMdEn || "" : item.bodyMd || "",
    lang: (useEn ? "en" : "ja") as Locale,
  };
}

/** "2026.10.08" in Tokyo time (the format the home page and journal use). */
export function formatNewsDate(isoDate: string) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}.${get("month")}.${get("day")}`;
}

/** "2026-10-08" in Tokyo time, for <input type="date">. */
export function toDateInputValue(isoDate: string) {
  return formatNewsDate(isoDate).replaceAll(".", "-");
}

/** A date input value ("2026-10-08") as midnight in Tokyo, ISO-formatted. */
export function fromDateInputValue(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00+09:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
