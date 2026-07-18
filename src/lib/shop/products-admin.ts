import { cache } from "react";
import { backendFetch } from "@/lib/backend/client";
import type {
  CatalogProductAdmin,
  ProductListPage,
  ProductStatus,
} from "@/lib/shop/product-types";

export const getAdminProductList = cache(
  async (options?: {
    status?: ProductStatus | "all";
    q?: string;
    category?: string;
    sort?: string;
    offset?: number;
    limit?: number;
  }): Promise<ProductListPage> => {
    const params = new URLSearchParams();
    params.set("offset", String(options?.offset ?? 0));
    params.set("limit", String(options?.limit ?? 36));
    if (options?.status && options.status !== "all") {
      params.set("status", options.status);
    }
    if (options?.q?.trim()) params.set("q", options.q.trim());
    if (options?.category?.trim() && options.category !== "all") {
      params.set("category", options.category.trim());
    }
    if (options?.sort?.trim()) params.set("sort", options.sort.trim());
    return backendFetch<ProductListPage>(
      `/api/blog/admin/products?${params}`,
      { forwardCookies: true },
    );
  },
);

export const getAdminProduct = cache(async (slug: string) => {
  try {
    return await backendFetch<CatalogProductAdmin>(
      `/api/blog/admin/products/${encodeURIComponent(slug)}`,
      { forwardCookies: true },
    );
  } catch {
    return null;
  }
});
