import ContentInfiniteList from "@/components/ContentInfiniteList";
import { getContentPage, isContentListSection } from "@/lib/content";

type ContentSectionCatalogProps = {
  sectionId: string;
  itemLabel?: string;
};

export default function ContentSectionCatalog({
  sectionId,
  itemLabel,
}: ContentSectionCatalogProps) {
  if (!isContentListSection(sectionId)) {
    return null;
  }

  const page = getContentPage(sectionId, 0);
  if (!page) return null;

  return (
    <ContentInfiniteList
      sectionId={sectionId}
      initialItems={page.items}
      initialTotal={page.total}
      initialHasMore={page.hasMore}
      itemLabel={itemLabel}
    />
  );
}
