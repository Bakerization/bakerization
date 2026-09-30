// Transactional mail via the Resend REST API (same service the contact form uses).
// Without RESEND_API_KEY outside production the message is logged instead of sent,
// so invitation / reset links can be exercised locally.

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export type SendResult = { ok: true } | { ok: false; error: string };

export function emailSender() {
  return process.env.CONTACT_FROM || process.env.EMAIL_ADDRESS || "";
}

export async function sendEmail(message: EmailMessage): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = emailSender();

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[email:dev] to=${message.to} subject=${message.subject}\n${message.text}`);
      return { ok: true };
    }
    return { ok: false, error: "RESEND_API_KEY / CONTACT_FROM are not configured." };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        html: message.html,
        reply_to: message.replyTo,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[email] Resend error", res.status, detail.slice(0, 300));
      return { ok: false, error: `Resend responded ${res.status}` };
    }
    return { ok: true };
  } catch (error) {
    console.error("[email] Resend unreachable", error);
    return { ok: false, error: "Failed to reach Resend." };
  }
}
