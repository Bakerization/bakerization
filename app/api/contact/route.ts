import { NextResponse } from "next/server";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  website?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const body = (await request.json()) as ContactPayload;
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

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Bakerization Contact: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    }),
  });

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
        <p>${name} 様</p>
        <p>このたびはお問い合わせいただきありがとうございます。</p>
        <p>以下の内容で受け付けました。</p>
        <p><strong>お名前:</strong> ${name}</p>
        <p><strong>メールアドレス:</strong> ${email}</p>
        <p><strong>内容:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
        <p>担当者よりご連絡いたします。</p>
      `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: confirmationSubject,
        text: confirmationText,
        html: confirmationHtml,
      }),
    });
  }

  return NextResponse.json({ ok: true });
}
