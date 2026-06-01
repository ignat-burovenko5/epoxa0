import CatalogInfiniteGrid from "@/components/CatalogInfiniteGrid";
import { getCatalogPage } from "@/lib/catalog";

type CollectionCatalogProps = {
  categorySlug?: string | null;
};

export default function CollectionCatalog({ categorySlug = null }: CollectionCatalogProps) {
  const { items, total, hasMore } = getCatalogPage(categorySlug, 0);

  return (
    <CatalogInfiniteGrid
      initialItems={items}
      initialTotal={total}
      initialHasMore={hasMore}
      categorySlug={categorySlug}
    />
  );
}
