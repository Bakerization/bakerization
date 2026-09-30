"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { C, FONTS } from "@/lib/theme";
import { Button, Field, InlineError, Kicker, Panel, TwoStepDelete, fieldStyle, monoSmall } from "@/components/research/ui";
import { formatDate } from "@/lib/research-format";

type Member = { id: string; name: string; email: string; role?: string | null; createdAt: string | Date; banned?: boolean | null };

export default function MembersPanel({ currentUserId }: { currentUserId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name: "", email: "", role: "user" });
  const [resending, setResending] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetFor, setResetFor] = useState<{ id: string; password: string } | null>(null);

  async function load() {
    setLoading(true);
    const { data, error: err } = await authClient.admin.listUsers({ query: { limit: 200, sortBy: "createdAt", sortDirection: "asc" } });
    if (err) setError("メンバー一覧の取得に失敗しました。");
    else setMembers((data?.users ?? []) as unknown as Member[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const res = await fetch("/api/research/members/invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), role: form.role }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; created?: boolean; email?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "招待に失敗しました。");
      return;
    }
    setNotice(
      data.created
        ? `${data.email} に招待メールを送りました。届いたリンクからパスワードを設定するとログインできます。`
        : `${data.email} は登録済みのため、招待メールを再送しました。`
    );
    setForm({ name: "", email: "", role: "user" });
    void load();
  }

  async function resend(m: Member) {
    setResending(m.id);
    setError("");
    setNotice("");
    const res = await fetch("/api/research/members/invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: m.email }),
    });
    setResending(null);
    if (!res.ok) setError("招待メールの再送に失敗しました。");
    else setNotice(`${m.email} に招待メールを再送しました（リンクは7日間有効）。`);
  }

  async function setRole(id: string, role: "admin" | "user") {
    const { error: err } = await authClient.admin.setRole({ userId: id, role });
    if (err) setError("権限の変更に失敗しました。");
    else setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  }

  async function remove(id: string) {
    const { error: err } = await authClient.admin.removeUser({ userId: id });
    if (err) setError("削除に失敗しました。");
    else setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  async function resetPassword() {
    if (!resetFor || resetFor.password.length < 10) {
      setError("新しいパスワードは10文字以上にしてください。");
      return;
    }
    const { error: err } = await authClient.admin.setUserPassword({ userId: resetFor.id, newPassword: resetFor.password });
    if (err) setError("パスワードの再設定に失敗しました。");
    else setNotice("パスワードを再設定しました。本人に新しいパスワードを渡してください。");
    setResetFor(null);
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Panel strong>
        <Kicker style={{ marginBottom: 6 }}>▍INVITE MEMBER</Kicker>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
          名前とメールアドレスを入れると招待メールが届きます。相手がリンクからパスワードを設定すれば、ログインと Claude（MCP）接続ができます。どのドメインのメールでも招待できます。
        </p>
        <form onSubmit={invite}>
          <div className="mob-1col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Field label="名前" required>
              <input style={fieldStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={80} />
            </Field>
            <Field label="メールアドレス" required>
              <input style={fieldStyle} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Field>
            <Field label="権限">
              <select style={fieldStyle} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="user">メンバー</option>
                <option value="admin">管理者</option>
              </select>
            </Field>
          </div>
          <InlineError onClose={() => setError("")}>{error}</InlineError>
          {notice ? <p style={{ fontSize: 13, color: C.sub, margin: "0 0 12px" }}>{notice}</p> : null}
          <Button type="submit" variant="accent" busy={busy}>招待メールを送る →</Button>
        </form>
      </Panel>

      <Panel>
        <Kicker style={{ marginBottom: 14 }}>▍MEMBERS</Kicker>
        {loading ? (
          <p style={monoSmall}>読み込み中…</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {members.map((m) => (
              <div key={m.id} className="mob-flex-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, border: `1px solid ${C.line}`, padding: "10px 14px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {m.name} {m.id === currentUserId ? <span style={{ ...monoSmall, marginLeft: 6 }}>（自分）</span> : null}
                  </div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.12em", color: C.sub, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.email} · {m.role === "admin" ? "管理者" : "メンバー"} · 追加 {formatDate(String(m.createdAt))}
                  </div>
                </div>
                {m.id !== currentUserId ? (
                  <div className="mob-flex-wrap" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {resetFor?.id === m.id ? (
                      <>
                        <input
                          style={{ ...fieldStyle, width: 200, padding: "7px 10px" }}
                          type="text"
                          placeholder="新しいパスワード"
                          value={resetFor.password}
                          onChange={(e) => setResetFor({ id: m.id, password: e.target.value })}
                          autoFocus
                        />
                        <Button size="sm" variant="accent" onClick={() => void resetPassword()}>設定</Button>
                        <Button size="sm" variant="ghost" onClick={() => setResetFor(null)}>キャンセル</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" busy={resending === m.id} onClick={() => void resend(m)}>招待メールを再送</Button>
                        <Button size="sm" onClick={() => setResetFor({ id: m.id, password: "" })}>パスワードを直接設定</Button>
                      </>
                    )}
                    <Button size="sm" onClick={() => void setRole(m.id, m.role === "admin" ? "user" : "admin")}>
                      {m.role === "admin" ? "メンバーにする" : "管理者にする"}
                    </Button>
                    <TwoStepDelete onConfirm={() => remove(m.id)} />
                  </div>
                ) : (
                  <span style={{ ...monoSmall, textTransform: "none" }}>自分自身は削除できません。</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
