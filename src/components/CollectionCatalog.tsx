import { getCatalogPage } from "@/lib/catalog";
import type { CatalogSort } from "@/lib/catalog-shared";
import CatalogInfiniteGrid from "@/components/CatalogInfiniteGrid";

type CollectionCatalogProps = {
  categorySlug?: string | null;
  saleOnly?: boolean;
  sort?: CatalogSort;
};

export default function CollectionCatalog({
  categorySlug = null,
  saleOnly = false,
  sort = "default",
}: CollectionCatalogProps) {
  const { items, total, hasMore } = getCatalogPage(
    saleOnly ? null : categorySlug,
    0,
    undefined,
    saleOnly,
    sort,
  );

  return (
    <CatalogInfiniteGrid
      initialItems={items}
      initialTotal={total}
      initialHasMore={hasMore}
      categorySlug={saleOnly ? null : categorySlug}
      saleOnly={saleOnly}
      sort={sort}
    />
  );
}
