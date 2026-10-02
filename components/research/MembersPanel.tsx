"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { C, FONTS } from "@/lib/theme";
import { Button, Field, InlineError, Kicker, Panel, TwoStepDelete, fieldStyle, monoSmall } from "@/components/research/ui";
import { useResearchI18n } from "@/components/research/ResearchI18n";

type Member = { id: string; name: string; email: string; role?: string | null; createdAt: string | Date; banned?: boolean | null };

export default function MembersPanel({ currentUserId }: { currentUserId: string }) {
  const { t: copy, formatDate } = useResearchI18n();
  const t = copy.members;
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
    if (err) setError(t.listFailed);
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
    const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string; created?: boolean; email?: string };
    setBusy(false);
    if (!res.ok) {
      setError((data.code && t.apiErrors[data.code]) || t.inviteFailed);
      return;
    }
    setNotice(data.created ? t.invited(data.email ?? "") : t.reinvited(data.email ?? ""));
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
    if (!res.ok) setError(t.resendFailed);
    else setNotice(t.resent(m.email));
  }

  async function setRole(id: string, role: "admin" | "user") {
    const { error: err } = await authClient.admin.setRole({ userId: id, role });
    if (err) setError(t.roleFailed);
    else setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  }

  async function remove(id: string) {
    const { error: err } = await authClient.admin.removeUser({ userId: id });
    if (err) setError(t.removeFailed);
    else setMembers((prev) => prev.filter((m) => m.id !== id));
  }

  async function resetPassword() {
    if (!resetFor || resetFor.password.length < 10) {
      setError(t.tooShort);
      return;
    }
    const { error: err } = await authClient.admin.setUserPassword({ userId: resetFor.id, newPassword: resetFor.password });
    if (err) setError(t.resetFailed);
    else setNotice(t.resetDone);
    setResetFor(null);
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Panel strong>
        <Kicker style={{ marginBottom: 6 }}>▍INVITE MEMBER</Kicker>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
          {t.inviteLead}
        </p>
        <form onSubmit={invite}>
          <div className="mob-1col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Field label={t.name} required>
              <input style={fieldStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={80} />
            </Field>
            <Field label={t.email} required>
              <input style={fieldStyle} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Field>
            <Field label={t.role}>
              <select style={fieldStyle} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="user">{t.roleMember}</option>
                <option value="admin">{t.roleAdmin}</option>
              </select>
            </Field>
          </div>
          <InlineError onClose={() => setError("")}>{error}</InlineError>
          {notice ? <p style={{ fontSize: 13, color: C.sub, margin: "0 0 12px" }}>{notice}</p> : null}
          <Button type="submit" variant="accent" busy={busy}>{t.invite}</Button>
        </form>
      </Panel>

      <Panel>
        <Kicker style={{ marginBottom: 14 }}>▍MEMBERS</Kicker>
        {loading ? (
          <p style={monoSmall}>{copy.common.loading}</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {members.map((m) => (
              <div key={m.id} className="mob-flex-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, border: `1px solid ${C.line}`, padding: "10px 14px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {m.name} {m.id === currentUserId ? <span style={{ ...monoSmall, marginLeft: 6 }}>{t.self}</span> : null}
                  </div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.12em", color: C.sub, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.email} · {m.role === "admin" ? t.roleAdmin : t.roleMember} · {t.added(formatDate(String(m.createdAt)))}
                  </div>
                </div>
                {m.id !== currentUserId ? (
                  <div className="mob-flex-wrap" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {resetFor?.id === m.id ? (
                      <>
                        <input
                          style={{ ...fieldStyle, width: 200, padding: "7px 10px" }}
                          type="text"
                          placeholder={t.newPassword}
                          value={resetFor.password}
                          onChange={(e) => setResetFor({ id: m.id, password: e.target.value })}
                          autoFocus
                        />
                        <Button size="sm" variant="accent" onClick={() => void resetPassword()}>{t.set}</Button>
                        <Button size="sm" variant="ghost" onClick={() => setResetFor(null)}>{copy.common.cancel}</Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" busy={resending === m.id} onClick={() => void resend(m)}>{t.resend}</Button>
                        <Button size="sm" onClick={() => setResetFor({ id: m.id, password: "" })}>{t.setPassword}</Button>
                      </>
                    )}
                    <Button size="sm" onClick={() => void setRole(m.id, m.role === "admin" ? "user" : "admin")}>
                      {m.role === "admin" ? t.makeMember : t.makeAdmin}
                    </Button>
                    <TwoStepDelete onConfirm={() => remove(m.id)} />
                  </div>
                ) : (
                  <span style={{ ...monoSmall, textTransform: "none" }}>{t.cannotRemoveSelf}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
