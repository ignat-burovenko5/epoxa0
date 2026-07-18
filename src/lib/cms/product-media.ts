import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

/** On-disk product media (repo root). Served as `/products/...` via rewrite. */
export const PRODUCT_MEDIA_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "media",
  "products",
);

/** Legacy import paths still under public/. */
export const PRODUCT_MEDIA_LEGACY_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "public",
  "products",
);

export const BLOG_MEDIA_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "media",
  "blog",
  "uploads",
);

export const BLOG_MEDIA_LEGACY_DIR = path.join(
  /* turbopackIgnore: true */ process.cwd(),
  "public",
  "blog",
  "uploads",
);

const URL_PREFIX = "/products";

/** Safe product folder slug for `media/products/{slug}/`. */
export function sanitizeProductSlug(raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/gu, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return cleaned || "draft";
}

export async function saveOptimizedProductImage(opts: {
  slug: string;
  buffer: Buffer;
  ext: ".avif" | ".webp";
  preferredName?: string;
}): Promise<{ url: string; filename: string; absPath: string }> {
  const folder = sanitizeProductSlug(opts.slug);
  const dir = path.join(PRODUCT_MEDIA_DIR, folder);
  await mkdir(dir, { recursive: true });

  const base =
    opts.preferredName?.replace(/[^\w.-]+/g, "-").replace(/\.(jpe?g|png|gif|webp|avif)$/i, "") ||
    randomBytes(8).toString("hex");
  const filename = `${base}${opts.ext}`;
  const absPath = path.join(dir, filename);
  await writeFile(absPath, opts.buffer);

  return {
    url: `${URL_PREFIX}/${folder}/${filename}`,
    filename,
    absPath,
  };
}

export async function saveOptimizedBlogImage(opts: {
  buffer: Buffer;
  ext: ".avif" | ".webp";
}): Promise<{ url: string; filename: string; absPath: string }> {
  await mkdir(BLOG_MEDIA_DIR, { recursive: true });
  const filename = `${randomBytes(9).toString("base64url")}${opts.ext}`;
  const absPath = path.join(BLOG_MEDIA_DIR, filename);
  await writeFile(absPath, opts.buffer);
  return {
    url: `/blog/uploads/${filename}`,
    filename,
    absPath,
  };
}
