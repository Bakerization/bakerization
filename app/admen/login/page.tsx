"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { C, FONTS } from "@/lib/theme";

export default function AdmenLoginPage() {
  const router = useRouter();
  const [callbackUrl] = useState(() => {
    if (typeof window === "undefined") return "/admen";
    return (
      new URLSearchParams(window.location.search).get("callbackUrl") || "/admen"
    );
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
      // Same error regardless of cause (wrong cred / rate-limited) to avoid leaking state
      setError("認証に失敗しました。");
      return;
    }

    router.push(result?.url || callbackUrl);
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    background: C.fieldBg,
    color: C.ink,
    border: `1.5px solid ${C.fieldBorder}`,
    padding: "14px 16px",
    fontFamily: FONTS.body,
    fontSize: 15,
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: C.sub,
    marginBottom: 10,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.ink,
        fontFamily: FONTS.body,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        className="mob-pad-card-lg"
        style={{
          width: "100%",
          maxWidth: 440,
          background: C.card,
          border: `1.5px solid ${C.line}`,
          padding: 40,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 11,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: C.accent,
            marginBottom: 14,
          }}
        >
          ▍ADMEN — SIGN IN
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: FONTS.display,
            fontSize: 36,
            letterSpacing: -1,
            fontWeight: 700,
            color: C.ink,
          }}
        >
          管理者認証
        </h1>

        <form onSubmit={onSubmit} style={{ marginTop: 32 }}>
          <div style={{ marginBottom: 22 }}>
            <span style={labelStyle}>Email</span>
            <input
              style={fieldStyle}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div style={{ marginBottom: 22 }}>
            <span style={labelStyle}>Password</span>
            <input
              style={fieldStyle}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p
              style={{
                fontFamily: FONTS.mono,
                fontSize: 12,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: C.accent,
                margin: "0 0 18px",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: C.accent,
              color: C.bg,
              border: "none",
              padding: "16px 20px",
              fontFamily: FONTS.body,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 0.4,
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "認証中…" : "サインイン →"}
          </button>
        </form>
      </div>
    </main>
  );
}
