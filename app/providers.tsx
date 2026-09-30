"use client";

// Client-side providers for the whole site. Both the theme switcher and the
// next-auth SessionProvider were removed (single light theme; Better Auth's
// client reads the session via authClient.useSession()), so this is a
// passthrough kept for future providers.
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
