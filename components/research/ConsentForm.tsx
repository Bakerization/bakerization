"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { C, FONTS } from "@/lib/theme";
import { Button, InlineError, Kicker, monoSmall } from "@/components/research/ui";
import { useResearchI18n } from "@/components/research/ResearchI18n";

type Props = {
  clientLabel: string;
  redirectHost: string;
  scopes: string[];
  userEmail: string;
};

export default function ConsentForm({ clientLabel, redirectHost, scopes, userEmail }: Props) {
  const { locale, t: copy } = useResearchI18n();
  const t = copy.consent;
  const [busy, setBusy] = useState<"accept" | "deny" | null>(null);
  const [error, setError] = useState("");

  async function decide(accept: boolean) {
    setBusy(accept ? "accept" : "deny");
    setError("");
    const { data, error: err } = await authClient.oauth2.consent({ accept });
    if (err || !data?.url) {
      setBusy(null);
      setError(t.failed);
      return;
    }
    window.location.assign(data.url);
  }

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="mob-pad-card-lg" style={{ width: "100%", maxWidth: 520, background: C.card, border: `1.5px solid ${C.line}`, padding: 40 }}>
        <Kicker style={{ marginBottom: 14 }}>▍RESEARCH — CONNECT</Kicker>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 30, letterSpacing: -0.8, fontWeight: 700 }}>{t.title}</h1>
        {locale === "en" ? (
          <p style={{ margin: "18px 0 0", fontSize: 14, lineHeight: 1.8, color: C.sub }}>
            <strong style={{ color: C.ink }}>{clientLabel}</strong> wants to access Bakerization Research with your account ({userEmail}).
            After you allow it, you&apos;ll return to <strong style={{ color: C.ink }}>{redirectHost}</strong>.
          </p>
        ) : (
          <p style={{ margin: "18px 0 0", fontSize: 14, lineHeight: 1.8, color: C.sub }}>
            <strong style={{ color: C.ink }}>{clientLabel}</strong> が、あなたのアカウント（{userEmail}）で Bakerization Research にアクセスしようとしています。
            許可後は <strong style={{ color: C.ink }}>{redirectHost}</strong> に戻ります。
          </p>
        )}
        <div style={{ margin: "22px 0 0", borderTop: `1px solid ${C.line}` }}>
          <div style={{ ...monoSmall, margin: "14px 0 8px" }}>{t.permissions}</div>
          <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, lineHeight: 1.9 }}>
            {scopes.map((s) => (
              <li key={s}>{t.scopes[s] ?? s}</li>
            ))}
          </ul>
        </div>
        <InlineError>{error}</InlineError>
        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          <Button variant="accent" busy={busy === "accept"} disabled={busy !== null} onClick={() => decide(true)} style={{ flex: 1, justifyContent: "center" }}>
            {busy === "accept" ? t.processing : t.allow}
          </Button>
          <Button busy={busy === "deny"} disabled={busy !== null} onClick={() => decide(false)}>
            {t.deny}
          </Button>
        </div>
      </div>
    </div>
  );
}
