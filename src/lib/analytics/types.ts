export const ANALYTICS_EVENT_TYPES = [
  "page_view",
  "cart_add",
  "cart_view",
  "checkout_start",
  "checkout_submit",
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export type AnalyticsEvent = {
  type: AnalyticsEventType;
  path: string;
  at: string;
  meta?: Record<string, string | number | boolean>;
};

export type DailyAnalytics = {
  pageViews: number;
  cartAdds: number;
  cartViews: number;
  checkoutStarts: number;
  checkoutSubmits: number;
  topPaths: Record<string, number>;
};

export type AnalyticsStore = {
  version: 1;
  daily: Record<string, DailyAnalytics>;
  recent: AnalyticsEvent[];
  updatedAt: string;
};
