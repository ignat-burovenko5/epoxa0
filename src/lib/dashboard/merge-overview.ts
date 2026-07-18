import type { ShopCatalogStats } from "@/lib/shop/stats";
import type { ShopLead } from "@/lib/shop/types";
import type { DashboardOverview } from "@/lib/dashboard/overview";

export type RemoteDashboardOverview = Omit<DashboardOverview, "shop"> & {
  shop: {
    leadsTotal: number;
    leadsLast7d: number;
    recentLeads: ShopLead[];
  };
};

/**
 * Merge a remote overview (from the API) with shop catalog stats.
 * Pure / client-safe — callers pass `shopCatalogStats` so this module
 * does not need to read the catalog from disk (`node:fs`).
 */
export function mergeDashboardOverview(
  remote: RemoteDashboardOverview,
  shopCatalogStats: ShopCatalogStats,
): DashboardOverview {
  return {
    ...remote,
    shop: {
      ...shopCatalogStats,
      leadsTotal: remote.shop.leadsTotal,
      leadsLast7d: remote.shop.leadsLast7d,
      recentLeads: remote.shop.recentLeads,
    },
  };
}
