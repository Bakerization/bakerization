import { cookies } from "next/headers";

export type Locale = "ja" | "en";

export function normalizeLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : "ja";
}

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("lang")?.value);
}
