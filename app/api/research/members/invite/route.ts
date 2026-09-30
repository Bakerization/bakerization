import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { auth, INVITE_REDIRECT } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/research-api";
import { getMemberByEmail } from "@/lib/research-store";

export const dynamic = "force-dynamic";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/**
 * POST { name, email, role? } — admin only.
 * Creates the account (random password) if it doesn't exist, then emails an
 * invitation link that lets the person set their own password.
 * For an existing account this just re-sends the invitation.
 */
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return jsonError(401, "Unauthorized");
  if (session.user.role !== "admin") return jsonError(403, "Admin only");

  const body = await readJson<{ name?: unknown; email?: unknown; role?: unknown }>(request);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 80) : "";
  const role = body?.role === "admin" ? "admin" : "user";
  if (!isValidEmail(email)) return jsonError(400, "有効なメールアドレスを入力してください。");

  let created = false;
  const existing = await getMemberByEmail(email);
  if (!existing) {
    if (!name) return jsonError(400, "名前を入力してください。");
    await auth.api.createUser({
      body: { email, name, role, password: randomBytes(24).toString("base64url") },
      headers: request.headers,
    });
    created = true;
  }

  try {
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: INVITE_REDIRECT },
      headers: request.headers,
    });
  } catch (error) {
    console.error("[invite] failed to send invitation", error);
    return jsonError(502, "招待メールの送信に失敗しました。RESEND の設定を確認してください。", { created });
  }

  return NextResponse.json({ ok: true, created, email });
}
