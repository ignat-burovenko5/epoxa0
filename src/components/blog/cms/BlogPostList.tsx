"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BlogPostSummary } from "@/lib/blog/types";
import {
  blogDashboardCreatePath,
  blogDashboardEditPath,
  blogPostPublicPath,
} from "@/lib/blog/urls";

const STATUS_LABEL: Record<string, string> = {
  draft: "Черновик",
  published: "Опубликовано",
  archived: "Архив",
};

type BlogPostListProps = {
  posts: BlogPostSummary[];
};

export default function BlogPostList({ posts: initialPosts }: BlogPostListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  async function remove(uid: string, title: string) {
    if (!confirm(`Удалить «${title}»? Это действие нельзя отменить.`)) return;

    setDeleting(uid);
    setError(null);
    try {
      const res = await fetch(`/api/blog/admin/posts/${uid}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Не удалось удалить");
        return;
      }
      setPosts((current) => current.filter((post) => post.uid !== uid));
    } catch {
      setError("Ошибка сети");
    } finally {
      setDeleting(null);
    }
  }

  if (!posts.length) {
    return (
      <p className="font-sans text-sm text-museum-light/60 text-center py-12">
        Записей пока нет.{" "}
        <Link href={blogDashboardCreatePath()} className="text-accent-gold hover:underline">
          Создать первую
        </Link>
      </p>
    );
  }

  return (
    <div>
      {error ? (
        <p className="font-sans text-sm text-red-300/90 mb-4" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="list-none p-0 m-0 divide-y divide-museum-light/10">
        {posts.map((post) => (
          <li
            key={post.uid}
            className="py-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[10px] tracking-widest uppercase text-museum-light/45 mb-1">
                {STATUS_LABEL[post.status] ?? post.status}
                {post.date ? ` · ${post.date}` : ""}
              </p>
              <h2 className="font-serif text-lg text-museum-light truncate">{post.title}</h2>
              <p className="font-sans text-xs text-museum-light/50 mt-1 truncate">
                {blogPostPublicPath(post)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href={blogDashboardEditPath(post.uid)}
                className="min-h-11 px-4 inline-flex items-center font-sans text-xs tracking-widest uppercase border border-museum-light/25 hover:border-accent-gold/50 transition-colors"
              >
                Изменить
              </Link>
              <a
                href={blogPostPublicPath(post)}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-11 px-4 inline-flex items-center font-sans text-xs tracking-widest uppercase text-museum-light/50 hover:text-accent-gold"
              >
                Просмотр
              </a>
              <button
                type="button"
                disabled={deleting === post.uid}
                onClick={() => void remove(post.uid, post.title)}
                className="min-h-11 px-4 font-sans text-xs tracking-widest uppercase text-red-300/80 hover:text-red-200 disabled:opacity-50"
              >
                {deleting === post.uid ? "…" : "Удалить"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
