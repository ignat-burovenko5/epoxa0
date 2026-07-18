import fs from "node:fs";
import path from "node:path";
import catalogFallback from "@/data/catalog.json";
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
    const products = (Array.isArray(raw) ? raw : []).filter((p) => p.price > 0);
    cachedProducts = products;
    cachedMtimeMs = stat.mtimeMs;
    return products;
  } catch {
    // fall through to bundled JSON
  }

  const products = (catalogFallback as CatalogProduct[]).filter((p) => p.price > 0);
  cachedProducts = products;
  cachedMtimeMs = 0;
  return products;
}

function products(): CatalogProduct[] {
  return loadCatalogProducts();
}

export const CATALOG_PAGE_SIZE = 9;

export const HOMEPAGE_FEATURED_COUNT = 9;

/** Snapshot for modules that need a Record; rebuilds when live catalog changes. */
export function getCatalogProductsMap(): Record<string, CatalogProduct> {
  return Object.fromEntries(products().map((p) => [p.slug, p]));
}

/** @deprecated Prefer getCatalogProduct / getCatalogSlugs — kept for existing imports. */
export const catalogProducts: Record<string, CatalogProduct> = new Proxy(
  {},
  {
    get(_target, prop: string | symbol) {
      if (typeof prop !== "string") return undefined;
      return getCatalogProductsMap()[prop];
    },
    ownKeys() {
      return Reflect.ownKeys(getCatalogProductsMap());
    },
    getOwnPropertyDescriptor(_target, prop) {
      const map = getCatalogProductsMap();
      if (typeof prop === "string" && prop in map) {
        return { configurable: true, enumerable: true, value: map[prop] };
      }
      return undefined;
    },
  },
);

/** @deprecated Prefer getCatalogPage — live list from catalog_live.json. */
export const catalogItems: CatalogProduct[] = new Proxy([] as CatalogProduct[], {
  get(_target, prop) {
    const list = products();
    const value = Reflect.get(list, prop, list);
    return typeof value === "function" ? value.bind(list) : value;
  },
});

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getRandomFeaturedSlugs(count: number = HOMEPAGE_FEATURED_COUNT): string[] {
  const shuffled = shuffleArray(products());
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((p) => p.slug);
}

export function getCatalogProduct(slug: string) {
  return getCatalogProductsMap()[slug];
}

export function getCatalogSlugs() {
  return products().map((p) => p.slug);
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
  const list = products();
  if (!categorySlug) {
    return list;
  }

  const label = categoryLabel(categorySlug);
  const normalized = normalizeCategoryName(label);

  return list.filter(
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
