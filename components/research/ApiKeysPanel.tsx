"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { C, FONTS } from "@/lib/theme";
import { Button, CopyBlock, Field, InlineError, Kicker, Panel, TwoStepDelete, fieldStyle, monoSmall } from "@/components/research/ui";
import { formatDate } from "@/lib/research-format";

type KeyRow = { id: string; name: string | null; start: string | null; prefix: string | null; createdAt: string | Date; lastRequest?: string | Date | null };

export default function ApiKeysPanel() {
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<{ name: string; key: string } | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const { data, error: err } = await authClient.apiKey.list();
    if (err) setError("キーの取得に失敗しました。");
    else {
      const rows = Array.isArray(data) ? data : ((data as { apiKeys?: unknown[] } | null)?.apiKeys ?? []);
      setKeys(rows as KeyRow[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    const { data, error: err } = await authClient.apiKey.create({ name: name.trim() || "API key" });
    setCreating(false);
    if (err || !data) {
      setError("キーの発行に失敗しました。");
      return;
    }
    setRevealed({ name: data.name ?? "API key", key: data.key });
    setName("");
    void load();
  }

  async function revoke(id: string) {
    const { error: err } = await authClient.apiKey.delete({ keyId: id });
    if (err) setError("失効に失敗しました。");
    else setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  return (
    <Panel>
      <Kicker style={{ marginBottom: 6 }}>▍API KEYS</Kicker>
      <p style={{ margin: "0 0 18px", fontSize: 13, color: C.sub, lineHeight: 1.7 }}>
        REST API（curl / Claude Code のスクリプト）用のキーです。発行時に一度だけ表示されます。
      </p>

      {revealed ? (
        <div style={{ border: `1.5px solid ${C.accent}`, padding: 16, marginBottom: 18 }}>
          <div style={{ ...monoSmall, color: C.accent, marginBottom: 6 }}>▲ このキーは今回しか表示されません。今すぐコピーして安全な場所に保存してください。</div>
          <CopyBlock text={revealed.key} label={revealed.name} />
          <Button size="sm" variant="ghost" onClick={() => setRevealed(null)}>閉じる</Button>
        </div>
      ) : null}

      <form onSubmit={create} className="mob-flex-wrap" style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Field label="キーの名前（例: Claude Code / 自動化スクリプト）">
            <input style={fieldStyle} value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          </Field>
        </div>
        <Button type="submit" variant="accent" busy={creating} style={{ marginBottom: 18 }}>発行する →</Button>
      </form>

      <InlineError onClose={() => setError("")}>{error}</InlineError>

      {loading ? (
        <p style={monoSmall}>読み込み中…</p>
      ) : keys.length === 0 ? (
        <p style={{ ...monoSmall, textTransform: "none" }}>キーはまだありません。</p>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {keys.map((k) => (
            <div key={k.id} className="mob-flex-wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, border: `1px solid ${C.line}`, padding: "10px 14px" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{k.name ?? "API key"}</div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 11, letterSpacing: "0.12em", color: C.sub }}>
                  {(k.prefix ?? "rk_") + (k.start ?? "").replace(/^rk_/, "")}… · 作成 {formatDate(String(k.createdAt))}
                  {k.lastRequest ? ` · 最終使用 ${formatDate(String(k.lastRequest))}` : " · 未使用"}
                </div>
              </div>
              <TwoStepDelete label="失効" confirmLabel="本当に失効する" onConfirm={() => revoke(k.id)} />
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
