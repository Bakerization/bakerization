"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { C, FONTS } from "@/lib/theme";
import { Button, Field, InlineError, Kicker, fieldStyle } from "@/components/research/ui";

type Props = { mode: "invite" | "reset"; token: string; invalid: boolean };

export default function SetPasswordForm({ mode, token, invalid }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isInvite = mode === "invite";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 10) return setError("パスワードは10文字以上にしてください。");
    if (password !== confirm) return setError("確認用のパスワードが一致しません。");
    setBusy(true);
    setError("");
    const { error: err } = await authClient.resetPassword({ newPassword: password, token });
    if (err) {
      setBusy(false);
      setError("設定に失敗しました。リンクの有効期限が切れている可能性があります。");
      return;
    }
    router.push(`/research/login?${isInvite ? "invite" : "reset"}=done`);
  }

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="mob-pad-card-lg" style={{ width: "100%", maxWidth: 460, background: C.card, border: `1.5px solid ${C.line}`, padding: 40 }}>
        <Kicker style={{ marginBottom: 14 }}>{isInvite ? "▍RESEARCH — WELCOME" : "▍RESEARCH — RESET PASSWORD"}</Kicker>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 32, letterSpacing: -0.8, fontWeight: 700 }}>
          {isInvite ? "パスワードを設定" : "パスワードを再設定"}
        </h1>
        {invalid || !token ? (
          <div style={{ marginTop: 20, fontSize: 14, lineHeight: 1.8, color: C.sub }}>
            <p style={{ margin: 0 }}>リンクが無効か、有効期限が切れています。</p>
            <p style={{ margin: "10px 0 0" }}>
              {isInvite ? "管理者に招待メールの再送を依頼してください。" : (
                <>
                  <Link href="/research/forgot" style={{ color: C.accent }}>こちら</Link>から再設定メールを送り直せます。
                </>
              )}
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ marginTop: 28 }}>
            {isInvite ? (
              <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.8, color: C.sub }}>
                Bakerization Research へようこそ。ログイン用のパスワードを決めてください。設定後、招待メールのアドレスでログインできます。
              </p>
            ) : null}
            <Field label="新しいパスワード（10文字以上）" required>
              <input style={fieldStyle} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={10} required autoFocus />
            </Field>
            <Field label="もう一度入力" required>
              <input style={fieldStyle} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={10} required />
            </Field>
            <InlineError onClose={() => setError("")}>{error}</InlineError>
            <Button type="submit" variant="accent" busy={busy} style={{ width: "100%", justifyContent: "center" }}>
              {busy ? "設定中…" : isInvite ? "設定してはじめる →" : "再設定する →"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
