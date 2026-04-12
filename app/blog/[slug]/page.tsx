import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { getPost, listPosts } from "@/lib/blog-store";
import { enrichHtmlWithToc } from "@/lib/content-utils";
import AdminEditButton from "@/components/blog/AdminEditButton";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getServerLocale } from "@/lib/i18n";
import { getLocalizedPost } from "@/lib/blog-localize";
import { BlogPost } from "@/lib/blog-types";

type Params = {
  params: Promise<{ slug: string }>;
};

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((part) => part.length >= 2);
}

function relatedScore(base: BlogPost, target: BlogPost) {
  const baseTokens = new Set(
    tokenize(`${base.title} ${base.titleEn} ${base.excerpt} ${base.excerptEn}`)
  );
  const targetTokens = tokenize(
    `${target.title} ${target.titleEn} ${target.excerpt} ${target.excerptEn}`
  );
  let score = 0;
  for (const token of targetTokens) {
    if (baseTokens.has(token)) {
      score += 1;
    }
  }
  return score;
}

export default async function BlogDetailPage({ params }: Params) {
  const locale = await getServerLocale();
  const session = await getAuthSession();
  const isAdmin = session?.user?.role === "admin";

  const { slug } = await params;
  const post = await getPost(slug);

  if (!post || (!post.published && !isAdmin)) {
    notFound();
  }

  const localized = getLocalizedPost(post, locale);
  const { html, toc } = enrichHtmlWithToc(localized.contentHtml);
  const publishedPosts = await listPosts(false);
  const currentIndex = publishedPosts.findIndex((item) => item.slug === post.slug);
  const prevPost = currentIndex >= 0 ? (publishedPosts[currentIndex + 1] ?? null) : null;
  const nextPost = currentIndex > 0 ? publishedPosts[currentIndex - 1] : null;
  const relatedPosts = publishedPosts
    .filter((item) => item.slug !== post.slug)
    .map((item) => ({ item, score: relatedScore(post, item) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return +new Date(b.item.updatedAt) - +new Date(a.item.updatedAt);
    })
    .slice(0, 3)
    .map(({ item }) => item);

  const t =
    locale === "en"
      ? {
          backToBlog: "Back to Blog",
          draft: "Draft",
          toc: "Table of Contents",
          noHeadings: "No headings available.",
          previousPost: "Previous Post",
          nextPost: "Next Post",
          relatedPosts: "Related Posts",
          noRelated: "No related posts available.",
          dateLocale: "en-US",
        }
      : {
          backToBlog: "ブログ一覧へ",
          draft: "下書き",
          toc: "目次",
          noHeadings: "見出しがありません。",
          previousPost: "前の記事",
          nextPost: "次の記事",
          relatedPosts: "関連記事",
          noRelated: "関連記事はまだありません。",
          dateLocale: "ja-JP",
        };

  return (
    <main className="min-h-screen bg-[#fffcf7] pb-24">
      <section className="relative h-[48vh] min-h-[320px]">
        {post.heroImageUrl ? (
          <img
            src={post.heroImageUrl}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[#f4e8d6]" />
        )}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute left-4 top-5 z-20 md:left-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-white"
          >
            <span aria-hidden="true">←</span>
            <span>{t.backToBlog}</span>
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-6xl p-6 text-white md:p-10">
          <p className="text-sm tracking-widest text-white/80">BLOG</p>
          <h1 className="mt-2 max-w-4xl text-3xl font-bold leading-tight md:text-5xl">
            {localized.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-white/85 md:text-base">
            {localized.excerpt}
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs text-white/70">
            <span>{new Date(post.updatedAt).toLocaleDateString(t.dateLocale)}</span>
            {!post.published && <span>{t.draft}</span>}
            <LanguageSwitcher locale={locale} />
            <AdminEditButton slug={post.slug} locale={locale} />
          </div>
        </div>
      </section>

      <div className="mx-auto mt-10 grid w-full max-w-6xl gap-8 px-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl border border-amber-100 bg-white p-5 lg:sticky lg:top-20 lg:h-fit">
          <h2 className="mb-3 text-sm font-bold tracking-widest text-amber-800">
            {t.toc}
          </h2>
          {toc.length === 0 ? (
            <p className="text-sm text-amber-900/60">{t.noHeadings}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {toc.map((item) => (
                <li key={item.id} className={item.level === 3 ? "ml-4" : ""}>
                  <a
                    href={`#${item.id}`}
                    className="text-amber-900/85 hover:text-amber-700"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 border-t border-amber-100 pt-5">
            <h3 className="mb-3 text-sm font-bold tracking-widest text-amber-800">
              {t.relatedPosts}
            </h3>
            {relatedPosts.length === 0 ? (
              <p className="text-sm text-amber-900/60">{t.noRelated}</p>
            ) : (
              <div className="space-y-3">
                {relatedPosts.map((related) => {
                  const rel = getLocalizedPost(related, locale);
                  return (
                    <Link
                      key={related.slug}
                      href={`/blog/${related.slug}`}
                      className="flex gap-3 rounded-lg border border-amber-100 p-2 hover:bg-amber-50/50"
                    >
                      {related.heroImageUrl ? (
                        <img
                          src={related.heroImageUrl}
                          alt={rel.title}
                          className="h-14 w-14 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-md bg-[#f4e8d6]" />
                      )}
                      <p className="line-clamp-2 text-sm font-semibold text-amber-900">
                        {rel.title}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <div className="space-y-8">
          <article
            className="blog-content rounded-2xl border border-amber-100 bg-white p-6 md:p-10"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="group overflow-hidden rounded-2xl border border-amber-100 bg-white"
              >
                {prevPost.heroImageUrl ? (
                  <img
                    src={prevPost.heroImageUrl}
                    alt={getLocalizedPost(prevPost, locale).title}
                    className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-32 w-full bg-[#f4e8d6]" />
                )}
                <div className="p-4">
                  <p className="text-xs font-semibold tracking-widest text-amber-700">
                    {t.previousPost}
                  </p>
                  <p className="mt-1 text-base font-bold text-amber-950">
                    {getLocalizedPost(prevPost, locale).title}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="hidden md:block" />
            )}

            {nextPost ? (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="group overflow-hidden rounded-2xl border border-amber-100 bg-white"
              >
                {nextPost.heroImageUrl ? (
                  <img
                    src={nextPost.heroImageUrl}
                    alt={getLocalizedPost(nextPost, locale).title}
                    className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-32 w-full bg-[#f4e8d6]" />
                )}
                <div className="p-4">
                  <p className="text-xs font-semibold tracking-widest text-amber-700">
                    {t.nextPost}
                  </p>
                  <p className="mt-1 text-base font-bold text-amber-950">
                    {getLocalizedPost(nextPost, locale).title}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="hidden md:block" />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
