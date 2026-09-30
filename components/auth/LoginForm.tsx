"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { C, FONTS } from "@/lib/theme";

type Props = {
  kicker: string;
  title: string;
  /** Where to go after sign-in when no (valid) callbackUrl is given. */
  defaultCallback: string;
  /** callbackUrl must start with one of these prefixes (open-redirect guard). */
  allowedPrefixes: string[];
  /** Optional "forgot password" link shown under the form. */
  forgotHref?: string;
  /** Optional one-line notice above the form (e.g. after setting a password). */
  notice?: string;
};

function readCallback(defaultCallback: string, allowedPrefixes: string[]) {
  if (typeof window === "undefined") return defaultCallback;
  const raw = new URLSearchParams(window.location.search).get("callbackUrl");
  if (!raw) return defaultCallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return defaultCallback;
  return allowedPrefixes.some((p) => raw === p || raw.startsWith(p))
    ? raw
    : defaultCallback;
}

export default function LoginForm({
  kicker,
  title,
  defaultCallback,
  allowedPrefixes,
  forgotHref,
  notice,
}: Props) {
  const router = useRouter();
  const [callbackUrl] = useState(() =>
    readCallback(defaultCallback, allowedPrefixes)
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: callbackUrl,
    });

    if (signInError) {
      setLoading(false);
      // Same message regardless of cause (wrong credentials / rate limited).
      setError("認証に失敗しました。");
      return;
    }

    // During an OAuth authorization (Claude connector), the server answers with
    // the URL that resumes the flow. Otherwise go back to where the user came from.
    if (data && "url" in data && data.url) {
      window.location.assign(data.url);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
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
          {kicker}
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
          {title}
        </h1>

        {notice ? (
          <p style={{ margin: "18px 0 0", fontSize: 14, lineHeight: 1.7, color: C.sub, borderLeft: `3px solid ${C.accent}`, paddingLeft: 12 }}>
            {notice}
          </p>
        ) : null}

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
        {forgotHref ? (
          <p style={{ margin: "18px 0 0", fontSize: 13 }}>
            <a href={forgotHref} style={{ color: C.accent }}>パスワードをお忘れですか？</a>
          </p>
        ) : null}
      </div>
    </main>
  );
}
