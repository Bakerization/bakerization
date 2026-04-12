import Link from "next/link";
import { listPosts } from "@/lib/blog-store";
import { getLocalizedPost } from "@/lib/blog-localize";
import { getServerLocale } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export const metadata = {
  title: "ブログ | Bakerization",
  description: "Bakerizationの活動や知見を紹介するブログです。",
};

export default async function BlogListPage() {
  const locale = await getServerLocale();
  const posts = await listPosts(false);
  const t =
    locale === "en"
      ? {
          heading: "Bakerization Blog",
          admin: "Admin",
          empty: "No published blog posts yet.",
          dateLocale: "en-US",
        }
      : {
          heading: "Bakerization Blog",
          admin: "管理画面",
          empty: "公開中の記事はまだありません。",
          dateLocale: "ja-JP",
        };

  return (
    <main className="min-h-screen bg-[#fffcf7] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm tracking-widest text-amber-700">BLOG</p>
            <h1 className="mt-2 text-4xl font-bold text-amber-950">
              {t.heading}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} />
            <Link
              href="/admin"
              className="rounded-lg border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-50"
            >
              {t.admin}
            </Link>
          </div>
        </div>

        {posts.length === 0 ? (
          <p className="rounded-2xl border border-amber-100 bg-white p-6 text-amber-900/70">
            {t.empty}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => {
              const localized = getLocalizedPost(post, locale);

              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group relative overflow-hidden rounded-3xl border border-amber-100 bg-white"
                >
                  {post.heroImageUrl ? (
                  <img
                    src={post.heroImageUrl}
                    alt={localized.title}
                    className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  ) : (
                    <div className="h-64 w-full bg-[#f4e8d6]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <h2 className="text-2xl font-bold leading-tight">{localized.title}</h2>
                    <p className="mt-2 text-sm text-white/85">{localized.excerpt}</p>
                    <p className="mt-3 text-xs text-white/70">
                      {new Date(post.updatedAt).toLocaleDateString(t.dateLocale)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
