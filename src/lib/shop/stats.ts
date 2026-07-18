import { blogIndexPath } from "@/lib/blog/urls";
import { formatPrice, getCatalogItems, hasDiscount } from "@/lib/catalog";
import { siteConfig } from "@/lib/site";

export type ShopCatalogStats = {
  productCount: number;
  totalStockValue: number;
  totalStockValueLabel: string;
  onSaleCount: number;
  averagePrice: number;
  averagePriceLabel: string;
  topCategories: { name: string; count: number }[];
};

export function getShopCatalogStats(): ShopCatalogStats {
  const products = getCatalogItems();
  const totalStockValue = products.reduce((sum, p) => sum + p.price, 0);
  const onSaleCount = products.filter((p) =>
    hasDiscount(p.price, p.compareAtPrice),
  ).length;

  const byCategory = new Map<string, number>();
  for (const p of products) {
    byCategory.set(p.category, (byCategory.get(p.category) ?? 0) + 1);
  }

  const topCategories = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  return {
    productCount: products.length,
    totalStockValue,
    totalStockValueLabel: formatPrice(totalStockValue),
    onSaleCount,
    averagePrice: products.length ? Math.round(totalStockValue / products.length) : 0,
    averagePriceLabel: products.length
      ? formatPrice(Math.round(totalStockValue / products.length))
      : formatPrice(0),
    topCategories,
  };
}

export function shopQuickLinks() {
  return [
    { label: "Каталог", href: "/collection" },
    { label: "Блог", href: blogIndexPath() },
    { label: siteConfig.url, href: siteConfig.url, external: true },
  ] as const;
}
