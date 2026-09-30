import type { Metadata } from "next";
import ForgotForm from "@/components/research/ForgotForm";

export const metadata: Metadata = {
  title: "パスワード再設定 | Bakerization Research",
  robots: { index: false, follow: false },
};

export default function ForgotPage() {
  return <ForgotForm />;
}
