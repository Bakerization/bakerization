"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { C, FONTS } from "@/lib/theme";
import { Button, Field, InlineError, Kicker, fieldStyle } from "@/components/research/ui";
import { useResearchI18n } from "@/components/research/ResearchI18n";

export default function ForgotForm() {
  const t = useResearchI18n().t.forgot;
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error: err } = await authClient.requestPasswordReset({ email: email.trim(), redirectTo: "/research/reset-password" });
    setBusy(false);
    if (err) {
      setError(t.failed);
      return;
    }
    setSent(true);
  }

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="mob-pad-card-lg" style={{ width: "100%", maxWidth: 460, background: C.card, border: `1.5px solid ${C.line}`, padding: 40 }}>
        <Kicker style={{ marginBottom: 14 }}>▍RESEARCH — FORGOT PASSWORD</Kicker>
        <h1 style={{ margin: 0, fontFamily: FONTS.display, fontSize: 32, letterSpacing: -0.8, fontWeight: 700 }}>{t.title}</h1>
        {sent ? (
          <p style={{ margin: "20px 0 0", fontSize: 14, lineHeight: 1.8, color: C.sub }}>
            {t.sent}
          </p>
        ) : (
          <form onSubmit={onSubmit} style={{ marginTop: 28 }}>
            <Field label={t.email} required>
              <input style={fieldStyle} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </Field>
            <InlineError onClose={() => setError("")}>{error}</InlineError>
            <Button type="submit" variant="accent" busy={busy} style={{ width: "100%", justifyContent: "center" }}>
              {busy ? t.sending : t.submit}
            </Button>
          </form>
        )}
        <p style={{ margin: "22px 0 0", fontSize: 13 }}>
          <Link href="/research/login" style={{ color: C.accent }}>{t.back}</Link>
        </p>
      </div>
    </div>
  );
}
