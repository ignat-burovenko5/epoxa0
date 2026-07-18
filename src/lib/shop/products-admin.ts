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
    offset?: number;
    limit?: number;
  }): Promise<ProductListPage> => {
    const params = new URLSearchParams();
    params.set("offset", String(options?.offset ?? 0));
    params.set("limit", String(options?.limit ?? 200));
    if (options?.status && options.status !== "all") {
      params.set("status", options.status);
    }
    if (options?.q?.trim()) params.set("q", options.q.trim());
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
