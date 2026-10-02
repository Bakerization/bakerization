"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { C, FONTS } from "@/lib/theme";
import { Button, Field, InlineError, Kicker, fieldStyle } from "@/components/research/ui";
import { useResearchI18n } from "@/components/research/ResearchI18n";

type Props = { mode: "invite" | "reset"; token: string; invalid: boolean };

export default function SetPasswordForm({ mode, token, invalid }: Props) {
  const router = useRouter();
  const t = useResearchI18n().t.setPassword;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isInvite = mode === "invite";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 10) return setError(t.tooShort);
    if (password !== confirm) return setError(t.mismatch);
    setBusy(true);
    setError("");
    const { error: err } = await authClient.resetPassword({ newPassword: password, token });
    if (err) {
      setBusy(false);
      setError(t.failed);
      return;
    }
    router.push(`/research/login?${isInvite ? "invite" : "reset"}=done`);
  }

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="mob-pad-card-lg" style={{ width: "100%", maxWidth: 460, background: C.card, border: `1.5px solid ${C.line}`, padding: 40 }}>
        <Kicker style={{ marginBottom: 14 }}>{isInvite ? "▍RESEARCH — WELCOME" : "▍RESEARCH — RESET PASSWORD"}</Kicker>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 32, letterSpacing: -0.8, fontWeight: 700 }}>
          {isInvite ? t.titleInvite : t.titleReset}
        </h1>
        {invalid || !token ? (
          <div style={{ marginTop: 20, fontSize: 14, lineHeight: 1.8, color: C.sub }}>
            <p style={{ margin: 0 }}>{t.invalid}</p>
            <p style={{ margin: "10px 0 0" }}>
              {isInvite ? t.askAdmin : (
                <>
                  {t.resendBefore}
                  <Link href="/research/forgot" style={{ color: C.accent }}>{t.resendLink}</Link>
                  {t.resendAfter}
                </>
              )}
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} style={{ marginTop: 28 }}>
            {isInvite ? (
              <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.8, color: C.sub }}>
                {t.welcome}
              </p>
            ) : null}
            <Field label={t.next} required>
              <input style={fieldStyle} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={10} required autoFocus />
            </Field>
            <Field label={t.confirm} required>
              <input style={fieldStyle} type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={10} required />
            </Field>
            <InlineError onClose={() => setError("")}>{error}</InlineError>
            <Button type="submit" variant="accent" busy={busy} style={{ width: "100%", justifyContent: "center" }}>
              {busy ? t.setting : isInvite ? t.submitInvite : t.submitReset}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
