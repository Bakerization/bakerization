import TopPage from "@/components/home/TopPage";
import { listPosts } from "@/lib/blog-store";
import { getServerLocale } from "@/lib/i18n";
import { getLocalizedPost } from "@/lib/blog-localize";

function formatDate(value: string, locale: "ja" | "en") {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return locale === "en" ? `${y}.${m}.${day}` : `${y}.${m}.${day}`;
}

export default async function Home() {
  const locale = await getServerLocale();

  let teasers: {
    slug: string;
    date: string;
    tag: string;
    ja: string;
    en: string;
  }[] = [];

  try {
    const posts = await listPosts(false);
    teasers = posts.slice(0, 3).map((p) => {
      const loc = getLocalizedPost(p, locale);
      return {
        slug: p.slug,
        date: formatDate(p.updatedAt, locale),
        tag: locale === "en" ? "Journal" : "ジャーナル",
        ja: loc.title,
        en: loc.excerpt,
      };
    });
  } catch {
    teasers = [];
  }

  return <TopPage posts={teasers} />;
}
