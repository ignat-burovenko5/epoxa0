import fs from "node:fs";
import path from "node:path";
import catalogFallback from "@/data/catalog.json";
import { categoryLabel } from "@/lib/site";
import {
  CATALOG_PAGE_SIZE,
  HOMEPAGE_FEATURED_COUNT,
  formatPrice,
  getDiscountPercent,
  hasDiscount,
  parseCatalogSort,
  sortCatalogProducts,
  type CatalogProduct,
  type CatalogSort,
} from "@/lib/catalog-shared";

export {
  CATALOG_PAGE_SIZE,
  HOMEPAGE_FEATURED_COUNT,
  formatPrice,
  getDiscountPercent,
  hasDiscount,
  parseCatalogSort,
  sortCatalogProducts,
};
export type { CatalogProduct, CatalogSort };

let cachedProducts: CatalogProduct[] | null = null;
let cachedMtimeMs = -1;

function loadCatalogProducts(): CatalogProduct[] {
  const livePath = path.join(process.cwd(), "data", "catalog_live.json");
  try {
    const stat = fs.statSync(livePath);
    if (cachedProducts && cachedMtimeMs === stat.mtimeMs) {
      return cachedProducts;
    }
    const raw = JSON.parse(fs.readFileSync(livePath, "utf8")) as CatalogProduct[];
    const list = (Array.isArray(raw) ? raw : []).filter((p) => p.price > 0);
    cachedProducts = list;
    cachedMtimeMs = stat.mtimeMs;
    return list;
  } catch {
    // fall through
  }

  const list = (catalogFallback as CatalogProduct[]).filter((p) => p.price > 0);
  cachedProducts = list;
  cachedMtimeMs = 0;
  return list;
}

/** Active storefront products (from data/catalog_live.json when present). */
export function getCatalogItems(): CatalogProduct[] {
  return loadCatalogProducts();
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getRandomFeaturedSlugs(count: number = HOMEPAGE_FEATURED_COUNT): string[] {
  const shuffled = shuffleArray(getCatalogItems());
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((p) => p.slug);
}

export function getCatalogProduct(slug: string) {
  return getCatalogItems().find((p) => p.slug === slug);
}

export function getCatalogSlugs() {
  return getCatalogItems().map((p) => p.slug);
}

function normalizeCategoryName(value: string) {
  return value.trim().toUpperCase();
}

export type CatalogListFilter = {
  categorySlug?: string | null;
  /** Products with compareAtPrice > price (скидка). */
  saleOnly?: boolean;
  sort?: CatalogSort;
};

/** Filter catalog by category and/or sale flag, then sort. */
export function getFilteredProducts(filter: CatalogListFilter = {}) {
  const list = getCatalogItems();
  let filtered: CatalogProduct[];

  if (filter.saleOnly) {
    filtered = list.filter((product) =>
      hasDiscount(product.price, product.compareAtPrice),
    );
  } else {
    const categorySlug = filter.categorySlug;
    if (!categorySlug) {
      filtered = list;
    } else {
      const label = categoryLabel(categorySlug);
      const normalized = normalizeCategoryName(label);
      filtered = list.filter(
        (product) => normalizeCategoryName(product.category) === normalized,
      );
    }
  }

  return sortCatalogProducts(filtered, filter.sort ?? "default");
}

/** Filter catalog by nav category slug; omit slug for full catalog. */
export function getProductsForCategory(categorySlug?: string | null) {
  return getFilteredProducts({ categorySlug });
}

export function getCategoryProductCount(categorySlug?: string | null) {
  return getProductsForCategory(categorySlug).length;
}

export function getSaleProductCount() {
  return getFilteredProducts({ saleOnly: true }).length;
}

export function getCatalogPage(
  categorySlug: string | null | undefined,
  offset: number,
  limit: number = CATALOG_PAGE_SIZE,
  saleOnly = false,
  sort: CatalogSort = "default",
) {
  const filtered = getFilteredProducts({
    categorySlug: saleOnly ? null : categorySlug,
    saleOnly,
    sort,
  });
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

/** @deprecated Use getCatalogItems() — kept for gradual migration. */
export const catalogItems = new Proxy([] as CatalogProduct[], {
  get(_t, prop) {
    const list = getCatalogItems();
    const value = Reflect.get(list, prop, list);
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(list) : value;
  },
});

/** @deprecated Use getCatalogProduct(slug). */
export const catalogProducts = new Proxy({} as Record<string, CatalogProduct>, {
  get(_t, prop) {
    if (typeof prop !== "string") return undefined;
    return getCatalogProduct(prop);
  },
});
