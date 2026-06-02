import type { Metadata } from "next";
import type { BlogPost } from "@/lib/blog/types";
import { dateTimeToIsoDate } from "@/lib/blog/format";
import { resolveBlogPostSeo } from "@/lib/blog/seo";
import { pageMetadata } from "@/lib/seo";
import { blogIndexPath } from "@/lib/blog/urls";

export function blogPostMetadata(post: BlogPost): Metadata {
  const { title, description, ogImage, canonicalPath, noIndex } =
    resolveBlogPostSeo(post);
  const publishedTime = post.publishedAt ?? dateTimeToIsoDate(post.date);

  return pageMetadata({
    title,
    description,
    path: canonicalPath,
    ogType: "article",
    ogImage,
    noIndex,
    enrichDescription: false,
    publishedTime,
    modifiedTime: post.updatedAt ?? publishedTime,
    authors: post.author ? [post.author] : undefined,
    tags: post.tags,
  });
}

export function blogIndexMetadata(
  settings: { index: { title: string; description: string }; enabled?: boolean },
): Metadata {
  const title = settings.index.title;
  const description = settings.index.description;
  return pageMetadata({
    title,
    description,
    path: blogIndexPath(),
    noIndex: settings.enabled === false,
  });
}
