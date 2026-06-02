"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BlogPostCard from "@/components/blog/BlogPostCard";
import type { BlogListPage, BlogPostSummary } from "@/lib/blog/types";

type BlogInfiniteListProps = {
  initialItems: BlogPostSummary[];
  initialTotal: number;
  initialHasMore: boolean;
  pageSize: number;
  itemLabel: string;
  emptyMessage: string;
};

export default function BlogInfiniteList({
  initialItems,
  initialTotal,
  initialHasMore,
  pageSize,
  itemLabel,
  emptyMessage,
}: BlogInfiniteListProps) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    setItems(initialItems);
    setTotal(initialTotal);
    setHasMore(initialHasMore);
    setError(null);
  }, [initialItems, initialTotal, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        offset: String(items.length),
        limit: String(pageSize),
      });
      const res = await fetch(`/api/blog?${params.toString()}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = (await res.json()) as BlogListPage;

      setItems((prev) => {
        const seen = new Set(prev.map((e) => e.uid));
        const next = data.items.filter((e) => !seen.has(e.uid));
        return [...prev, ...next];
      });
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch {
      setError("Не удалось загрузить ещё записи. Попробуйте ещё раз.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, items.length, pageSize]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (!items.length) {
    return (
      <p className="text-center font-sans text-sm text-museum-light/60 py-8">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div>
      <ul className="space-y-5 md:space-y-6 list-none p-0 m-0 mb-8">
        {items.map((post) => (
          <li key={post.uid} className="list-none">
            <BlogPostCard post={post} />
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />

      {loading ? (
        <p className="text-center font-sans text-xs tracking-widest uppercase text-museum-light/50">
          Загрузка…
        </p>
      ) : null}

      {error ? (
        <div className="text-center">
          <p className="font-sans text-sm text-museum-light/70 mb-3">{error}</p>
          <button
            type="button"
            onClick={() => void loadMore()}
            className="font-sans text-xs tracking-widest uppercase text-accent-gold hover:text-museum-light transition-colors min-h-12 px-4"
          >
            Повторить
          </button>
        </div>
      ) : null}

      {!hasMore ? (
        <p className="text-center font-sans text-xs text-museum-light/45">
          Показаны все {total} {itemLabel}
        </p>
      ) : null}
    </div>
  );
}
