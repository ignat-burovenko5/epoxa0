"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CatalogProductSummary,
  ProductListPage,
  ProductStatus,
} from "@/lib/shop/product-types";
import { ADMIN_PRODUCT_PAGE_SIZE } from "@/lib/shop/product-types";
import { formatPrice } from "@/lib/catalog-shared";
import {
  blogDashboardProductCreatePath,
  blogDashboardProductEditPath,
} from "@/lib/blog/urls";
import { siteConfig } from "@/lib/site";

const STATUS_LABEL: Record<ProductStatus, string> = {
  active: "На сайте",
  draft: "Черновик",
  archived: "Архив",
};

type SortKey =
  | "updated_desc"
  | "updated_asc"
  | "title_asc"
  | "title_desc"
  | "price_asc"
  | "price_desc"
  | "sort_asc"
  | "sort_desc"
  | "category_asc"
  | "era_asc"
  | "status"
  | "featured";

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "updated_desc", label: "Сначала новые" },
  { id: "updated_asc", label: "Сначала старые" },
  { id: "title_asc", label: "Название А→Я" },
  { id: "title_desc", label: "Название Я→А" },
  { id: "price_asc", label: "Цена ↑" },
  { id: "price_desc", label: "Цена ↓" },
  { id: "sort_asc", label: "Порядок ↑" },
  { id: "sort_desc", label: "Порядок ↓" },
  { id: "category_asc", label: "Категория А→Я" },
  { id: "era_asc", label: "Эпоха А→Я" },
  { id: "status", label: "По статусу" },
  { id: "featured", label: "Избранные сверху" },
];

const EMPTY_CATEGORY = "Без категории";

const controlClass =
  "min-h-12 w-full bg-luxury-base border border-museum-light/20 px-3.5 py-2.5 font-sans text-sm text-museum-light focus:border-accent-gold/50 focus:outline-none";

type ProductListProps = {
  initialPage: ProductListPage;
  initialStatus?: string;
};

function productCategoryKey(product: CatalogProductSummary): string {
  return product.category?.trim() || EMPTY_CATEGORY;
}

function needsClientPriceFilter(query: string): boolean {
  return /[><=]\d/.test(query) || /\b(featured|избранн)/i.test(query);
}

function matchesExtensiveSearch(product: CatalogProductSummary, query: string): boolean {
  if (!query) return true;

  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return true;

  const priceText = String(product.price);
  const compareText =
    product.compareAtPrice != null ? String(product.compareAtPrice) : "";
  const priceFormatted = formatPrice(product.price).toLowerCase();
  const compareFormatted =
    product.compareAtPrice != null
      ? formatPrice(product.compareAtPrice).toLowerCase()
      : "";
  const updated = product.updatedAt
    ? new Date(product.updatedAt).toLocaleString("ru-RU").toLowerCase()
    : "";
  const updatedIso = product.updatedAt?.toLowerCase() ?? "";

  const haystack = [
    product.title,
    product.slug,
    product.category,
    product.era,
    product.status,
    STATUS_LABEL[product.status],
    priceText,
    compareText,
    priceFormatted,
    compareFormatted,
    String(product.sortOrder),
    product.featured ? "избранный featured избранное звезда" : "",
    product.image ? "есть фото image" : "нет фото no image",
    updated,
    updatedIso,
    `/${product.slug}`,
  ]
    .join(" ")
    .toLowerCase();

  return tokens.every((token) => {
    if (token.startsWith(">") || token.startsWith("<") || token.startsWith("=")) {
      const op = token[0];
      const raw = token.slice(1).replace(/[^\d.]/g, "");
      if (!raw) return haystack.includes(token);
      const n = Number(raw);
      if (!Number.isFinite(n)) return haystack.includes(token);
      if (op === ">") return product.price > n;
      if (op === "<") return product.price < n;
      return product.price === n;
    }
    if (token === "featured" || token === "избранный" || token === "избранное") {
      return product.featured;
    }
    if (token === "active" || token === "сайт" || token === "опубликован") {
      return product.status === "active";
    }
    if (token === "draft" || token === "черновик") {
      return product.status === "draft";
    }
    if (token === "archived" || token === "архив") {
      return product.status === "archived";
    }
    return haystack.includes(token);
  });
}

async function fetchProductPage(params: {
  offset: number;
  limit?: number;
  status: string;
  q: string;
  category: string;
  sort: SortKey;
}): Promise<ProductListPage> {
  const sp = new URLSearchParams({
    offset: String(params.offset),
    limit: String(params.limit ?? ADMIN_PRODUCT_PAGE_SIZE),
    sort: params.sort,
  });
  if (params.status !== "all") sp.set("status", params.status);
  if (params.q.trim()) sp.set("q", params.q.trim());
  if (params.category !== "all") sp.set("category", params.category);

  const res = await fetch(`/api/blog/admin/products?${sp}`, {
    credentials: "same-origin",
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Не удалось загрузить товары");
  }
  return (await res.json()) as ProductListPage;
}

export default function ProductList({
  initialPage,
  initialStatus = "all",
}: ProductListProps) {
  const [products, setProducts] = useState(initialPage.items);
  const [total, setTotal] = useState(initialPage.total);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [nextOffset, setNextOffset] = useState(initialPage.nextOffset);
  const [counts, setCounts] = useState(initialPage.counts);
  const [categoryCounts, setCategoryCounts] = useState(
    initialPage.categoryCounts ?? [],
  );

  const [filter, setFilter] = useState(initialStatus);
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("updated_desc");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q), 280);
    return () => window.clearTimeout(t);
  }, [q]);

  const reload = useCallback(
    async (opts?: { keepScroll?: boolean }) => {
      const id = ++requestIdRef.current;
      setRefreshing(true);
      setError(null);
      try {
        const page = await fetchProductPage({
          offset: 0,
          status: filter,
          q: debouncedQ,
          category,
          sort,
        });
        if (id !== requestIdRef.current) return;
        setProducts(page.items);
        setTotal(page.total);
        setHasMore(page.hasMore);
        setNextOffset(page.nextOffset);
        setCounts(page.counts);
        if (page.categoryCounts) setCategoryCounts(page.categoryCounts);
        if (!opts?.keepScroll) {
          // stay put — admin is scanning
        }
      } catch (e) {
        if (id !== requestIdRef.current) return;
        setError(e instanceof Error ? e.message : "Ошибка загрузки");
      } finally {
        if (id === requestIdRef.current) setRefreshing(false);
      }
    },
    [filter, debouncedQ, category, sort],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || refreshing) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    const id = requestIdRef.current;
    try {
      const page = await fetchProductPage({
        offset: nextOffset,
        status: filter,
        q: debouncedQ,
        category,
        sort,
      });
      if (id !== requestIdRef.current) return;
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.slug));
        return [...prev, ...page.items.filter((p) => !seen.has(p.slug))];
      });
      setTotal(page.total);
      setHasMore(page.hasMore);
      setNextOffset(page.nextOffset);
      setCounts(page.counts);
      if (page.categoryCounts) setCategoryCounts(page.categoryCounts);
    } catch (e) {
      if (id !== requestIdRef.current) return;
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore, refreshing, nextOffset, filter, debouncedQ, category, sort]);

  // Price/featured ops need the full filtered set — keep paging until done.
  useEffect(() => {
    if (!needsClientPriceFilter(debouncedQ) || !hasMore || loading || refreshing) {
      return;
    }
    void loadMore();
  }, [debouncedQ, hasMore, loading, refreshing, loadMore, products.length]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { root: null, rootMargin: "320px 0px", threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const sidebarCategories = useMemo(() => {
    const knownOrder = siteConfig.categoryLinks.map((c) => c.label);
    const map = new Map(categoryCounts.map((c) => [c.label, c.count]));
    const known = knownOrder.filter((label) => map.has(label));
    const extras = [...map.keys()]
      .filter((label) => !known.includes(label))
      .sort((a, b) => a.localeCompare(b, "ru"));
    const facetTotal = categoryCounts.reduce((s, c) => s + c.count, 0);
    return [
      { label: "all", count: facetTotal || total },
      ...[...known, ...extras].map((label) => ({
        label,
        count: map.get(label) ?? 0,
      })),
    ];
  }, [categoryCounts, total]);

  const categoryChoices = useMemo(
    () => sidebarCategories.filter((item) => item.label !== "all"),
    [sidebarCategories],
  );

  const visible = useMemo(() => {
    if (!needsClientPriceFilter(debouncedQ)) return products;
    return products.filter((p) => matchesExtensiveSearch(p, debouncedQ));
  }, [products, debouncedQ]);

  async function setStatus(slug: string, status: ProductStatus) {
    setBusySlug(slug);
    setError(null);
    try {
      const res = await fetch(`/api/blog/admin/products/${encodeURIComponent(slug)}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Не удалось изменить статус");
        return;
      }
      setProducts((current) =>
        current.map((p) => (p.slug === slug ? { ...p, status } : p)),
      );
      void reload({ keepScroll: true });
    } catch {
      setError("Ошибка сети");
    } finally {
      setBusySlug(null);
    }
  }

  async function remove(slug: string, title: string) {
    if (!confirm(`Удалить «${title}» навсегда?`)) return;
    setBusySlug(slug);
    setError(null);
    try {
      const res = await fetch(`/api/blog/admin/products/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Не удалось удалить");
        return;
      }
      setProducts((current) => current.filter((p) => p.slug !== slug));
      void reload({ keepScroll: true });
    } catch {
      setError("Ошибка сети");
    } finally {
      setBusySlug(null);
    }
  }

  const statusFilters: { id: string; label: string }[] = [
    { id: "all", label: "Все" },
    { id: "active", label: "На сайте" },
    { id: "draft", label: "Черновики" },
    { id: "archived", label: "Архив" },
  ];

  const hasActiveFilters =
    Boolean(q.trim()) || category !== "all" || filter !== "all";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)] xl:gap-10">
      <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
        <div className="border border-museum-light/10 bg-luxury-base/30 p-5 md:p-6">
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-accent-gold/80 mb-4">
            Категории
          </p>
          <ul className="list-none m-0 p-0 max-h-[min(75vh,48rem)] overflow-y-auto hidden-scrollbar space-y-1">
            {sidebarCategories.map((item) => {
              const id = item.label;
              const active = category === id;
              const label = id === "all" ? "Все категории" : id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setCategory(id)}
                    className={`flex w-full items-center justify-between gap-3 min-h-12 px-3.5 py-3 text-left font-sans text-sm leading-snug tracking-wide transition-colors ${
                      active
                        ? "bg-accent-brass/15 text-accent-gold border-l-[3px] border-accent-gold"
                        : "text-museum-light/65 hover:text-museum-light border-l-[3px] border-transparent hover:bg-museum-light/[0.04]"
                    }`}
                  >
                    <span className="min-w-0 break-words">{label}</span>
                    <span className="shrink-0 tabular-nums text-base text-museum-light/40">
                      {item.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <div className="min-w-0 space-y-6">
        <div className="space-y-3 border border-museum-light/10 bg-luxury-base/20 p-4 md:p-5">
          <div className="flex flex-wrap gap-2.5">
            {statusFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`min-h-11 px-4 font-sans text-[11px] tracking-widest uppercase border transition-colors ${
                  filter === item.id
                    ? "border-accent-gold/70 text-accent-gold bg-accent-brass/10"
                    : "border-museum-light/20 text-museum-light/55 hover:border-museum-light/40"
                }`}
              >
                {item.label}
                {item.id === "all"
                  ? ` · ${counts.all}`
                  : item.id === "active"
                    ? ` · ${counts.active}`
                    : item.id === "draft"
                      ? ` · ${counts.draft}`
                      : ` · ${counts.archived}`}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(12rem,16rem)_minmax(12rem,16rem)_auto] xl:items-end">
            <div className="min-w-0">
              <label
                htmlFor="product-admin-search"
                className="mb-1.5 block font-sans text-[10px] tracking-widest uppercase text-museum-light/45"
              >
                Поиск по всем полям
              </label>
              <input
                id="product-admin-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Название, slug, категория, эпоха…  >10000  featured"
                className={controlClass}
              />
            </div>

            <div className="min-w-0">
              <label
                htmlFor="product-admin-category"
                className="mb-1.5 block font-sans text-[10px] tracking-widest uppercase text-museum-light/45"
              >
                Категория
              </label>
              <select
                id="product-admin-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={controlClass}
              >
                <option value="all">Все категории</option>
                {categoryChoices.map((item) => (
                  <option key={item.label} value={item.label}>
                    {item.label} ({item.count})
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="product-admin-sort"
                className="mb-1.5 block font-sans text-[10px] tracking-widest uppercase text-museum-light/45"
              >
                Сортировка
              </label>
              <select
                id="product-admin-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className={controlClass}
              >
                {SORT_OPTIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2 min-h-12 pb-0.5">
              <p className="font-sans text-sm text-museum-light/45 whitespace-nowrap">
                {visible.length}
                {hasMore || visible.length < total ? ` / ${total}` : ""} 
                {refreshing ? " · …" : ""}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    setCategory("all");
                    setFilter("all");
                  }}
                  className="font-sans text-[11px] tracking-widest uppercase text-accent-gold/80 hover:text-accent-gold"
                >
                  Сброс
                </button>
              ) : null}
            </div>
          </div>

          <p className="font-sans text-xs text-museum-light/40 leading-relaxed">
            Подгрузка по мере прокрутки · на сервере фильтр и сортировка.
            Числовые фильтры:{" "}
            <span className="text-museum-light/55">{" >5000 <20000 =12000 "}</span>
            ·{" "}
            <span className="text-museum-light/55">featured · черновик · архив</span>
          </p>
        </div>

        {error ? (
          <p className="font-sans text-sm text-red-300/90" role="alert">
            {error}
          </p>
        ) : null}

        {!visible.length && !loading && !refreshing ? (
          <p className="font-sans text-sm text-museum-light/60 text-center py-16 border border-museum-light/10">
            {hasActiveFilters ? (
              <>Ничего не найдено по текущим фильтрам.</>
            ) : (
              <>
                Товаров нет.{" "}
                <Link
                  href={blogDashboardProductCreatePath()}
                  className="text-accent-gold hover:underline"
                >
                  Добавить
                </Link>
              </>
            )}
          </p>
        ) : (
          <>
            <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 md:gap-6">
              {visible.map((product) => (
                <li
                  key={product.slug}
                  className="flex flex-col border border-museum-light/10 bg-luxury-base/25 hover:border-accent-gold/35 transition-colors"
                >
                  <Link
                    href={blogDashboardProductEditPath(product.slug)}
                    className="relative block aspect-[4/5] overflow-hidden bg-luxury-base/60"
                  >
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin catalog thumb
                      <img
                        src={product.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-sans text-xs uppercase tracking-widest text-museum-light/30">
                        Нет фото
                      </div>
                    )}
                    <span className="absolute left-2.5 top-2.5 font-sans text-[10px] tracking-widest uppercase px-2.5 py-1.5 bg-luxury-base/85 text-museum-light/85 border border-museum-light/15">
                      {STATUS_LABEL[product.status]}
                      {product.featured ? " · ★" : ""}
                    </span>
                  </Link>

                  <div className="flex flex-1 flex-col gap-2.5 p-4 md:p-5">
                    <p className="font-sans text-[11px] tracking-widest uppercase text-accent-gold/75 line-clamp-2">
                      {product.category || EMPTY_CATEGORY}
                    </p>
                    <h2 className="font-serif text-xl md:text-2xl text-museum-light leading-snug line-clamp-2">
                      {product.title}
                    </h2>
                    <p className="font-sans text-sm text-museum-light/45 line-clamp-1">
                      {product.era || "—"}
                    </p>
                    <p className="font-serif text-2xl text-museum-light mt-auto pt-1">
                      {formatPrice(product.price)}
                      {product.compareAtPrice && product.compareAtPrice > product.price ? (
                        <span className="ml-2 font-sans text-sm text-museum-light/35 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      ) : null}
                    </p>
                    <p className="font-sans text-xs text-museum-light/30 truncate">
                      /{product.slug}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-2 border-t border-museum-light/10 pt-3.5">
                      <Link
                        href={blogDashboardProductEditPath(product.slug)}
                        className="min-h-11 px-3 inline-flex items-center font-sans text-[11px] tracking-widest uppercase border border-museum-light/25 hover:border-accent-gold/50"
                      >
                        Изменить
                      </Link>
                      <a
                        href={`/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-11 px-3 inline-flex items-center font-sans text-[11px] tracking-widest uppercase text-museum-light/50 hover:text-accent-gold"
                      >
                        Сайт
                      </a>
                      {product.status !== "active" ? (
                        <button
                          type="button"
                          disabled={busySlug === product.slug}
                          onClick={() => void setStatus(product.slug, "active")}
                          className="min-h-11 px-3 font-sans text-[11px] tracking-widest uppercase text-emerald-300/80 hover:text-emerald-200 disabled:opacity-50"
                        >
                          В каталог
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busySlug === product.slug}
                          onClick={() => void setStatus(product.slug, "archived")}
                          className="min-h-11 px-3 font-sans text-[11px] tracking-widest uppercase text-museum-light/50 hover:text-accent-gold disabled:opacity-50"
                        >
                          В архив
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busySlug === product.slug}
                        onClick={() => void remove(product.slug, product.title)}
                        className="min-h-11 px-3 ml-auto font-sans text-[11px] tracking-widest uppercase text-red-300/70 hover:text-red-200 disabled:opacity-50"
                      >
                        Удал.
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />

            {loading || refreshing ? (
              <p className="text-center font-sans text-xs tracking-widest uppercase text-museum-light/45 py-6">
                Загрузка…
              </p>
            ) : null}

            {!hasMore && visible.length > 0 ? (
              <p className="text-center font-sans text-xs text-museum-light/40 py-4">
                Показаны все {total} по фильтру
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
