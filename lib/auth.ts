import { betterAuth } from "better-auth";
import { admin, jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { apiKey } from "@better-auth/api-key";
import { mcp } from "@better-auth/mcp";
import { cimd } from "@better-auth/cimd";
import { fetchClientMetadataResource } from "@better-auth/cimd/node";
import { PostgresDialect, type PostgresPool } from "kysely";
import { Pool } from "@neondatabase/serverless";
import { sendEmail } from "@/lib/email";
import { APP_URL, MCP_RESOURCE } from "@/lib/site";
import { inviteEmail, resetPasswordEmail } from "@/lib/research-emails";

// ─────────────────────────────────────────────────────────────
// Better Auth is the single auth system for the site:
//   - /admen (news admin)          → role "admin"
//   - /research (members area)     → role "member" | "admin"
//   - /api/mcp (Claude connector)  → OAuth 2.1 tokens issued here
//   - REST uploads                 → per-member API keys (prefix rk_)
// Keep this module free of `next/headers` so the CLI / scripts can load it.
// ─────────────────────────────────────────────────────────────

// Re-exported for existing importers; the values live in lib/site.ts so that
// routes needing only the URL don't pull in Better Auth and the Neon pool.
export { APP_URL, MCP_RESOURCE };
export const RESEARCH_SCOPE = "research";
/** Invitation / password-reset links stay valid this long. */
export const RESET_TOKEN_DAYS = 7;
export const INVITE_REDIRECT = "/research/invite";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 10_000,
});
pool.on("error", (error: Error) => {
  console.error("[auth] neon pool error", error);
});

export const auth = betterAuth({
  appName: "Bakerization",
  baseURL: APP_URL,
  secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  database: {
    // Neon's Pool is pg-compatible at runtime; its types differ slightly from kysely's.
    dialect: new PostgresDialect({ pool: pool as unknown as PostgresPool }),
    type: "postgres",
    transaction: true,
  },
  trustedOrigins: Array.from(
    new Set([
      APP_URL,
      "https://bakerization.com",
      "https://www.bakerization.com",
    ])
  ),
  emailAndPassword: {
    enabled: true,
    // Accounts are created by an admin from /research/members (invitation email);
    // the invitee sets their own password through the reset-password token flow.
    disableSignUp: true,
    minPasswordLength: 10,
    resetPasswordTokenExpiresIn: 60 * 60 * 24 * RESET_TOKEN_DAYS,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      const isInvite = url.includes(encodeURIComponent(INVITE_REDIRECT)) || url.includes(INVITE_REDIRECT);
      const message = isInvite
        ? inviteEmail({ to: user.email, name: user.name, url, appUrl: APP_URL, days: RESET_TOKEN_DAYS })
        : resetPasswordEmail({ to: user.email, name: user.name, url, days: RESET_TOKEN_DAYS });
      const result = await sendEmail(message);
      if (!result.ok) throw new Error(result.error);
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 5 },
    },
  },
  // The jwt plugin's /token endpoint is not needed (and confusing next to /oauth2/token).
  disabledPaths: ["/token"],
  plugins: [
    jwt({ disableSettingJwtHeader: true }),
    admin({ defaultRole: "user", adminRoles: ["admin"] }),
    apiKey({
      defaultPrefix: "rk_",
      defaultKeyLength: 40,
      keyExpiration: { defaultExpiresIn: null },
      rateLimit: { enabled: true, timeWindow: 60_000, maxRequests: 120 },
    }),
    mcp({
      loginPage: "/research/login",
      consentPage: "/research/consent",
      resource: MCP_RESOURCE,
      scopes: ["openid", "profile", "email", "offline_access", RESEARCH_SCOPE],
    }),
    cimd({
      fetchClientMetadataResource,
      metadataProfile: "mcp-2026-07-28",
    }),
    // Must stay last so it can read Set-Cookie headers produced by other plugins.
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
