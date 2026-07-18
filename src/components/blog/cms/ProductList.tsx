"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CatalogProductSummary, ProductStatus } from "@/lib/shop/product-types";
import { formatPrice } from "@/lib/catalog";
import {
  blogDashboardProductCreatePath,
  blogDashboardProductEditPath,
} from "@/lib/blog/urls";

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
  const [q, setQ] = useState("");
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    return products.filter((p) => {
      if (filter !== "all" && p.status !== filter) return false;
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    });
  }, [products, filter, q]);

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

  const filters: { id: string; label: string }[] = [
    { id: "all", label: "Все" },
    { id: "active", label: "На сайте" },
    { id: "draft", label: "Черновики" },
    { id: "archived", label: "Архив" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`min-h-10 px-3 font-sans text-[10px] tracking-widest uppercase border transition-colors ${
                filter === item.id
                  ? "border-accent-gold/70 text-accent-gold bg-accent-brass/10"
                  : "border-museum-light/20 text-museum-light/55 hover:border-museum-light/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск…"
          className="w-full md:w-64 bg-luxury-base border border-museum-light/20 px-3 py-2 font-sans text-sm text-museum-light focus:border-accent-gold/50 focus:outline-none"
        />
      </div>

      {error ? (
        <p className="font-sans text-sm text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}

      {!visible.length ? (
        <p className="font-sans text-sm text-museum-light/60 text-center py-12">
          Товаров нет.{" "}
          <Link
            href={blogDashboardProductCreatePath()}
            className="text-accent-gold hover:underline"
          >
            Добавить
          </Link>
        </p>
      ) : (
        <ul className="list-none p-0 m-0 divide-y divide-museum-light/10">
          {visible.map((product) => (
            <li
              key={product.slug}
              className="py-5 flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between"
            >
              <div className="min-w-0 flex-1 flex gap-4">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin thumb
                  <img
                    src={product.image}
                    alt=""
                    className="h-16 w-14 shrink-0 object-cover border border-museum-light/10 bg-luxury-base"
                  />
                ) : (
                  <div className="h-16 w-14 shrink-0 border border-museum-light/10 bg-luxury-base/50" />
                )}
                <div className="min-w-0">
                  <p className="font-sans text-[10px] tracking-widest uppercase text-museum-light/45 mb-1">
                    {STATUS_LABEL[product.status]}
                    {product.featured ? " · избранное" : ""}
                    {" · "}
                    {formatPrice(product.price)}
                  </p>
                  <h2 className="font-serif text-lg text-museum-light truncate">
                    {product.title}
                  </h2>
                  <p className="font-sans text-xs text-museum-light/50 mt-1 truncate">
                    {product.category}
                    {product.era ? ` · ${product.era}` : ""}
                  </p>
                  <p className="font-sans text-[10px] text-museum-light/35 mt-1 truncate">
                    /{product.slug}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Link
                  href={blogDashboardProductEditPath(product.slug)}
                  className="min-h-11 px-3 inline-flex items-center font-sans text-xs tracking-widest uppercase border border-museum-light/25 hover:border-accent-gold/50"
                >
                  Изменить
                </Link>
                <a
                  href={`/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-11 px-3 inline-flex items-center font-sans text-xs tracking-widest uppercase text-museum-light/50 hover:text-accent-gold"
                >
                  Сайт
                </a>
                {product.status !== "active" ? (
                  <button
                    type="button"
                    disabled={busySlug === product.slug}
                    onClick={() => void setStatus(product.slug, "active")}
                    className="min-h-11 px-3 font-sans text-xs tracking-widest uppercase text-emerald-300/80 hover:text-emerald-200 disabled:opacity-50"
                  >
                    В каталог
                  </button>
                ) : null}
                {product.status !== "archived" ? (
                  <button
                    type="button"
                    disabled={busySlug === product.slug}
                    onClick={() => void setStatus(product.slug, "archived")}
                    className="min-h-11 px-3 font-sans text-xs tracking-widest uppercase text-museum-light/50 hover:text-accent-gold disabled:opacity-50"
                  >
                    В архив
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busySlug === product.slug}
                    onClick={() => void setStatus(product.slug, "draft")}
                    className="min-h-11 px-3 font-sans text-xs tracking-widest uppercase text-museum-light/50 hover:text-accent-gold disabled:opacity-50"
                  >
                    Черновик
                  </button>
                )}
                <button
                  type="button"
                  disabled={busySlug === product.slug}
                  onClick={() => void remove(product.slug, product.title)}
                  className="min-h-11 px-3 font-sans text-xs tracking-widest uppercase text-red-300/80 hover:text-red-200 disabled:opacity-50"
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
