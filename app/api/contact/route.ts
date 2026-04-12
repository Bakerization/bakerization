import { NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  website?: string;
};

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendViaResend(
  apiKey: string,
  payload: Record<string, unknown>
) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const name = body.name?.trim() || "";
  const email = body.email?.trim() || "";
  const message = body.message?.trim() || "";
  const website = body.website?.trim() || "";

  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "name, email, message are required" },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  if (
    name.length > MAX_NAME_LENGTH ||
    email.length > MAX_EMAIL_LENGTH ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    return NextResponse.json(
      { error: "input exceeds maximum allowed length" },
      { status: 400 }
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const emailAddress = process.env.EMAIL_ADDRESS;
  const to = process.env.CONTACT_TO || emailAddress;
  const from = process.env.CONTACT_FROM || emailAddress;

  if (!resendApiKey || !emailAddress || !to || !from) {
    return NextResponse.json(
      { error: "RESEND_API_KEY / EMAIL_ADDRESS env vars are not configured." },
      { status: 500 }
    );
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);

  let resendResponse: Response;
  try {
    resendResponse = await sendViaResend(resendApiKey, {
      from,
      to: [to],
      reply_to: email,
      subject: `Bakerization Contact: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage.replace(/\n/g, "<br/>")}</p>
      `,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Resend API." },
      { status: 502 }
    );
  }

  if (!resendResponse.ok) {
    const detail = await resendResponse.text();
    return NextResponse.json(
      { error: "Failed to send email via Resend.", detail },
      { status: 502 }
    );
  }

  const sendConfirmation =
    (process.env.CONTACT_SEND_CONFIRMATION || "true").toLowerCase() === "true";

  if (sendConfirmation) {
    const confirmationSubject =
      process.env.CONTACT_CONFIRM_SUBJECT || "お問い合わせありがとうございます | Bakerization";
    const confirmationText =
      process.env.CONTACT_CONFIRM_TEXT ||
      `このたびはお問い合わせいただきありがとうございます。\n\n以下の内容で受け付けました。\n\nお名前: ${name}\nメールアドレス: ${email}\n\n内容:\n${message}\n\n担当者よりご連絡いたします。`;
    const confirmationHtml =
      process.env.CONTACT_CONFIRM_HTML ||
      `
        <p>${safeName} 様</p>
        <p>このたびはお問い合わせいただきありがとうございます。</p>
        <p>以下の内容で受け付けました。</p>
        <p><strong>お名前:</strong> ${safeName}</p>
        <p><strong>メールアドレス:</strong> ${safeEmail}</p>
        <p><strong>内容:</strong><br/>${safeMessage.replace(/\n/g, "<br/>")}</p>
        <p>担当者よりご連絡いたします。</p>
      `;

    try {
      const confirmationResponse = await sendViaResend(resendApiKey, {
        from,
        to: [email],
        subject: confirmationSubject,
        text: confirmationText,
        html: confirmationHtml,
      });
      if (!confirmationResponse.ok) {
        const detail = await confirmationResponse.text();
        console.error("Failed to send confirmation email via Resend.", detail);
      }
    } catch (error) {
      console.error("Failed to send confirmation email via Resend.", error);
    }
  }

  return NextResponse.json({ ok: true });
}
