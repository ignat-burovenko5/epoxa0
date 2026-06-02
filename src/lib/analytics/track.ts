import type { AnalyticsEventType } from "@/lib/analytics/types";

type TrackMeta = Record<string, string | number | boolean>;

export function trackEvent(
  type: AnalyticsEventType,
  meta?: TrackMeta,
  path?: string,
) {
  if (typeof window === "undefined") return;

  const body = {
    type,
    path: path ?? window.location.pathname,
    meta,
  };

  void fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {
    /* non-blocking */
  });
}
