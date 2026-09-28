"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { C, FONTS } from "@/lib/theme";
import { Button, InlineError, Kicker, monoSmall } from "@/components/research/ui";

type Props = {
  clientLabel: string;
  redirectHost: string;
  scopes: string[];
  userEmail: string;
};

const SCOPE_LABELS: Record<string, string> = {
  research: "Research のプロジェクト閲覧とアーティファクトの公開・更新",
  openid: "ログイン状態の確認",
  profile: "表示名の参照",
  email: "メールアドレスの参照",
  offline_access: "接続を維持（トークンの自動更新）",
};

export default function ConsentForm({ clientLabel, redirectHost, scopes, userEmail }: Props) {
  const [busy, setBusy] = useState<"accept" | "deny" | null>(null);
  const [error, setError] = useState("");

  async function decide(accept: boolean) {
    setBusy(accept ? "accept" : "deny");
    setError("");
    const { data, error: err } = await authClient.oauth2.consent({ accept });
    if (err || !data?.url) {
      setBusy(null);
      setError("処理に失敗しました。もう一度やり直してください。");
      return;
    }
    window.location.assign(data.url);
  }

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="mob-pad-card-lg" style={{ width: "100%", maxWidth: 520, background: C.card, border: `1.5px solid ${C.line}`, padding: 40 }}>
        <Kicker style={{ marginBottom: 14 }}>▍RESEARCH — CONNECT</Kicker>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 30, letterSpacing: -0.8, fontWeight: 700 }}>接続を許可しますか？</h1>
        <p style={{ margin: "18px 0 0", fontSize: 14, lineHeight: 1.8, color: C.sub }}>
          <strong style={{ color: C.ink }}>{clientLabel}</strong> が、あなたのアカウント（{userEmail}）で Bakerization Research にアクセスしようとしています。
          許可後は <strong style={{ color: C.ink }}>{redirectHost}</strong> に戻ります。
        </p>
        <div style={{ margin: "22px 0 0", borderTop: `1px solid ${C.line}` }}>
          <div style={{ ...monoSmall, margin: "14px 0 8px" }}>許可する内容</div>
          <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.9 }}>
            {scopes.map((s) => (
              <li key={s}>{SCOPE_LABELS[s] ?? s}</li>
            ))}
          </ul>
        </div>
        <InlineError>{error}</InlineError>
        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          <Button variant="accent" busy={busy === "accept"} disabled={busy !== null} onClick={() => decide(true)} style={{ flex: 1, justifyContent: "center" }}>
            {busy === "accept" ? "処理中…" : "許可する →"}
          </Button>
          <Button busy={busy === "deny"} disabled={busy !== null} onClick={() => decide(false)}>
            拒否
          </Button>
        </div>
      </div>
    </div>
  );
}
