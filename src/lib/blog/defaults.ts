import type { BlogSettings, BlogStore } from "@/lib/blog/types";

export const BLOG_STORE_VERSION = 1 as const;

export const DEFAULT_BLOG_SETTINGS: BlogSettings = {
  enabled: true,
  pageSize: 9,
  index: {
    title: "Блог",
    description:
      "Заметки об антикварной мебели на продажу: коллекция, реставрация, провенанс и советы по покупке в салоне.",
    emptyMessage: "Пока нет опубликованных записей.",
    itemLabel: "записей",
  },
  defaultDisplay: {
    showDate: true,
    showAuthor: true,
    showTags: true,
    showCover: true,
    theme: "dark",
    maxWidth: "default",
  },
  defaultAuthor: "Редакция",
  dashboardTitle: "Управление блогом",
};

export function emptyBlogStore(): BlogStore {
  const now = new Date().toISOString();
  return {
    version: BLOG_STORE_VERSION,
    posts: [],
    settings: DEFAULT_BLOG_SETTINGS,
    updatedAt: now,
  };
}
