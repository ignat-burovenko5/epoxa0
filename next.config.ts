import { readFileSync } from "fs";
import path from "path";
import type { NextConfig } from "next";

const BLOG = "/blog";
/** Must match `BLOG_ADMIN_SEGMENT` in `src/lib/blog/urls.ts`. */
const BLOG_ADMIN_SEGMENT = "1209u1lkjea";
const BLOG_ADMIN = `${BLOG}/${BLOG_ADMIN_SEGMENT}`;

function blogSlugRedirects(): { source: string; destination: string; permanent: boolean }[] {
  try {
    const filePath = path.join(process.cwd(), "data", "blog", "redirects.json");
    const data = JSON.parse(readFileSync(filePath, "utf8")) as {
      redirects?: { from: string; to: string }[];
    };
    return (data.redirects ?? []).map((r) => ({
      source: `${BLOG}/${r.from}`,
      destination: `${BLOG}/${r.from}/${r.to}`,
      permanent: true,
    }));
  } catch {
    return [];
  }
}

const backendUrl = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  /** Staging dir only during `npm run push` build (never set when running `next start`). */
  distDir: process.env.NEXT_BUILD_STAGING === "1" ? ".next-staging" : ".next",
  poweredByHeader: false,
  async rewrites() {
    return [
      // Serve CMS uploads from disk (public/ is snapshotted at `next start`).
      {
        source: "/products/:path*",
        destination: "/api/cms/product-file/:path*",
      },
      {
        source: "/blog/uploads/:path*",
        destination: "/api/cms/blog-file/:path*",
      },
      { source: "/api/blog/:path*", destination: `${backendUrl}/api/blog/:path*` },
      { source: "/api/analytics/:path*", destination: `${backendUrl}/api/analytics/:path*` },
      { source: "/api/shop/:path*", destination: `${backendUrl}/api/shop/:path*` },
    ];
  },
  async redirects() {
    return [
      { source: "/offer", destination: "/usloviya-rezervirovaniya", permanent: true },
      { source: "/privacy", destination: "/politika-konfidentsialnosti", permanent: true },
      {
        source: "/blog/dashboard/posts/new",
        destination: `${BLOG_ADMIN}/dashboard/create`,
        permanent: true,
      },
      {
        source: "/blog/dashboard/posts/:uid",
        destination: `${BLOG_ADMIN}/dashboard/edit/:uid`,
        permanent: true,
      },
      {
        source: "/blog/dashboard/:path*",
        destination: `${BLOG_ADMIN}/dashboard/:path*`,
        permanent: true,
      },
      // Legacy `/blog/{postUid}/dashboard` → handled by `src/app/blog/[slug]/dashboard/page.tsx`
      // (do not add a redirect here — `:uid` would match `BLOG_ADMIN_SEGMENT` and break CMS).
      {
        source: `${BLOG_ADMIN}/dashboard/posts/new`,
        destination: `${BLOG_ADMIN}/dashboard/create`,
        permanent: true,
      },
      {
        source: `${BLOG_ADMIN}/dashboard/posts/:uid`,
        destination: `${BLOG_ADMIN}/dashboard/edit/:uid`,
        permanent: true,
      },
      ...blogSlugRedirects(),
    ];
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/_next/static/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  images: {
    dangerouslyAllowSVG: false,
    qualities: [75, 80],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
