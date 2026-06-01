import catalogData from "@/data/catalog.json";
import { categoryLabel } from "@/lib/site";

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

export const CATALOG_PAGE_SIZE = 9;

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

function normalizeCategoryName(value: string) {
  return value.trim().toUpperCase();
}

/** Filter catalog by nav category slug; omit slug for full catalog. */
export function getProductsForCategory(categorySlug?: string | null) {
  if (!categorySlug) {
    return products;
  }

  const label = categoryLabel(categorySlug);
  const normalized = normalizeCategoryName(label);

  return products.filter(
    (product) => normalizeCategoryName(product.category) === normalized,
  );
}

export function getCategoryProductCount(categorySlug?: string | null) {
  return getProductsForCategory(categorySlug).length;
}

export function getCatalogPage(
  categorySlug: string | null | undefined,
  offset: number,
  limit: number = CATALOG_PAGE_SIZE,
) {
  const filtered = getProductsForCategory(categorySlug ?? null);
  const items = filtered.slice(offset, offset + limit);
  const nextOffset = offset + items.length;

  return {
    items,
    total: filtered.length,
    offset,
    nextOffset,
    hasMore: nextOffset < filtered.length,
  };
}
