/**
 * Pure catalog helpers and types — safe to import from client components.
 * Keep this module free of `node:fs` and any server-only I/O.
 */
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

export const CATALOG_PAGE_SIZE = 9;
export const HOMEPAGE_FEATURED_COUNT = 9;

/** Catalog list order. `price_desc` = сначала дороже (max). */
export type CatalogSort = "default" | "price_asc" | "price_desc";

export const CATALOG_SORT_OPTIONS: ReadonlyArray<{
  id: CatalogSort;
  label: string;
  shortLabel: string;
}> = [
  { id: "default", label: "По умолчанию", shortLabel: "Как есть" },
  { id: "price_asc", label: "Сначала дешевле", shortLabel: "Цена ↑" },
  { id: "price_desc", label: "Сначала дороже", shortLabel: "Цена ↓" },
];

export function parseCatalogSort(value: string | null | undefined): CatalogSort {
  if (value === "price_asc" || value === "price_desc") return value;
  return "default";
}

export function sortCatalogProducts<T extends { price: number; slug: string }>(
  items: T[],
  sort: CatalogSort,
): T[] {
  if (sort === "default") return items;
  const copy = [...items];
  copy.sort((a, b) => {
    const diff =
      sort === "price_asc" ? a.price - b.price : b.price - a.price;
    if (diff !== 0) return diff;
    return a.slug.localeCompare(b.slug, "ru");
  });
  return copy;
}

/** Parse a price query bound (`min` / `max`). Returns null when unset/invalid. */
export function parsePriceBound(value: string | null | undefined): number | null {
  if (value == null || value.trim() === "") return null;
  const n = Number(String(value).replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export type CatalogPriceRange = {
  min: number | null;
  max: number | null;
};

export function parseCatalogPriceRange(
  minRaw: string | null | undefined,
  maxRaw: string | null | undefined,
): CatalogPriceRange {
  let min = parsePriceBound(minRaw);
  let max = parsePriceBound(maxRaw);
  if (min != null && max != null && min > max) {
    const swap = min;
    min = max;
    max = swap;
  }
  return { min, max };
}

export function filterByPriceRange<T extends { price: number }>(
  items: T[],
  range: CatalogPriceRange,
): T[] {
  const { min, max } = range;
  if (min == null && max == null) return items;
  return items.filter((item) => {
    if (min != null && item.price < min) return false;
    if (max != null && item.price > max) return false;
    return true;
  });
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
