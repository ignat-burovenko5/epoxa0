import type { MetadataRoute } from "next";
import { getCatalogSlugs } from "@/lib/catalog";
import { footerLegalLinks } from "@/lib/legal";
import { homeSections, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const paths = Array.from(
    new Set([
      "",
      "/collection",
      ...homeSections.map((section) => `/${section.id}`),
      ...footerLegalLinks.map((link) => link.href),
      ...getCatalogSlugs().map((slug) => `/${slug}`),
      ...siteConfig.categoryLinks.map((item) => `/collection/${item.slug}`),
    ]),
  );

  return paths.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/collection") ? 0.9 : 0.8,
  }));
}
