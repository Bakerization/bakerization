"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { C } from "@/lib/theme";
import { Button, Field, InlineError, Kicker, Panel, fieldStyle } from "@/components/research/ui";

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 10) {
      setError("新しいパスワードは10文字以上にしてください。");
      return;
    }
    setBusy(true);
    setError("");
    setDone(false);
    const { error: err } = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: true });
    setBusy(false);
    if (err) {
      setError("変更に失敗しました。現在のパスワードを確認してください。");
      return;
    }
    setCurrent("");
    setNext("");
    setDone(true);
  }

  return (
    <Panel>
      <Kicker style={{ marginBottom: 6 }}>▍PASSWORD</Kicker>
      <p style={{ margin: "0 0 18px", fontSize: 13, color: C.sub, lineHeight: 1.7 }}>初期パスワードから変更してください。</p>
      <form onSubmit={submit} style={{ maxWidth: 420 }}>
        <Field label="現在のパスワード" required>
          <input style={fieldStyle} type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </Field>
        <Field label="新しいパスワード（10文字以上）" required>
          <input style={fieldStyle} type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} minLength={10} required />
        </Field>
        <InlineError onClose={() => setError("")}>{error}</InlineError>
        {done ? <p style={{ fontSize: 13, color: C.sub, margin: "0 0 12px" }}>パスワードを変更しました。</p> : null}
        <Button type="submit" variant="accent" busy={busy}>変更する →</Button>
      </form>
    </Panel>
  );
}
