import epoxaData from "@/data/epoxa-sections.json";
import type { InfoEntry } from "@/lib/info-sections";

export const CONTENT_PAGE_SIZE = 9;

/** Sections that list entries (news, articles, services). */
export const CONTENT_LIST_SECTION_IDS = ["novosti", "stati", "uslugi"] as const;

export type ContentListSectionId = (typeof CONTENT_LIST_SECTION_IDS)[number];

export type ContentEntry = InfoEntry & {
  slug: string;
  sectionId: string;
  sectionTitle: string;
  sectionHref: string;
};

export type ContentEntrySummary = Pick<
  ContentEntry,
  "slug" | "sectionId" | "title" | "date" | "excerpt"
>;

export type ContentPageResult = {
  items: ContentEntrySummary[];
  total: number;
  offset: number;
  nextOffset: number;
  hasMore: boolean;
};

function entrySlug(sourcePath?: string, title?: string): string {
  if (sourcePath) {
    const segment = sourcePath.split("/").filter(Boolean).pop();
    if (segment) return decodeURIComponent(segment);
  }
  return (title ?? "entry")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function isListSection(id: string): id is ContentListSectionId {
  return (CONTENT_LIST_SECTION_IDS as readonly string[]).includes(id);
}

function mapEntry(
  sectionId: string,
  sectionTitle: string,
  sectionHref: string,
  entry: InfoEntry,
): ContentEntry {
  return {
    ...entry,
    slug: entrySlug(entry.sourcePath, entry.title),
    sectionId,
    sectionTitle,
    sectionHref,
  };
}

export function getSectionEntries(sectionId: string): ContentEntry[] {
  const raw = epoxaData.sections[sectionId as keyof typeof epoxaData.sections];
  if (!raw || !("entries" in raw) || !raw.entries?.length) return [];

  return raw.entries.map((entry) =>
    mapEntry(sectionId, raw.title, raw.href, entry),
  );
}

export function getContentPage(
  sectionId: string,
  offset: number,
  limit = CONTENT_PAGE_SIZE,
): ContentPageResult | null {
  if (!isListSection(sectionId)) return null;

  const all = getSectionEntries(sectionId);
  const items = all.slice(offset, offset + limit).map(
    ({ slug, sectionId: sid, title, date, excerpt }) => ({
      slug,
      sectionId: sid,
      title,
      date,
      excerpt,
    }),
  );
  const nextOffset = offset + items.length;

  return {
    items,
    total: all.length,
    offset,
    nextOffset,
    hasMore: nextOffset < all.length,
  };
}

export function getContentEntry(
  sectionId: string,
  slug: string,
): ContentEntry | undefined {
  return getSectionEntries(sectionId).find((e) => e.slug === slug);
}

export function getContentEntryBySlug(slug: string): ContentEntry | undefined {
  for (const sectionId of CONTENT_LIST_SECTION_IDS) {
    const entry = getContentEntry(sectionId, slug);
    if (entry) return entry;
  }
  return undefined;
}

export function getAllContentEntrySlugs(): string[] {
  const slugs = new Set<string>();
  for (const sectionId of CONTENT_LIST_SECTION_IDS) {
    for (const entry of getSectionEntries(sectionId)) {
      slugs.add(entry.slug);
    }
  }
  return [...slugs];
}

export function isContentListSection(
  sectionId: string,
): sectionId is ContentListSectionId {
  return isListSection(sectionId);
}
