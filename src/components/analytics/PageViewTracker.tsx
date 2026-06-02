"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/track";

import { BLOG_ADMIN_BASE } from "@/lib/blog/urls";

const SKIP_PREFIXES = ["/api", "/_next", BLOG_ADMIN_BASE];

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return;

    const key = `sa-pv:${pathname}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }

    trackEvent("page_view", undefined, pathname);
  }, [pathname]);

  return null;
}
