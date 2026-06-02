import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireDashboardAuth } from "@/app/blog/1209u1lkjea/dashboard/layout";
import BlogCmsShell from "@/components/blog/cms/BlogCmsShell";
import BlogPostEditor from "@/components/blog/cms/BlogPostEditor";
import { getBlogPostByUid } from "@/lib/blog/posts";
import { getBlogStore } from "@/lib/blog/store";
import { blogPostPublicPath } from "@/lib/blog/urls";

type PageProps = {
  params: Promise<{ uid: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { uid } = await params;
  const post = await getBlogPostByUid(uid);
  return {
    title: post ? `Редактировать: ${post.title}` : "Запись",
    robots: { index: false, follow: false },
  };
}

export default async function BlogEditPostPage({ params }: PageProps) {
  await requireDashboardAuth();
  const { uid } = await params;
  const post = await getBlogPostByUid(uid);
  const store = await getBlogStore();

  if (!post) {
    notFound();
  }

  return (
    <BlogCmsShell>
      <p className="font-sans text-xs text-museum-light/45 mb-2">
        <a
          href={blogPostPublicPath(post)}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent-gold"
        >
          {blogPostPublicPath(post)}
        </a>
      </p>
      <BlogPostEditor post={post} defaultAuthor={store.settings.defaultAuthor} />
    </BlogCmsShell>
  );
}
