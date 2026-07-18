import { backendFetch } from "@/lib/backend/client";
import { mergeDashboardOverview, type RemoteDashboardOverview } from "@/lib/dashboard/merge-overview";
import { getShopCatalogStats, type ShopCatalogStats } from "@/lib/shop/stats";
import type { ShopLead } from "@/lib/shop/types";

export type AnalyticsDailyPoint = {
  date: string;
  label: string;
  pageViews: number;
  cartAdds: number;
  cartViews: number;
  checkoutStarts: number;
  checkoutSubmits: number;
};

export type AnalyticsRecentEvent = {
  type: string;
  path: string;
  at: string;
  meta?: Record<string, string | number | boolean>;
};

export type AnalyticsHourlyPoint = {
  hour: number;
  label: string;
  views: number;
};

export type AnalyticsDayChip = {
  date: string;
  label: string;
  role: "prev" | "center" | "next";
  pageViews: number;
  isToday: boolean;
  isFuture: boolean;
  isCenter: boolean;
};

export type AnalyticsDayNav = {
  centerDate: string;
  todayDate: string;
  days: AnalyticsDayChip[];
  canGoPrev: boolean;
  canGoNext: boolean;
};

export type AnalyticsFocusDay = {
  date: string;
  label: string;
  isToday: boolean;
  isFuture: boolean;
  pageViews: number;
  topPaths: { path: string; views: number }[];
  hourly: AnalyticsHourlyPoint[];
};

export type AnalyticsViewsTotals = {
  day: number;
  week: number;
  month: number;
  year: number;
  allTime: number;
};

export type DashboardOverview = {
  analytics: {
    periodDays: number;
    from: string;
    to: string;
    pageViews: number;
    cartAdds: number;
    cartViews: number;
    checkoutStarts: number;
    checkoutSubmits: number;
    conversionRate: number;
    uniquePages: number;
    topPaths: { path: string; views: number }[];
    dailySeries: AnalyticsDailyPoint[];
    recentEvents: AnalyticsRecentEvent[];
    focusDate: string;
    dayNav: AnalyticsDayNav;
    focusDay: AnalyticsFocusDay;
    viewsTotals: AnalyticsViewsTotals;
  };
  blog: {
    totalPosts: number;
    published: number;
    drafts: number;
  };
  shop: ShopCatalogStats & {
    leadsTotal: number;
    leadsLast7d: number;
    recentLeads: ShopLead[];
  };
};

export async function getDashboardOverview(
  periodDays = 7,
  focusDate?: string,
): Promise<DashboardOverview> {
  const params = new URLSearchParams({ days: String(periodDays) });
  if (focusDate) params.set("date", focusDate);
  const remote = await backendFetch<RemoteDashboardOverview>(
    `/api/blog/admin/overview?${params}`,
    { forwardCookies: true },
  );
  return mergeDashboardOverview(remote, getShopCatalogStats());
}
