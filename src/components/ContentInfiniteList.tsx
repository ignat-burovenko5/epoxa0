"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ContentEntryCard from "@/components/ContentEntryCard";
import {
  CONTENT_PAGE_SIZE,
  type ContentEntrySummary,
  type ContentPageResult,
} from "@/lib/content";

type ContentInfiniteListProps = {
  sectionId: string;
  initialItems: ContentEntrySummary[];
  initialTotal: number;
  initialHasMore: boolean;
  itemLabel?: string;
};

export default function ContentInfiniteList({
  sectionId,
  initialItems,
  initialTotal,
  initialHasMore,
  itemLabel = "материалов",
}: ContentInfiniteListProps) {
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
  }, [initialItems, initialTotal, initialHasMore, sectionId]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        section: sectionId,
        offset: String(items.length),
        limit: String(CONTENT_PAGE_SIZE),
      });

      const res = await fetch(`/api/content?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Не удалось загрузить материалы");
      }

      const data = (await res.json()) as ContentPageResult;

      setItems((prev) => {
        const seen = new Set(prev.map((e) => e.slug));
        const next = data.items.filter((e) => !seen.has(e.slug));
        return [...prev, ...next];
      });
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch {
      setError("Не удалось загрузить ещё материалы. Попробуйте ещё раз.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, items.length, sectionId]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div>
      <ul className="space-y-0 list-none p-0 m-0 mb-8">
        {items.map((entry) => (
          <li key={entry.slug}>
            <ContentEntryCard entry={entry} />
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

      {!hasMore && items.length > 0 ? (
        <p className="text-center font-sans text-xs text-museum-light/45">
          Показаны все {total} {itemLabel}
        </p>
      ) : null}

      {!hasMore && items.length === 0 ? (
        <p className="text-center font-sans text-sm text-museum-light/60">
          Пока нет материалов в этом разделе.
        </p>
      ) : null}
    </div>
  );
}
