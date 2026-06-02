import type { MetadataRoute } from "next";
import { getCatalogSlugs } from "@/lib/catalog";
import { getAllPublishedPublicPaths } from "@/lib/blog/posts";
import { getBlogStore } from "@/lib/blog/store";
import { blogIndexPath, blogPostPublicPath } from "@/lib/blog/urls";
import { getAllContentEntrySlugs } from "@/lib/content";
import { footerLegalLinks } from "@/lib/legal";
import { infoSectionSlugs } from "@/lib/info-sections";
import { siteConfig } from "@/lib/site";

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const store = await getBlogStore();
  const blogPaths = await getAllPublishedPublicPaths();
  const blogLastModified = new Map(
    store.posts
      .filter((p) => p.status === "published" && !p.seo?.noIndex)
      .map((p) => [
        blogPostPublicPath(p),
        parseDate(p.updatedAt ?? p.publishedAt),
      ]),
  );

  const paths = Array.from(
    new Set([
      "",
      blogIndexPath(),
      ...blogPaths,
      "/collection",
      ...infoSectionSlugs.map((id) => `/${id}`),
      ...footerLegalLinks.map((link) => link.href),
      ...getCatalogSlugs().map((slug) => `/${slug}`),
      ...getAllContentEntrySlugs().map((slug) => `/${slug}`),
      ...siteConfig.categoryLinks.map((item) => `/collection/${item.slug}`),
    ]),
  );

  return paths.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: blogLastModified.get(path),
    changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "" ? 1 : path.startsWith("/collection") ? 0.9 : 0.8,
  }));
}
