import type { Metadata } from "next";
import NewsEditor from "@/components/news/NewsEditor";
import { requireAdmin } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "ニュース作成",
  robots: { index: false, follow: false },
};

export default async function NewNewsPage() {
  await requireAdmin("/admen/news/new");
  return <NewsEditor />;
}
