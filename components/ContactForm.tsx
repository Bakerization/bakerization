"use client";

import { FormEvent, useState } from "react";
import { Locale } from "@/lib/i18n";

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
          sending: "Sending...",
          send: "Send",
          failure: "Failed to send. Please try again later.",
          success: "Your inquiry was sent successfully.",
        }
      : {
          name: "お名前",
          email: "メールアドレス",
          message: "お問い合わせ内容",
          sending: "送信中...",
          send: "送信する",
          failure: "送信に失敗しました。時間をおいて再度お試しください。",
          success: "お問い合わせを受け付けました。ありがとうございます。",
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

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-10 max-w-2xl space-y-4 text-left">
      <label className="block">
        <span className="mb-1 block text-sm text-amber-900">{t.name}</span>
        <input
          className="w-full rounded-lg border border-amber-200 px-3 py-2 text-amber-950 outline-none focus:border-amber-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-amber-900">{t.email}</span>
        <input
          type="email"
          className="w-full rounded-lg border border-amber-200 px-3 py-2 text-amber-950 outline-none focus:border-amber-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm text-amber-900">{t.message}</span>
        <textarea
          rows={6}
          className="w-full rounded-lg border border-amber-200 px-3 py-2 text-amber-950 outline-none focus:border-amber-400"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </label>

      <label className="hidden" aria-hidden="true">
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
        className="inline-block rounded-xl bg-amber-200 px-8 py-3 font-bold text-amber-900 hover:bg-amber-300 disabled:opacity-60"
      >
        {loading ? t.sending : t.send}
      </button>

      {status && <p className="text-sm text-amber-900/80">{status}</p>}
    </form>
  );
}
