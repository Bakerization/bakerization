import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "管理者認証 | Bakerization",
  robots: { index: false, follow: false },
};

export default function AdmenLoginPage() {
  return (
    <LoginForm
      kicker="▍ADMEN — SIGN IN"
      title="管理者認証"
      defaultCallback="/admen"
      allowedPrefixes={["/admen", "/blog"]}
      forgotHref="/research/forgot"
    />
  );
}
