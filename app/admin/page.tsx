import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { listPosts } from "@/lib/blog-store";

export default async function AdminPage() {
  const session = await getAuthSession();
  if (session?.user?.role !== "admin") {
    redirect("/admin/login?callbackUrl=/admin");
  }

  const posts = await listPosts(true);

  return (
    <main className="min-h-screen bg-[#fffcf7] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-amber-950">ブログ管理</h1>
          <Link
            href="/blog/new"
            className="rounded-lg bg-amber-200 px-4 py-2 font-semibold text-amber-900 hover:bg-amber-300"
          >
            新規作成
          </Link>
        </div>

        <div className="grid gap-4">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-amber-100 bg-white p-5"
            >
              <p className="text-sm text-amber-700/70">{post.slug}</p>
              <h2 className="mt-1 text-xl font-bold text-amber-950">{post.title}</h2>
              <p className="mt-1 text-sm text-amber-900/70">
                更新: {new Date(post.updatedAt).toLocaleString("ja-JP")} /{" "}
                {post.published ? "公開中" : "下書き"}
              </p>
              <div className="mt-3 flex gap-3">
                <Link
                  href={`/blog/${post.slug}`}
                  className="rounded-md border border-amber-200 px-3 py-1 text-sm text-amber-900 hover:bg-amber-50"
                >
                  表示
                </Link>
                <Link
                  href={`/blog/edit/${post.slug}`}
                  className="rounded-md border border-amber-200 px-3 py-1 text-sm text-amber-900 hover:bg-amber-50"
                >
                  編集
                </Link>
              </div>
            </article>
          ))}
          {posts.length === 0 && (
            <p className="rounded-xl border border-amber-100 bg-white p-6 text-amber-900/70">
              まだブログ記事がありません。新規作成から始めてください。
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
