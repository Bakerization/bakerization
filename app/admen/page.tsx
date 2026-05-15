import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { listPosts } from "@/lib/blog-store";
import { C, FONTS } from "@/lib/theme";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdmenDashboard() {
  const session = await getAuthSession();
  if (session?.user?.role !== "admin") {
    redirect("/admen/login?callbackUrl=/admen");
  }

  const posts = await listPosts(true);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.ink,
        fontFamily: FONTS.body,
        paddingTop: 96,
      }}
    >
      <div
        className="mob-pad"
        style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 48px 96px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${C.line}`,
            borderBottom: `1px solid ${C.line}`,
            padding: "16px 0",
            marginBottom: 40,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: C.accent,
            }}
          >
            ▍ADMEN — Dashboard
          </span>
          <Link
            href="/blog/new"
            style={{
              background: C.accent,
              color: C.bg,
              border: "none",
              padding: "12px 20px",
              fontFamily: FONTS.body,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.3,
              textDecoration: "none",
            }}
          >
            新規作成 →
          </Link>
        </div>

        <h1
          className="mob-h3"
          style={{
            margin: 0,
            fontFamily: FONTS.display,
            fontSize: 56,
            lineHeight: 1.1,
            letterSpacing: -2,
            fontWeight: 700,
            color: C.ink,
          }}
        >
          ブログ管理
        </h1>
        <p
          style={{
            marginTop: 12,
            fontSize: 14,
            color: C.sub,
            fontFamily: FONTS.mono,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          {posts.length} entries · {posts.filter((p) => p.published).length}{" "}
          published
        </p>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {posts.map((post) => (
            <article
              key={post.slug}
              className="mob-1col"
              style={{
                background: C.card,
                border: `1.5px solid ${C.line}`,
                padding: 24,
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 20,
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    color: post.published ? C.accent : C.sub,
                    textTransform: "uppercase",
                  }}
                >
                  {post.published ? "公開中" : "下書き"} ·{" "}
                  {new Date(post.updatedAt).toLocaleString("ja-JP")}
                </div>
                <h2
                  style={{
                    margin: "8px 0 4px",
                    fontFamily: FONTS.display,
                    fontSize: 22,
                    fontWeight: 700,
                    color: C.ink,
                  }}
                >
                  {post.title || post.titleEn || "(no title)"}
                </h2>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 12,
                    color: C.sub,
                  }}
                >
                  /{post.slug}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Link
                  href={`/blog/${post.slug}`}
                  style={{
                    border: `1px solid ${C.line}`,
                    padding: "10px 14px",
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    color: C.sub,
                    textDecoration: "none",
                    textTransform: "uppercase",
                  }}
                >
                  表示
                </Link>
                <Link
                  href={`/blog/edit/${post.slug}`}
                  style={{
                    background: C.accent,
                    color: C.bg,
                    padding: "10px 14px",
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    fontWeight: 700,
                    textDecoration: "none",
                    textTransform: "uppercase",
                  }}
                >
                  編集
                </Link>
              </div>
            </article>
          ))}
          {posts.length === 0 && (
            <p
              style={{
                border: `1.5px solid ${C.line}`,
                background: C.card,
                padding: 32,
                color: C.sub,
                fontSize: 14,
              }}
            >
              まだブログ記事がありません。新規作成から始めてください。
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
