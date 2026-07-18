export type ProductStatus = "active" | "draft" | "archived";

export type CatalogProductAdmin = {
  slug: string;
  title: string;
  era: string;
  category: string;
  description: string[];
  price: number;
  compareAtPrice?: number | null;
  badge?: string | null;
  images: string[];
  sourceUrl?: string;
  status: ProductStatus;
  featured: boolean;
  sortOrder: number;
  adminNotes?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CatalogProductSummary = {
  slug: string;
  title: string;
  era: string;
  category: string;
  price: number;
  compareAtPrice?: number | null;
  status: ProductStatus;
  featured: boolean;
  sortOrder: number;
  image?: string | null;
  updatedAt?: string | null;
};

export type CatalogProductInput = {
  slug?: string;
  title: string;
  era?: string;
  category?: string;
  description?: string[] | string;
  price: number;
  compareAtPrice?: number | null;
  badge?: string | null;
  images?: string[] | string;
  sourceUrl?: string;
  status?: ProductStatus;
  featured?: boolean;
  sortOrder?: number;
  adminNotes?: string;
};

export type ProductListPage = {
  items: CatalogProductSummary[];
  total: number;
  offset: number;
  nextOffset: number;
  hasMore: boolean;
  counts: {
    all: number;
    active: number;
    draft: number;
    archived: number;
  };
  /** Present on newer API responses — category facets for admin sidebar. */
  categoryCounts?: { label: string; count: number }[];
};

/** Admin catalog page size (infinite scroll). */
export const ADMIN_PRODUCT_PAGE_SIZE = 36;
