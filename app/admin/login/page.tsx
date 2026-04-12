"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [callbackUrl] = useState(() => {
    if (typeof window === "undefined") {
      return "/admin";
    }
    return new URLSearchParams(window.location.search).get("callbackUrl") || "/admin";
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (result?.error) {
      setError("ログインに失敗しました。メールアドレスまたはパスワードを確認してください。");
      return;
    }

    router.push(result?.url || callbackUrl);
  }

  return (
    <main className="min-h-screen bg-[#fffcf7] px-6 py-24">
      <div className="mx-auto max-w-md rounded-2xl border border-amber-100 bg-white p-8">
        <h1 className="text-2xl font-bold text-amber-950">管理者ログイン</h1>
        <p className="mt-2 text-sm text-amber-900/70">
          ブログ編集を行うには管理者アカウントでログインしてください。
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm text-amber-900">Email</span>
            <input
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-amber-950 outline-none focus:border-amber-400"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-amber-900">Password</span>
            <input
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-amber-950 outline-none focus:border-amber-400"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            className="w-full rounded-lg bg-amber-200 px-4 py-2 font-semibold text-amber-900 hover:bg-amber-300 disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </main>
  );
}
