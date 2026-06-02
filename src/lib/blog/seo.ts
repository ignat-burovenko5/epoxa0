import type { BlogPost } from "@/lib/blog/types";
import { blogPostPublicPath } from "@/lib/blog/urls";

/** Default OG image when a post has no cover (1200×630 hero). */
export const BLOG_DEFAULT_OG_IMAGE = "/icons/epoxa-back.jpg";

export function resolveBlogPostSeo(post: BlogPost) {
  return {
    title: post.title.trim(),
    description: post.excerpt.trim(),
    ogImage: post.coverImage?.src?.trim() || BLOG_DEFAULT_OG_IMAGE,
    canonicalPath: blogPostPublicPath(post),
    noIndex: post.seo?.noIndex ?? false,
  };
}
