import { getCatalogPage, CATALOG_PAGE_SIZE } from "@/lib/catalog";
import {
  parseCatalogPriceRange,
  parseCatalogSort,
} from "@/lib/catalog-shared";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const saleOnly =
    searchParams.get("sale") === "1" || searchParams.get("sale") === "true";
  const sort = parseCatalogSort(searchParams.get("sort"));
  const priceRange = parseCatalogPriceRange(
    searchParams.get("min"),
    searchParams.get("max"),
  );
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0) || 0);
  const limit = Math.min(
    24,
    Math.max(1, Number(searchParams.get("limit") ?? CATALOG_PAGE_SIZE) || CATALOG_PAGE_SIZE),
  );

  const categorySlug =
    !saleOnly && category && category.length > 0 ? category : null;
  const page = getCatalogPage(
    categorySlug,
    offset,
    limit,
    saleOnly,
    sort,
    priceRange,
  );

  return NextResponse.json(page);
}
