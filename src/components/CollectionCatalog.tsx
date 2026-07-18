import CatalogInfiniteGrid from "@/components/CatalogInfiniteGrid";
import { getCatalogPage } from "@/lib/catalog";

type CollectionCatalogProps = {
  categorySlug?: string | null;
  saleOnly?: boolean;
};

export default function CollectionCatalog({
  categorySlug = null,
  saleOnly = false,
}: CollectionCatalogProps) {
  const { items, total, hasMore } = getCatalogPage(
    saleOnly ? null : categorySlug,
    0,
    undefined,
    saleOnly,
  );

  return (
    <CatalogInfiniteGrid
      initialItems={items}
      initialTotal={total}
      initialHasMore={hasMore}
      categorySlug={saleOnly ? null : categorySlug}
      saleOnly={saleOnly}
    />
  );
}
