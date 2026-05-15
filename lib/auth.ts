import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

// ─────────────────────────────────────────────────────────────
// In-memory rate limiter for failed login attempts.
// Window: 5 minutes, max 5 failed attempts per IP, lockout 15 min.
// In-memory is fine for single-instance runtimes (Vercel default).
// If the deployment scales horizontally, swap this for a Neon/Upstash table.
// ─────────────────────────────────────────────────────────────
type RateEntry = { count: number; firstAt: number; lockedUntil: number };
const attempts = new Map<string, RateEntry>();
const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function clientIp(
  req: { headers?: Record<string, string | string[] | undefined> } | undefined
): string {
  const h = req?.headers || {};
  const fwd = h["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) {
    return fwd.split(",")[0].trim();
  }
  const real = h["x-real-ip"];
  if (typeof real === "string" && real.length > 0) return real;
  return "unknown";
}

function isLocked(ip: string): boolean {
  const e = attempts.get(ip);
  if (!e) return false;
  const now = Date.now();
  if (e.lockedUntil > now) return true;
  if (now - e.firstAt > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return false;
}

function recordFailure(ip: string) {
  const now = Date.now();
  const e = attempts.get(ip);
  if (!e || now - e.firstAt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAt: now, lockedUntil: 0 });
    return;
  }
  e.count += 1;
  if (e.count >= MAX_ATTEMPTS) {
    e.lockedUntil = now + LOCKOUT_MS;
  }
}

function clearAttempts(ip: string) {
  attempts.delete(ip);
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8h
  secret: authSecret,
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const ip = clientIp(
          req as { headers?: Record<string, string | string[] | undefined> }
        );

        if (isLocked(ip)) {
          // Same null result as bad credentials — don't tell the attacker they tripped the lock.
          return null;
        }

        if (!adminEmail || !adminPassword || !credentials) {
          recordFailure(ip);
          return null;
        }

        const email = credentials.email as string | undefined;
        const password = credentials.password as string | undefined;

        if (email === adminEmail && password === adminPassword) {
          clearAttempts(ip);
          return {
            id: "admin",
            name: "Admin",
            email: adminEmail,
            role: "admin",
          };
        }

        recordFailure(ip);
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admen/login",
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}
