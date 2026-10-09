"use client";

import { FormEvent, useState } from "react";
import type { Locale } from "@/lib/locale";
import { C, FONTS } from "@/lib/theme";
import { brandButtonStyle, labelText } from "@/components/brand/ui";

export default function ContactForm({ locale }: { locale: Locale }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const t =
    locale === "en"
      ? {
          name: "Name",
          email: "Email",
          message: "Message",
          sending: "Sending…",
          send: "Send →",
          failure: "Failed to send. Please try again later.",
          success: "Your inquiry was sent successfully.",
          required: "Required",
        }
      : {
          name: "お名前",
          email: "メールアドレス",
          message: "ご相談内容",
          sending: "送信中…",
          send: "送信する →",
          failure: "送信に失敗しました。時間をおいて再度お試しください。",
          success: "お問い合わせを受け付けました。ありがとうございます。",
          required: "必須",
        };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message, website }),
    });

    setLoading(false);
    if (!response.ok) {
      setStatus(t.failure);
      return;
    }

    setName("");
    setEmail("");
    setMessage("");
    setWebsite("");
    setStatus(t.success);
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    background: C.fieldBg,
    color: C.ink,
    border: `1px solid ${C.fieldBorder}`,
    padding: "14px 16px",
    boxSizing: "border-box",
    fontFamily: FONTS.body,
    fontSize: 15,
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    ...labelText,
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    color: C.ink,
    marginBottom: 10,
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      <div>
        <div style={labelStyle}>
          <span>{t.name}</span>
          <span style={{ color: C.sub, fontSize: 11 }}>{t.required}</span>
        </div>
        <input
          style={fieldStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
        />
      </div>

      <div>
        <div style={labelStyle}>
          <span>{t.email}</span>
          <span style={{ color: C.sub, fontSize: 11 }}>{t.required}</span>
        </div>
        <input
          style={fieldStyle}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={254}
        />
      </div>

      <div>
        <div style={labelStyle}>
          <span>{t.message}</span>
          <span style={{ color: C.sub, fontSize: 11 }}>{t.required}</span>
        </div>
        <textarea
          style={{ ...fieldStyle, minHeight: 180, resize: "vertical" }}
          rows={8}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={5000}
        />
      </div>

      <label
        style={{
          position: "absolute",
          left: -9999,
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        Website
        <input
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        style={{
          ...brandButtonStyle("green"),
          alignSelf: "flex-start",
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? t.sending : t.send}
      </button>

      {status && (
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.7,
            color: status === t.success ? C.ink : C.alert,
            margin: 0,
          }}
        >
          {status}
        </p>
      )}
    </form>
  );
}
