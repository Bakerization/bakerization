import { redirect } from "next/navigation";
import BlogEditor from "@/components/blog/BlogEditor";
import { getAuthSession } from "@/lib/auth";

export default async function NewBlogPage() {
  const session = await getAuthSession();
  if (session?.user?.role !== "admin") {
    redirect("/admen/login?callbackUrl=/blog/new");
  }

  return <BlogEditor />;
}
