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

type ProductListProps = {
  products: CatalogProductSummary[];
  initialStatus?: string;
};

export default function ProductList({
  products: initialProducts,
  initialStatus = "all",
}: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [filter, setFilter] = useState(initialStatus);
  const [category, setCategory] = useState<string>("all");
  const [q, setQ] = useState("");
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of products) {
      const key = p.category?.trim() || "Без категории";
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

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (category !== "all") {
        const cat = p.category?.trim() || "Без категории";
        if (cat !== category) return false;
      }
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.era.toLowerCase().includes(query)
      );
    });
  }, [products, filter, category, q]);

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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:self-start space-y-4">
        <div className="border border-museum-light/10 bg-luxury-base/30 p-4">
          <p className="font-sans text-[10px] tracking-widest uppercase text-accent-gold/75 mb-3">
            Категории
          </p>
          <ul className="list-none m-0 p-0 max-h-[min(70vh,40rem)] overflow-y-auto hidden-scrollbar space-y-0.5">
            {categoryCounts.map((item) => {
              const id = item.label;
              const active = category === id;
              const label = id === "all" ? "Все категории" : id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setCategory(id)}
                    className={`flex w-full items-start justify-between gap-2 min-h-10 px-2.5 py-2 text-left font-sans text-[11px] leading-snug tracking-wide transition-colors ${
                      active
                        ? "bg-accent-brass/15 text-accent-gold border-l-2 border-accent-gold"
                        : "text-museum-light/60 hover:text-museum-light border-l-2 border-transparent hover:bg-museum-light/[0.04]"
                    }`}
                  >
                    <span className="min-w-0 break-words">{label}</span>
                    <span className="shrink-0 tabular-nums text-museum-light/35">
                      {item.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      <div className="min-w-0 space-y-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`min-h-10 px-3.5 font-sans text-[10px] tracking-widest uppercase border transition-colors ${
                  filter === item.id
                    ? "border-accent-gold/70 text-accent-gold bg-accent-brass/10"
                    : "border-museum-light/20 text-museum-light/55 hover:border-museum-light/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:min-w-[20rem] sm:flex-1 xl:flex-none xl:w-[22rem]">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по названию, slug, эпохе…"
              className="w-full min-h-11 bg-luxury-base border border-museum-light/20 px-3 py-2 font-sans text-sm text-museum-light focus:border-accent-gold/50 focus:outline-none"
            />
            <p className="font-sans text-xs text-museum-light/45 whitespace-nowrap sm:px-1">
              {visible.length} из {products.length}
            </p>
          </div>
        </div>

        {error ? (
          <p className="font-sans text-sm text-red-300/90" role="alert">
            {error}
          </p>
        ) : null}

        {!visible.length ? (
          <p className="font-sans text-sm text-museum-light/60 text-center py-16 border border-museum-light/10">
            Товаров нет.{" "}
            <Link
              href={blogDashboardProductCreatePath()}
              className="text-accent-gold hover:underline"
            >
              Добавить
            </Link>
          </p>
        ) : (
          <ul className="list-none m-0 p-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5">
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
                    <div className="flex h-full w-full items-center justify-center font-sans text-[10px] uppercase tracking-widest text-museum-light/30">
                      Нет фото
                    </div>
                  )}
                  <span className="absolute left-2 top-2 font-sans text-[9px] tracking-widest uppercase px-2 py-1 bg-luxury-base/85 text-museum-light/80 border border-museum-light/15">
                    {STATUS_LABEL[product.status]}
                    {product.featured ? " · ★" : ""}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col gap-2 p-3.5 md:p-4">
                  <p className="font-sans text-[10px] tracking-widest uppercase text-accent-gold/70 line-clamp-2">
                    {product.category || "Без категории"}
                  </p>
                  <h2 className="font-serif text-lg md:text-xl text-museum-light leading-snug line-clamp-2">
                    {product.title}
                  </h2>
                  <p className="font-sans text-xs text-museum-light/45 line-clamp-1">
                    {product.era || "—"}
                  </p>
                  <p className="font-serif text-xl text-museum-light mt-auto pt-1">
                    {formatPrice(product.price)}
                    {product.compareAtPrice && product.compareAtPrice > product.price ? (
                      <span className="ml-2 font-sans text-xs text-museum-light/35 line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    ) : null}
                  </p>
                  <p className="font-sans text-[10px] text-museum-light/30 truncate">
                    /{product.slug}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-1.5 border-t border-museum-light/10 pt-3">
                    <Link
                      href={blogDashboardProductEditPath(product.slug)}
                      className="min-h-10 px-2.5 inline-flex items-center font-sans text-[10px] tracking-widest uppercase border border-museum-light/25 hover:border-accent-gold/50"
                    >
                      Изменить
                    </Link>
                    <a
                      href={`/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-10 px-2.5 inline-flex items-center font-sans text-[10px] tracking-widest uppercase text-museum-light/50 hover:text-accent-gold"
                    >
                      Сайт
                    </a>
                    {product.status !== "active" ? (
                      <button
                        type="button"
                        disabled={busySlug === product.slug}
                        onClick={() => void setStatus(product.slug, "active")}
                        className="min-h-10 px-2.5 font-sans text-[10px] tracking-widest uppercase text-emerald-300/80 hover:text-emerald-200 disabled:opacity-50"
                      >
                        В каталог
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busySlug === product.slug}
                        onClick={() => void setStatus(product.slug, "archived")}
                        className="min-h-10 px-2.5 font-sans text-[10px] tracking-widest uppercase text-museum-light/50 hover:text-accent-gold disabled:opacity-50"
                      >
                        В архив
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busySlug === product.slug}
                      onClick={() => void remove(product.slug, product.title)}
                      className="min-h-10 px-2.5 ml-auto font-sans text-[10px] tracking-widest uppercase text-red-300/70 hover:text-red-200 disabled:opacity-50"
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
