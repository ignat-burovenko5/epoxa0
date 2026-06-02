import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import BlogPostPage from "@/components/blog/BlogPostPage";
import { isBlogPublicUid } from "@/lib/blog/format";
import { blogPostMetadata } from "@/lib/blog/metadata";
import { getPublishedPostByUid } from "@/lib/blog/posts";
import { getBlogStore } from "@/lib/blog/store";
import { blogPostPublicPath } from "@/lib/blog/urls";
import { pageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string; uid: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { uid } = await params;
  if (!isBlogPublicUid(uid)) {
    return pageMetadata({
      title: "Запись не найдена",
      description: "Запрашиваемая запись блога не найдена.",
      noIndex: true,
      enrichDescription: false,
    });
  }
  const post = await getPublishedPostByUid(uid);
  if (!post) {
    return pageMetadata({
      title: "Запись не найдена",
      description: "Запрашиваемая запись блога не найдена.",
      noIndex: true,
      enrichDescription: false,
    });
  }
  return blogPostMetadata(post);
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug, uid } = await params;
  const store = await getBlogStore();

  if (!store.settings.enabled) {
    notFound();
  }

  if (!isBlogPublicUid(uid)) {
    notFound();
  }

  const post = await getPublishedPostByUid(uid);
  if (!post) {
    notFound();
  }

  if (post.slug !== slug) {
    permanentRedirect(blogPostPublicPath(post));
  }

  return <BlogPostPage post={post} settings={store.settings} />;
}
