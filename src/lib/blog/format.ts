import { createHash } from "node:crypto";

/** DD.MM.YYYY for display; accepts ISO in storage. */
export function formatBlogDate(isoOrDisplay?: string): string | undefined {
  if (!isoOrDisplay) return undefined;
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(isoOrDisplay)) return isoOrDisplay;
  const d = new Date(isoOrDisplay);
  if (Number.isNaN(d.getTime())) return isoOrDisplay;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

export function isoDateTimeNow() {
  return new Date().toISOString();
}

/** Today as DD.MM.YYYY (default in CMS for new posts). */
export function blogDateToday(): string {
  return formatBlogDate(new Date().toISOString()) ?? "";
}

type PostSortFields = {
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  date?: string;
};

/** Milliseconds for sorting — newer posts first. */
export function postSortTimestamp(post: PostSortFields): number {
  const iso = post.publishedAt ?? post.updatedAt ?? post.createdAt;
  if (iso) {
    const t = Date.parse(iso);
    if (!Number.isNaN(t)) return t;
  }
  const d = post.date;
  if (d && /^\d{2}\.\d{2}\.\d{4}$/.test(d)) {
    const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(d);
    if (m) {
      return Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    }
  }
  return 0;
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function dateTimeToIsoDate(date?: string): string | undefined {
  if (!date) return undefined;
  if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, 10);
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return undefined;
}

const BLOG_PUBLIC_UID_RE = /^\d{5}[a-z]{5}$/;

/** Public article URL id, e.g. `20893uraosi` — used in `/blog/{slug}/{uid}` */
export function isBlogPublicUid(value: string): boolean {
  return BLOG_PUBLIC_UID_RE.test(value);
}

/** Stable opaque id from seed (slug, sourcePath, title). */
export function blogUidFromSeed(seed: string): string {
  const hash = createHash("sha256").update(`blog:${seed}`).digest();
  const digits = String(10000 + (hash.readUInt32BE(0) % 90000));
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let suffix = "";
  for (let i = 0; i < 5; i += 1) {
    suffix += alphabet[hash[i + 4]! % 26];
  }
  return `${digits}${suffix}`;
}

export function generateBlogPublicUid(): string {
  return blogUidFromSeed(crypto.randomUUID());
}

export function newBlogUid(): string {
  return generateBlogPublicUid();
}
