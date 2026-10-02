/**
 * Replace the ADMIN_EMAIL account's password with a random 32-character one,
 * sign out all of its sessions, and write the new value to .env (ADMIN_PASSWORD).
 *   npm run rotate:admin            (reads .env; DATABASE_URL decides which DB)
 * The new password is printed once — store it in a password manager.
 */
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { auth } from "../lib/auth";

const ENV_FILE = ".env";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  if (!email) throw new Error("ADMIN_EMAIL must be set.");

  const ctx = await auth.$context;
  const found = await ctx.internalAdapter.findUserByEmail(email, { includeAccounts: true });
  if (!found) throw new Error(`No user with email ${email}.`);
  if (!found.accounts.some((a) => a.providerId === "credential")) {
    throw new Error(`${email} has no email/password account.`);
  }

  const password = randomBytes(24).toString("base64url"); // 32 chars, 192 bits
  await ctx.internalAdapter.updatePassword(found.user.id, await ctx.password.hash(password));
  await ctx.internalAdapter.deleteUserSessions(found.user.id);

  const env = readFileSync(ENV_FILE, "utf8");
  const line = `ADMIN_PASSWORD=${password}`;
  writeFileSync(ENV_FILE, /^ADMIN_PASSWORD=.*$/m.test(env) ? env.replace(/^ADMIN_PASSWORD=.*$/m, line) : `${env.trimEnd()}\n${line}\n`);

  console.log(`Password for ${email} replaced; all of its sessions were signed out; ${ENV_FILE} updated.`);
  console.log(`New password (shown once): ${password}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
