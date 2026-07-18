"use client";

import Link from "next/link";
import { useState } from "react";
import ProductList from "@/components/blog/cms/ProductList";
import type { ProductListPage } from "@/lib/shop/product-types";
import { blogDashboardProductCreatePath } from "@/lib/blog/urls";

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
    <div className="border border-museum-light/10 bg-luxury-base/40 px-4 py-4 md:px-5 md:py-5 min-h-[5.5rem]">
      <p className="font-sans text-[10px] tracking-widest uppercase text-accent-gold/70 mb-2">
        {label}
      </p>
      <p className="font-serif text-2xl md:text-3xl xl:text-4xl text-museum-light leading-none">
        {value}
      </p>
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
  const counts = initialPage.counts;
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
    <div className="space-y-8 md:space-y-10">
      <section className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <h2 className="font-serif text-2xl md:text-3xl xl:text-4xl mb-1">Каталог товаров</h2>
          <p className="font-sans text-sm md:text-base text-museum-light/50 max-w-2xl">
            Крупный обзор коллекции: категории слева, карточки справа. Подгрузка по прокрутке.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link
            href={blogDashboardProductCreatePath()}
            className="min-h-12 px-6 inline-flex items-center font-sans text-xs tracking-widest uppercase bg-accent-gold/90 text-luxury-base hover:bg-accent-gold"
          >
            Новый товар
          </Link>
          <Link
            href="/collection"
            className="min-h-12 px-5 inline-flex items-center font-sans text-xs tracking-widest uppercase border border-museum-light/20 text-museum-light/60 hover:border-accent-gold/40 hover:text-accent-gold"
          >
            Сайт
          </Link>
          <button
            type="button"
            disabled={seeding}
            onClick={() => void reseed()}
            className="min-h-12 px-5 font-sans text-xs tracking-widest uppercase border border-museum-light/20 text-museum-light/60 hover:border-accent-gold/40 disabled:opacity-50"
          >
            {seeding ? "Импорт…" : "Импорт JSON"}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Всего" value={counts.all} />
        <StatCard label="На сайте" value={counts.active} />
        <StatCard label="Архив" value={counts.archived} />
        <StatCard label="Черновики" value={counts.draft} />
      </section>

      {seedMsg ? (
        <p className="font-sans text-sm text-museum-light/60">{seedMsg}</p>
      ) : null}

      <section>
        <ProductList initialPage={initialPage} initialStatus={initialStatus} />
      </section>
    </div>
  );
}
