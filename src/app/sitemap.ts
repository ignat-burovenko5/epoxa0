import type { MetadataRoute } from "next";
import { getCatalogSlugs } from "@/lib/catalog";
import { getAllContentEntrySlugs } from "@/lib/content";
import { footerLegalLinks } from "@/lib/legal";
import { infoSectionSlugs } from "@/lib/info-sections";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const paths = Array.from(
    new Set([
      "",
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
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/collection") ? 0.9 : 0.8,
  }));
}
