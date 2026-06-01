"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CatalogGrid, type CatalogItem } from "@/components/CatalogGrid";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog";

type CatalogPageResponse = {
  items: CatalogItem[];
  total: number;
  offset: number;
  nextOffset: number;
  hasMore: boolean;
};

type CatalogInfiniteGridProps = {
  initialItems: CatalogItem[];
  initialTotal: number;
  initialHasMore: boolean;
  categorySlug?: string | null;
};

export default function CatalogInfiniteGrid({
  initialItems,
  initialTotal,
  initialHasMore,
  categorySlug = null,
}: CatalogInfiniteGridProps) {
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
  }, [initialItems, initialTotal, initialHasMore, categorySlug]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        offset: String(items.length),
        limit: String(CATALOG_PAGE_SIZE),
      });
      if (categorySlug) {
        params.set("category", categorySlug);
      }

      const res = await fetch(`/api/catalog?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Не удалось загрузить предметы");
      }

      const data = (await res.json()) as CatalogPageResponse;

      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.slug));
        const next = data.items.filter((p) => !seen.has(p.slug));
        return [...prev, ...next];
      });
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch {
      setError("Не удалось загрузить ещё предметы. Попробуйте ещё раз.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [categorySlug, hasMore, items.length]);

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
      <CatalogGrid items={items} />

      <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />

      {loading ? (
        <p className="mt-10 text-center font-sans text-xs tracking-widest uppercase text-luxury-charcoal/50">
          Загрузка…
        </p>
      ) : null}

      {error ? (
        <div className="mt-8 text-center">
          <p className="font-sans text-sm text-luxury-charcoal/70 mb-3">{error}</p>
          <button
            type="button"
            onClick={() => void loadMore()}
            className="font-sans text-xs tracking-widest uppercase text-accent-brass hover:text-luxury-base transition-colors min-h-12 px-4"
          >
            Повторить
          </button>
        </div>
      ) : null}

      {!hasMore && items.length > 0 ? (
        <p className="mt-10 text-center font-sans text-xs text-luxury-charcoal/45">
          Показаны все {total} предметов
        </p>
      ) : null}

      {!hasMore && items.length === 0 ? (
        <p className="mt-10 text-center font-sans text-sm text-luxury-charcoal/60">
          В этой категории пока нет предметов.
        </p>
      ) : null}
    </div>
  );
}
