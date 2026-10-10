import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-server";

export const metadata = {
  robots: { index: false, follow: false },
};

// The dashboard used to list blog posts; with the blog gone (Journal lives on
// note), news is the only admin area.
export default async function AdmenDashboard() {
  await requireAdmin("/admen");
  redirect("/admen/news");
}
