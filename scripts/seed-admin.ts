/**
 * One-off: create the admin account from ADMIN_EMAIL / ADMIN_PASSWORD.
 *   npm run seed:admin            (reads .env)
 * Safe to re-run: exits 0 if the user already exists.
 */
import { auth } from "../lib/auth";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set.");
  }

  try {
    // No `headers` → allowed without a session (bootstrap path).
    const result = await auth.api.createUser({
      body: { email, password, name: "Admin", role: "admin" },
    });
    console.log(`Created admin user ${result.user.email} (${result.user.id}).`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/already exists/i.test(message)) {
      console.log(`Admin user ${email} already exists. Nothing to do.`);
    } else {
      throw error;
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
