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

export function getCatalogImage(slug: string, _width = 1974): string {
  const images = getProductImages(slug);
  return images[0] ?? defaultCatalogImage;
}

export function getProductImages(slug: string): string[] {
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
  hero: unsplashPhoto(photoIds.heroSalon, 3840),
} as const;
