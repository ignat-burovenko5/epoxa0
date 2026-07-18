"use client";

import Link from "next/link";
import { useState } from "react";
import ProductList from "@/components/blog/cms/ProductList";
import type { CatalogProductSummary, ProductListPage } from "@/lib/shop/product-types";
import {
  blogDashboardProductCreatePath,
} from "@/lib/blog/urls";
import { formatPrice } from "@/lib/catalog";

type DashboardProductsPanelProps = {
  initialPage: ProductListPage;
  initialStatus?: string;
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="border border-museum-light/10 bg-luxury-base/40 p-4 md:p-5">
      <p className="font-sans text-[10px] tracking-widest uppercase text-accent-gold/70 mb-2">
        {label}
      </p>
      <p className="font-serif text-2xl md:text-3xl text-museum-light">{value}</p>
      {hint ? (
        <p className="mt-2 font-sans text-xs text-museum-light/45 leading-relaxed">{hint}</p>
      ) : null}
    </div>
  );
}

export default function DashboardProductsPanel({
  initialPage,
  initialStatus = "all",
}: DashboardProductsPanelProps) {
  const [products] = useState<CatalogProductSummary[]>(initialPage.items);
  const counts = initialPage.counts;
  const activeValue = products
    .filter((p) => p.status === "active")
    .reduce((sum, p) => sum + p.price, 0);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  async function reseed() {
    if (!confirm("Импортировать товары из catalog.json? Существующие slug не перезапишутся.")) {
      return;
    }
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res = await fetch("/api/blog/admin/products-seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: false }),
      });
      const data = (await res.json()) as {
        error?: string;
        created?: number;
        skipped?: number;
        updated?: number;
      };
      if (!res.ok) {
        setSeedMsg(data.error ?? "Ошибка импорта");
        return;
      }
      setSeedMsg(
        `Импорт: +${data.created ?? 0}, пропущено ${data.skipped ?? 0}. Обновите страницу.`,
      );
    } catch {
      setSeedMsg("Ошибка сети");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-serif text-xl md:text-2xl mb-1">Товары</h2>
        <p className="font-sans text-sm text-museum-light/50 mb-6">
          Каталог салона: публикация, архив, цены и описания
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <StatCard label="Всего" value={counts.all} />
          <StatCard label="На сайте" value={counts.active} />
          <StatCard label="Архив" value={counts.archived} />
          <StatCard
            label="Сумма на сайте"
            value={formatPrice(activeValue)}
            hint={`${counts.draft} черновиков`}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={blogDashboardProductCreatePath()}
            className="min-h-11 px-5 inline-flex items-center font-sans text-xs tracking-widest uppercase bg-accent-gold/90 text-luxury-base hover:bg-accent-gold"
          >
            Новый товар
          </Link>
          <Link
            href="/collection"
            className="min-h-11 px-5 inline-flex items-center font-sans text-xs tracking-widest uppercase text-museum-light/50 hover:text-accent-gold"
          >
            Открыть каталог
          </Link>
          <button
            type="button"
            disabled={seeding}
            onClick={() => void reseed()}
            className="min-h-11 px-5 font-sans text-xs tracking-widest uppercase border border-museum-light/20 text-museum-light/60 hover:border-accent-gold/40 disabled:opacity-50"
          >
            {seeding ? "Импорт…" : "Импорт из JSON"}
          </button>
        </div>
        {seedMsg ? (
          <p className="mt-3 font-sans text-sm text-museum-light/60">{seedMsg}</p>
        ) : null}
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="font-serif text-xl md:text-2xl">Список товаров</h2>
          <p className="font-sans text-sm text-museum-light/55">
            {counts.active} на сайте · {counts.archived} в архиве · {counts.all} всего
          </p>
        </div>
        <ProductList products={products} initialStatus={initialStatus} />
      </section>
    </div>
  );
}
