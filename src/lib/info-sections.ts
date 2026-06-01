import epoxaData from "@/data/epoxa-sections.json";

export type InfoEntry = {
  title: string;
  date?: string;
  excerpt: string;
  body?: string;
  sourcePath?: string;
  sourceUrl?: string;
};

export type InfoBlock = {
  heading: string | null;
  paragraphs: string[];
};

export type InfoContact = {
  address?: string;
  hours?: string;
  phone?: string;
  requisites?: string;
};

export type InfoSection = {
  id: string;
  title: string;
  href: string;
  paragraphs: readonly string[];
  description?: string;
  entries?: readonly InfoEntry[];
  blocks?: readonly InfoBlock[];
  contact?: InfoContact;
  catalogHref?: string;
  sourceUrl?: string;
};

type RawSection = (typeof epoxaData.sections)[keyof typeof epoxaData.sections];

function mapSection(raw: RawSection): InfoSection {
  return {
    id: raw.id,
    title: raw.title,
    href: raw.href,
    paragraphs: raw.paragraphs ?? [],
    description: "description" in raw ? raw.description : undefined,
    entries: "entries" in raw ? raw.entries : undefined,
    blocks: "blocks" in raw ? raw.blocks : undefined,
    contact: "contact" in raw ? raw.contact : undefined,
    catalogHref: "catalog" in raw ? raw.catalog?.catalogHref : undefined,
    sourceUrl: raw.sourceUrl,
  };
}

/** Homepage tabs (matches epoxa.ru top nav). */
export const homeSections: readonly InfoSection[] = epoxaData.homeTabIds.map(
  (id) => mapSection(epoxaData.sections[id as keyof typeof epoxaData.sections]),
);

/** All info pages including catalog shortcuts. */
export const infoSectionSlugs = Object.keys(epoxaData.sections);

export function getHomeSection(slug: string): InfoSection | undefined {
  const raw = epoxaData.sections[slug as keyof typeof epoxaData.sections];
  if (!raw || "error" in raw) return undefined;
  return mapSection(raw);
}

export const epoxaSectionsScrapedAt = epoxaData.scrapedAt;
