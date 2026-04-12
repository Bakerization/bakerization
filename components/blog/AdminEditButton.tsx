"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Locale } from "@/lib/i18n";

export default function AdminEditButton({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const { data: session } = useSession();
  if (session?.user?.role !== "admin") {
    return null;
  }

  return (
    <Link
      href={`/blog/edit/${slug}`}
      className="rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-white"
    >
      {locale === "en" ? "Edit this post" : "この記事を編集"}
    </Link>
  );
}
