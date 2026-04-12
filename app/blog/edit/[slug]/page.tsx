import { notFound, redirect } from "next/navigation";
import BlogEditor from "@/components/blog/BlogEditor";
import { getAuthSession } from "@/lib/auth";
import { getPost } from "@/lib/blog-store";

type Params = {
  params: Promise<{ slug: string }>;
};

export default async function EditBlogPage({ params }: Params) {
  const session = await getAuthSession();
  if (session?.user?.role !== "admin") {
    const { slug } = await params;
    redirect(`/admin/login?callbackUrl=/blog/edit/${slug}`);
  }

  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    notFound();
  }

  return <BlogEditor initialPost={post} />;
}
