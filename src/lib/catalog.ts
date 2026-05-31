import catalogData from "@/data/catalog.json";

export type CatalogProduct = {
  slug: string;
  title: string;
  era: string;
  category: string;
  description: string[];
  price: number;
  compareAtPrice?: number;
  badge?: string | null;
  images?: string[];
  sourceUrl?: string;
};

const products = catalogData as CatalogProduct[];

export const catalogProducts: Record<string, CatalogProduct> = Object.fromEntries(
  products.map((p) => [p.slug, p]),
);

export const catalogItems = products;

export const featuredSlugs = products
  .filter((p) => p.price > 0)
  .slice(0, 3)
  .map((p) => p.slug);

export function getCatalogProduct(slug: string) {
  return catalogProducts[slug];
}

export function getCatalogSlugs() {
  return products.map((p) => p.slug);
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getDiscountPercent(price: number, compareAtPrice?: number) {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  return Math.round((1 - price / compareAtPrice) * 100);
}

export function hasDiscount(price: number, compareAtPrice?: number) {
  return getDiscountPercent(price, compareAtPrice) !== null;
}
