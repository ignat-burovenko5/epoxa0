import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getBlogSession } from "@/lib/blog/auth";
import { isBlogPublicUid } from "@/lib/blog/format";
import { getBlogPostByUid } from "@/lib/blog/posts";
import { blogDashboardEditPath } from "@/lib/blog/urls";
import { pageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const metadata: Metadata = pageMetadata({
  title: "Редактор записи",
  description: "Служебная страница редактора блога.",
  noIndex: true,
  enrichDescription: false,
});

/** `/blog/{uid}/dashboard` → `/blog/1209u1lkjea/dashboard/edit/{uid}` */
export default async function BlogPostDashboardRedirect({ params }: PageProps) {
  const session = await getBlogSession();
  if (!session) {
    notFound();
  }

  const { slug: uid } = await params;

  if (!isBlogPublicUid(uid)) {
    notFound();
  }

  const post = await getBlogPostByUid(uid);
  if (!post) {
    notFound();
  }

  permanentRedirect(blogDashboardEditPath(uid));
}
