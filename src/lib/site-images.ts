import { getCatalogProduct } from "@/lib/catalog";

const UNSPLASH = "https://images.unsplash.com";

/** Build a stable Unsplash CDN URL for Next/Image. */
export function unsplashPhoto(id: string, width = 2070): string {
  return `${UNSPLASH}/${id}?q=80&w=${width}&auto=format&fit=crop`;
}

/** Curated Unsplash photo IDs — antique furniture & period interiors. */
export const photoIds = {
  heroSalon: "photo-1763336312763-84c990c338f4",
  ornateRoom: "photo-1759687046937-bf7fd5aa0e2c",
  antiqueParlor: "photo-1745816455962-d903595dec3c",
  vintageFurniture: "photo-1540932239986-30128078f3c5",
  woodDetail: "photo-1582582621959-48d27397dc69",
} as const;

const defaultCatalogImage = unsplashPhoto(photoIds.vintageFurniture, 1974);

/**
 * Local-only placeholder image, used so the catalog is not full of broken
 * `/products/...` paths when the real photos are absent on a dev machine.
 * Gated so the production build serving levushkin.art is never affected:
 *   - `next dev` (NODE_ENV !== "production") → placeholder on
 *   - `next start` production build → placeholder off unless explicitly
 *     opted in via EPOXA_PLACEHOLDER_IMAGES=1 (set at build time)
 * Production keeps using the real catalog image paths.
 */
const usePlaceholderImages =
  process.env.EPOXA_PLACEHOLDER_IMAGES === "1" ||
  process.env.NODE_ENV !== "production";

/** Single shared local asset shown for every product in dev. */
const placeholderImage = "/images/hero-salon.jpg";

export function getCatalogImage(slug: string, _width = 1974): string {
  const images = getProductImages(slug);
  return images[0] ?? defaultCatalogImage;
}

export function getProductImages(slug: string): string[] {
  if (usePlaceholderImages) {
    return [placeholderImage];
  }
  const product = getCatalogProduct(slug);
  if (product?.images?.length) return product.images;
  return [];
}

export function getProductGallery(slug: string): [string, string, string] {
  const images = getProductImages(slug);
  if (images.length >= 3) {
    return [images[0], images[1], images[2]];
  }
  if (images.length === 2) {
    return [images[0], images[1], images[0]];
  }
  if (images.length === 1) {
    return [images[0], images[0], images[0]];
  }

  const fallback = defaultCatalogImage;
  const detail = unsplashPhoto(photoIds.woodDetail, 2069);
  const interior = unsplashPhoto(photoIds.ornateRoom, 2070);
  return [fallback, detail, interior];
}

export const siteImages = {
  hero: "/icons/epoxa-back.jpg",
} as const;
