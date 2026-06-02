import { backendFetch } from "@/lib/backend/client";
import {
  ANALYTICS_EVENT_TYPES,
  type AnalyticsEvent,
  type AnalyticsEventType,
  type AnalyticsStore,
  type DailyAnalytics,
} from "@/lib/analytics/types";

export { ANALYTICS_EVENT_TYPES };

export async function readAnalyticsStore(): Promise<AnalyticsStore> {
  return backendFetch<AnalyticsStore>("/api/analytics/internal/store");
}

export function isAnalyticsEventType(value: string): value is AnalyticsEventType {
  return (ANALYTICS_EVENT_TYPES as readonly string[]).includes(value);
}

export async function recordAnalyticsEvent(
  event: Omit<AnalyticsEvent, "at"> & { at?: string },
): Promise<void> {
  await backendFetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: event.type,
      path: event.path,
      meta: event.meta,
    }),
  });
}

function emptyDaily(): DailyAnalytics {
  return {
    pageViews: 0,
    cartAdds: 0,
    cartViews: 0,
    checkoutStarts: 0,
    checkoutSubmits: 0,
    topPaths: {},
  };
}

export function sumDailyRange(
  store: AnalyticsStore,
  days: number,
): DailyAnalytics & { from: string; to: string } {
  const totals = emptyDaily();
  const keys = Object.keys(store.daily).sort().slice(-days);

  for (const key of keys) {
    const d = store.daily[key]!;
    totals.pageViews += d.pageViews;
    totals.cartAdds += d.cartAdds;
    totals.cartViews += d.cartViews;
    totals.checkoutStarts += d.checkoutStarts;
    totals.checkoutSubmits += d.checkoutSubmits;
    for (const [path, count] of Object.entries(d.topPaths)) {
      totals.topPaths[path] = (totals.topPaths[path] ?? 0) + count;
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  return {
    ...totals,
    from: keys[0] ?? today,
    to: keys[keys.length - 1] ?? today,
  };
}

export function topPathsFromDaily(
  daily: DailyAnalytics,
  limit = 8,
): { path: string; views: number }[] {
  return Object.entries(daily.topPaths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([path, views]) => ({ path, views }));
}
