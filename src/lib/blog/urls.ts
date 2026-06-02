import type { BlogPost, BlogPostSummary } from "@/lib/blog/types";

/** Public blog routes */
export const BLOG_BASE = "/blog";

/** Secret admin segment after `/blog` (CMS only — not in public nav). */
export const BLOG_ADMIN_SEGMENT = "1209u1lkjea";

export const BLOG_ADMIN_BASE = `${BLOG_BASE}/${BLOG_ADMIN_SEGMENT}`;

type PostRef = Pick<BlogPost, "slug" | "uid"> | Pick<BlogPostSummary, "slug" | "uid">;

/** Canonical public article URL — uid at the end. */
export function blogPostPublicPath(post: PostRef): string {
  return `${BLOG_BASE}/${post.slug}/${post.uid}`;
}

export function blogIndexPath(): string {
  return BLOG_BASE;
}

/** CMS home — blog / analytics hub. */
export function blogAdminHubPath(): string {
  return BLOG_ADMIN_BASE;
}

export function blogAdminBlogPath(): string {
  return `${BLOG_ADMIN_BASE}?view=blog`;
}

export function blogAdminAnalyticsPath(days?: number, date?: string): string {
  const params = new URLSearchParams({ view: "analytics" });
  if (days && days !== 7) params.set("days", String(days));
  if (date) params.set("date", date);
  return `${BLOG_ADMIN_BASE}?${params}`;
}

export function blogDashboardPath(): string {
  return blogAdminBlogPath();
}

export function blogDashboardLoginPath(): string {
  return `${BLOG_ADMIN_BASE}/dashboard/login`;
}

export function blogDashboardCreatePath(): string {
  return `${BLOG_ADMIN_BASE}/dashboard/create`;
}

export function blogDashboardEditPath(uid: string): string {
  return `${BLOG_ADMIN_BASE}/dashboard/edit/${uid}`;
}

export function blogDashboardSettingsPath(): string {
  return `${BLOG_ADMIN_BASE}/dashboard/settings`;
}

/** Legacy `/blog/{uid}` or `/blog/{slug}` — not canonical. */
export function blogLegacyUidPath(uid: string): string {
  return `${BLOG_BASE}/${uid}`;
}

/** Legacy `/blog/{uid}/dashboard` → admin edit. */
export function blogLegacyPostDashboardPath(uid: string): string {
  return `${BLOG_BASE}/${uid}/dashboard`;
}
