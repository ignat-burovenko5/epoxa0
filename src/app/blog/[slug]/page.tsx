import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { isBlogPublicUid } from "@/lib/blog/format";
import { getPublishedPostByUid, resolvePublishedPost } from "@/lib/blog/posts";
import { getBlogStore } from "@/lib/blog/store";
import { blogPostPublicPath } from "@/lib/blog/urls";
import { pageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return pageMetadata({
    title: "Перенаправление",
    description: "Перенаправление на канонический адрес записи.",
    noIndex: true,
    enrichDescription: false,
  });
}

/** Redirect legacy `/blog/{uid}` and `/blog/{slug}` → `/blog/{slug}/{uid}`. */
export default async function BlogLegacyArticleRedirect({ params }: PageProps) {
  const { slug: segment } = await params;
  const store = await getBlogStore();

  if (!store.settings.enabled) {
    notFound();
  }

  const post = isBlogPublicUid(segment)
    ? await getPublishedPostByUid(segment)
    : await resolvePublishedPost(segment);

  if (!post) {
    notFound();
  }

  permanentRedirect(blogPostPublicPath(post));
}
