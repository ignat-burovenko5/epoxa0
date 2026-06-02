import { getShopCatalogStats } from "@/lib/shop/stats";
import type { ShopLead } from "@/lib/shop/types";
import type { DashboardOverview } from "@/lib/dashboard/overview";

export type RemoteDashboardOverview = Omit<DashboardOverview, "shop"> & {
  shop: {
    leadsTotal: number;
    leadsLast7d: number;
    recentLeads: ShopLead[];
  };
};

export function mergeDashboardOverview(remote: RemoteDashboardOverview): DashboardOverview {
  return {
    ...remote,
    shop: {
      ...getShopCatalogStats(),
      leadsTotal: remote.shop.leadsTotal,
      leadsLast7d: remote.shop.leadsLast7d,
      recentLeads: remote.shop.recentLeads,
    },
  };
}
