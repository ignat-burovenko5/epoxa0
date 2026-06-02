import type { MetadataRoute } from "next";
import { BLOG_ADMIN_BASE } from "@/lib/blog/urls";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        BLOG_ADMIN_BASE,
        `${BLOG_ADMIN_BASE}/`,
        "/api/",
        "/asdoifj1oi",
        "/cart",
        "/checkout",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
