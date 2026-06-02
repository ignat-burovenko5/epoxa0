import type { Metadata } from "next";
import { siteConfig, telegramUrl, whatsappUrl } from "@/lib/site";

/** Primary commercial query (normalized spelling). */
export const SEO_PRIMARY_PHRASE = "Антикварная мебель на продажу — купить";

/** Alternate spellings users may search for. */
export const SEO_KEYWORD_VARIANTS = [
  "антикварная мебель на продажу",
  "антикварная мебель купить",
  "антиквариатная мебель на продажу",
  "антиквариатная мебель купить",
  "антикварная мебель Москва",
  "винтажная мебель купить",
  "антиквариат на продажу",
  "купить антикварную мебель",
  "антикварная мебель с доставкой",
  "салон антикварной мебели",
] as const;

const DEFAULT_OG_IMAGE = "/icons/epoxa-back.jpg";

export function absoluteUrl(path = ""): string {
  const normalized = path ? (path.startsWith("/") ? path : `/${path}`) : "";
  return `${siteConfig.url}${normalized}`;
}

function trimDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const slice = clean.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 80 ? slice.slice(0, lastSpace) : slice).trim()}…`;
}

/** Appends the primary phrase when it is not already present. */
export function withPrimaryKeyword(description: string): string {
  const lower = description.toLowerCase();
  if (
    lower.includes("антикварная мебель") &&
    (lower.includes("купить") || lower.includes("на продажу"))
  ) {
    return trimDescription(description);
  }
  return trimDescription(`${description} ${SEO_PRIMARY_PHRASE}.`);
}

export type PageSeoInput = {
  title: string;
  description: string;
  /** Site path, e.g. `/collection` — used for canonical URL. */
  path?: string;
  noIndex?: boolean;
  ogType?: "website" | "article";
  ogImage?: string;
  /** When false, description is used as-is (max 160). */
  enrichDescription?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
};

const COUNTRY_NAMES: Record<string, string> = {
  RU: "Russia",
  BY: "Belarus",
  KZ: "Kazakhstan",
  AE: "United Arab Emirates",
};

export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  enrichDescription = true,
  publishedTime,
  modifiedTime,
  authors,
  tags,
}: PageSeoInput): Metadata {
  const metaDescription = enrichDescription
    ? withPrimaryKeyword(description)
    : trimDescription(description);
  const canonical = path !== undefined ? absoluteUrl(path) : undefined;
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage);

  return {
    title,
    description: metaDescription,
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      locale: "ru_RU",
      type: ogType,
      siteName: siteConfig.name,
      title,
      description: metaDescription,
      url: canonical,
      images: [
        {
          url: ogImageUrl,
          alt: `${siteConfig.name} — антикварная мебель`,
          width: 1200,
          height: 630,
        },
      ],
      ...(ogType === "article"
        ? {
            publishedTime,
            modifiedTime,
            authors,
            tags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: [ogImageUrl],
    },
  };
}

export function productPageTitle(productTitle: string): string {
  return `${productTitle} — антикварная мебель купить`;
}

export function productPageDescription(productTitle: string, category?: string): string {
  const categoryPart = category ? ` Категория: ${category}.` : "";
  return trimDescription(
    `${productTitle}.${categoryPart} Провенанс, экспертиза, доставка по России. Шоурум ${siteConfig.name}.`,
  );
}

export function categoryPageTitle(label: string): string {
  return `${label} — антикварная мебель на продажу`;
}

export function categoryPageDescription(label: string): string {
  return trimDescription(
    `Купить ${label.toLowerCase()} в салоне ${siteConfig.name}. Антикварная мебель и предметы интерьера с доставкой по России.`,
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.logo),
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressCountry: siteConfig.address.country,
    },
    areaServed: siteConfig.areaServed.map((code) => ({
      "@type": "Country",
      name: COUNTRY_NAMES[code] ?? code,
    })),
    priceRange: "₽₽₽",
    openingHours: siteConfig.workingHours,
    sameAs: [telegramUrl(), whatsappUrl()],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "ru-RU",
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}) {
  const image = input.image
    ? input.image.startsWith("http")
      ? input.image
      : absoluteUrl(input.image)
    : absoluteUrl(DEFAULT_OG_IMAGE);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${absoluteUrl(input.path)}#article`,
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    inLanguage: "ru-RU",
    image,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: input.author
      ? { "@type": "Person", name: input.author }
      : { "@type": "Organization", name: siteConfig.name },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(input.path) },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
