import { cache } from "react";
import { backendFetch } from "@/lib/backend/client";
import { formatBlogDate, postSortTimestamp } from "@/lib/blog/format";
import { getBlogStore } from "@/lib/blog/store";
import { blogPostPublicPath } from "@/lib/blog/urls";
import type {
  BlogListPage,
  BlogPost,
  BlogPostInput,
  BlogPostSummary,
} from "@/lib/blog/types";

function toSummary(post: BlogPost): BlogPostSummary {
  return {
    uid: post.uid,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date ?? formatBlogDate(post.publishedAt),
    status: post.status,
    featured: post.featured,
    coverImage: post.coverImage,
    tags: post.tags,
    author: post.author,
    publishedAt: post.publishedAt,
  };
}

function sortPosts(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort(
    (a, b) => postSortTimestamp(b) - postSortTimestamp(a),
  );
}

function listPageFromStore(
  store: Awaited<ReturnType<typeof getBlogStore>>,
  offset: number,
  limit: number,
  includeDrafts: boolean,
): BlogListPage {
  const pageSize = limit > 0 ? limit : store.settings.pageSize;
  const all = includeDrafts
    ? sortPosts(store.posts)
    : sortPosts(store.posts.filter((p) => p.status === "published"));
  const items = all.slice(offset, offset + pageSize).map(toSummary);
  const nextOffset = offset + items.length;
  return {
    items,
    total: all.length,
    offset,
    nextOffset,
    hasMore: nextOffset < all.length,
  };
}

export function isPublished(post: BlogPost): boolean {
  return post.status === "published";
}

export function mergePostDisplay(
  post: BlogPost,
  defaults: BlogPost["display"],
): Required<NonNullable<BlogPost["display"]>> {
  const d = defaults ?? {};
  const p = post.display ?? {};
  return {
    showDate: p.showDate ?? d.showDate ?? true,
    showAuthor: p.showAuthor ?? d.showAuthor ?? true,
    showTags: p.showTags ?? d.showTags ?? true,
    showCover: p.showCover ?? d.showCover ?? true,
    theme: p.theme ?? d.theme ?? "dark",
    maxWidth: p.maxWidth ?? d.maxWidth ?? "default",
    className: p.className ?? d.className ?? "",
  };
}

export async function getBlogListPage(
  offset: number,
  limit: number,
  options?: { includeDrafts?: boolean },
): Promise<BlogListPage> {
  const params = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  });
  const path = options?.includeDrafts
    ? `/api/blog/admin/posts?${params}`
    : `/api/blog?${params}`;

  try {
    return await backendFetch<BlogListPage>(path, {
      forwardCookies: Boolean(options?.includeDrafts),
      timeoutMs: 6000,
    });
  } catch {
    const store = await getBlogStore();
    return listPageFromStore(store, offset, limit, Boolean(options?.includeDrafts));
  }
}

export async function getBlogPostByUid(uid: string): Promise<BlogPost | undefined> {
  try {
    return await backendFetch<BlogPost>(`/api/blog/internal/posts/${uid}`, { timeoutMs: 5000 });
  } catch {
    const store = await getBlogStore();
    return store.posts.find((p) => p.uid === uid);
  }
}

export async function getPublishedPostByUid(uid: string): Promise<BlogPost | undefined> {
  try {
    return await backendFetch<BlogPost>(`/api/blog/internal/published/${uid}`, {
      timeoutMs: 5000,
    });
  } catch {
    const post = await getBlogPostByUid(uid);
    if (!post || !isPublished(post)) return undefined;
    return post;
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const store = await getBlogStore();
  return store.posts.find((p) => p.slug === slug && p.status === "published");
}

export async function resolvePublishedPost(param: string): Promise<BlogPost | undefined> {
  const byUid = await getPublishedPostByUid(param);
  if (byUid) return byUid;
  return getPublishedPostBySlug(param);
}

export const getPublishedUids = cache(async (): Promise<string[]> => {
  try {
    const data = await backendFetch<{ uids: string[] }>(
      "/api/blog/internal/published-uids",
      { timeoutMs: 5000 },
    );
    return data.uids;
  } catch {
    const store = await getBlogStore();
    return store.posts.filter((p) => p.status === "published").map((p) => p.uid);
  }
});

export async function getAllPublishedUids(): Promise<string[]> {
  return getPublishedUids();
}

export async function getAllPublishedPublicPaths(): Promise<string[]> {
  const store = await getBlogStore();
  return store.posts
    .filter((p) => p.status === "published" && !p.seo?.noIndex)
    .map((p) => blogPostPublicPath(p));
}

export async function createBlogPost(input: BlogPostInput): Promise<BlogPost> {
  return backendFetch<BlogPost>("/api/blog/admin/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    forwardCookies: true,
  });
}

export async function updateBlogPost(
  uid: string,
  input: Partial<BlogPostInput>,
): Promise<BlogPost | null> {
  try {
    return await backendFetch<BlogPost>(`/api/blog/admin/posts/${uid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      forwardCookies: true,
    });
  } catch {
    return null;
  }
}

export async function deleteBlogPost(uid: string): Promise<boolean> {
  try {
    await backendFetch(`/api/blog/admin/posts/${uid}`, {
      method: "DELETE",
      forwardCookies: true,
    });
    return true;
  } catch {
    return false;
  }
}

export type { BlogPostSummary };
