import { cache } from "react";
import { readFile } from "fs/promises";
import { backendFetch } from "@/lib/backend/client";
import { DEFAULT_BLOG_SETTINGS, emptyBlogStore } from "@/lib/blog/defaults";
import { blogStorePath } from "@/lib/blog/paths";
import { isoDateTimeNow } from "@/lib/blog/format";
import type { BlogPost, BlogSettings, BlogStore } from "@/lib/blog/types";

function normalizeStore(raw: unknown): BlogStore {
  if (!raw || typeof raw !== "object") return emptyBlogStore();
  const data = raw as Partial<BlogStore>;
  return {
    version: 1,
    posts: Array.isArray(data.posts) ? data.posts : [],
    settings: {
      ...DEFAULT_BLOG_SETTINGS,
      ...(data.settings ?? {}),
      index: {
        ...DEFAULT_BLOG_SETTINGS.index,
        ...(data.settings?.index ?? {}),
      },
      defaultDisplay: {
        ...DEFAULT_BLOG_SETTINGS.defaultDisplay,
        ...(data.settings?.defaultDisplay ?? {}),
      },
    },
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : isoDateTimeNow(),
  };
}

async function readBlogStoreFromFile(): Promise<BlogStore> {
  try {
    const raw = await readFile(blogStorePath(), "utf8");
    return normalizeStore(JSON.parse(raw));
  } catch {
    return emptyBlogStore();
  }
}

export async function readBlogStore(): Promise<BlogStore> {
  try {
    return await backendFetch<BlogStore>("/api/blog/internal/store", { timeoutMs: 6000 });
  } catch {
    return readBlogStoreFromFile();
  }
}

/** Dedupe store reads within one RSC request (metadata + page). */
export const getBlogStore = cache(readBlogStore);

export async function getBlogSettings(): Promise<BlogSettings> {
  const store = await getBlogStore();
  return store.settings;
}

export async function saveBlogSettings(settings: BlogSettings): Promise<BlogSettings> {
  return backendFetch<BlogSettings>("/api/blog/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
    forwardCookies: true,
  });
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const store = await getBlogStore();
  return store.posts;
}

export async function saveAllBlogPosts(_posts: BlogPost[]): Promise<BlogPost[]> {
  throw new Error("saveAllBlogPosts is not supported; use blog admin API");
}

export async function updateBlogStore(
  _updater: (store: BlogStore) => BlogStore | Promise<BlogStore>,
): Promise<BlogStore> {
  throw new Error("updateBlogStore is not supported; use blog admin API");
}
