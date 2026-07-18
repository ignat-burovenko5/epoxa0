"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CatalogProductSummary, ProductStatus } from "@/lib/shop/product-types";
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

const STATUS_SORT_RANK: Record<ProductStatus, number> = {
  active: 0,
  draft: 1,
  archived: 2,
};

const EMPTY_CATEGORY = "Без категории";

const controlClass =
  "min-h-12 w-full bg-luxury-base border border-museum-light/20 px-3.5 py-2.5 font-sans text-sm text-museum-light focus:border-accent-gold/50 focus:outline-none";

type ProductListProps = {
  products: CatalogProductSummary[];
  initialStatus?: string;
};

function productCategoryKey(product: CatalogProductSummary): string {
  return product.category?.trim() || EMPTY_CATEGORY;
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

function compareProducts(a: CatalogProductSummary, b: CatalogProductSummary, sort: SortKey): number {
  switch (sort) {
    case "title_asc":
      return a.title.localeCompare(b.title, "ru", { sensitivity: "base" });
    case "title_desc":
      return b.title.localeCompare(a.title, "ru", { sensitivity: "base" });
    case "price_asc":
      return a.price - b.price || a.title.localeCompare(b.title, "ru");
    case "price_desc":
      return b.price - a.price || a.title.localeCompare(b.title, "ru");
    case "sort_asc":
      return a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "ru");
    case "sort_desc":
      return b.sortOrder - a.sortOrder || a.title.localeCompare(b.title, "ru");
    case "category_asc":
      return (
        productCategoryKey(a).localeCompare(productCategoryKey(b), "ru") ||
        a.title.localeCompare(b.title, "ru")
      );
    case "era_asc":
      return (
        (a.era || "").localeCompare(b.era || "", "ru") ||
        a.title.localeCompare(b.title, "ru")
      );
    case "status":
      return (
        STATUS_SORT_RANK[a.status] - STATUS_SORT_RANK[b.status] ||
        a.title.localeCompare(b.title, "ru")
      );
    case "featured":
      return Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title, "ru");
    case "updated_asc": {
      const ta = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const tb = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return ta - tb || a.title.localeCompare(b.title, "ru");
    }
    case "updated_desc":
    default: {
      const ta = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const tb = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return tb - ta || a.title.localeCompare(b.title, "ru");
    }
  }
}

export default function ProductList({
  products: initialProducts,
  initialStatus = "all",
}: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [filter, setFilter] = useState(initialStatus);
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("updated_desc");
  const [q, setQ] = useState("");
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      const key = productCategoryKey(p);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    const known = siteConfig.categoryLinks
      .map((c) => c.label)
      .filter((label) => map.has(label));
    const extras = [...map.keys()]
      .filter((label) => !known.includes(label))
      .sort((a, b) => a.localeCompare(b, "ru"));
    return [
      { label: "all", count: products.length },
      ...[...known, ...extras].map((label) => ({
        label,
        count: map.get(label) ?? 0,
      })),
    ];
  }, [products]);

  const categoryChoices = useMemo(
    () => categoryCounts.filter((item) => item.label !== "all"),
    [categoryCounts],
  );

  const visible = useMemo(() => {
    const query = q.trim();
    const filtered = products.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (category !== "all" && productCategoryKey(p) !== category) return false;
      return matchesExtensiveSearch(p, query);
    });
    return [...filtered].sort((a, b) => compareProducts(a, b, sort));
  }, [products, filter, category, q, sort]);

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

  const hasActiveFilters = Boolean(q.trim()) || category !== "all" || filter !== "all";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(20rem,24rem)_minmax(0,1fr)] xl:gap-10">
      <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
        <div className="border border-museum-light/10 bg-luxury-base/30 p-5 md:p-6">
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-accent-gold/80 mb-4">
            Категории
          </p>
          <ul className="list-none m-0 p-0 max-h-[min(75vh,48rem)] overflow-y-auto hidden-scrollbar space-y-1">
            {categoryCounts.map((item) => {
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
                placeholder="Название, slug, категория, эпоха, цена, статус…  >10000  featured"
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
                {visible.length} из {products.length}
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
            Ищет по названию, slug, категории, эпохе, статусу, цене, порядку, избранному и дате.
            Числовые фильтры:{" "}
            <span className="text-museum-light/55">{" >5000 <20000 =12000 "}</span>
            · слова{" "}
            <span className="text-museum-light/55">featured · черновик · архив</span>
          </p>
        </div>

        {error ? (
          <p className="font-sans text-sm text-red-300/90" role="alert">
            {error}
          </p>
        ) : null}

        {!visible.length ? (
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
        )}
      </div>
    </div>
  );
}
