"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useId, useState } from "react";
import {
  CATALOG_SORT_OPTIONS,
  parseCatalogPriceRange,
  parseCatalogSort,
  type CatalogSort,
} from "@/lib/catalog-shared";
import { collectionHref } from "@/lib/site";

type CatalogSortControlsProps = {
  /** Visual placement: homepage strip, collection sidenav, or burger drawer. */
  variant?: "featured" | "sidenav" | "burger";
  className?: string;
};

function catalogPathParts(pathname: string) {
  const categoryMatch = pathname.match(/^\/collection\/([^/?#]+)/);
  const categorySlug = categoryMatch?.[1] ?? null;
  const onCollection = pathname === "/collection" || Boolean(categorySlug);
  return { categorySlug, onCollection };
}

function buildCatalogHref(
  pathname: string,
  saleOnly: boolean,
  sort: CatalogSort,
  min: number | null,
  max: number | null,
) {
  const { categorySlug, onCollection } = catalogPathParts(pathname);

  if (!onCollection) {
    return collectionHref(null, { sort, min, max });
  }

  return collectionHref(saleOnly ? null : categorySlug, {
    sale: saleOnly,
    sort,
    min,
    max,
  });
}

function PriceRangeFields({
  dark,
  layout,
}: {
  dark: boolean;
  layout: "stack" | "row";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = useId();
  const saleOnly =
    searchParams.get("sale") === "1" || searchParams.get("sale") === "true";
  const sort = parseCatalogSort(searchParams.get("sort"));
  const fromUrl = parseCatalogPriceRange(
    searchParams.get("min"),
    searchParams.get("max"),
  );

  const [minText, setMinText] = useState(
    fromUrl.min != null ? String(fromUrl.min) : "",
  );
  const [maxText, setMaxText] = useState(
    fromUrl.max != null ? String(fromUrl.max) : "",
  );

  useEffect(() => {
    setMinText(fromUrl.min != null ? String(fromUrl.min) : "");
    setMaxText(fromUrl.max != null ? String(fromUrl.max) : "");
  }, [fromUrl.min, fromUrl.max]);

  function apply(nextMin: string, nextMax: string) {
    const range = parseCatalogPriceRange(nextMin, nextMax);
    const href = buildCatalogHref(
      pathname,
      saleOnly,
      sort,
      range.min,
      range.max,
    );
    router.push(href);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    apply(minText, maxText);
  }

  function clearRange() {
    setMinText("");
    setMaxText("");
    apply("", "");
  }

  const hasRange = fromUrl.min != null || fromUrl.max != null;
  const labelClass = dark
    ? "font-sans text-[10px] tracking-[0.18em] uppercase text-museum-light/35"
    : "font-sans text-[10px] tracking-[0.18em] uppercase text-luxury-charcoal/40";
  const inputClass = dark
    ? "catalog-price-input w-full min-h-11 border-0 border-b border-museum-light/20 bg-transparent px-0 py-2 font-sans text-sm text-museum-light placeholder:text-museum-light/30 focus:border-accent-gold focus:outline-none"
    : "catalog-price-input w-full min-h-11 border-0 border-b border-luxury-charcoal/20 bg-transparent px-0 py-2 font-sans text-sm text-luxury-charcoal placeholder:text-luxury-charcoal/30 focus:border-accent-brass focus:outline-none";
  const actionClass = dark
    ? "font-sans text-[10px] tracking-[0.16em] uppercase text-accent-gold hover:text-museum-light transition-colors min-h-10"
    : "font-sans text-[10px] tracking-[0.16em] uppercase text-accent-brass hover:text-luxury-base transition-colors min-h-10";

  return (
    <form
      onSubmit={onSubmit}
      className={
        layout === "row"
          ? "catalog-price-range mt-5 flex flex-wrap items-end gap-x-5 gap-y-3"
          : "catalog-price-range mt-5 flex flex-col gap-3"
      }
      aria-labelledby={`${formId}-label`}
    >
      <p id={`${formId}-label`} className={`${labelClass} w-full mb-0`}>
        Цена, ₽
      </p>
      <div
        className={
          layout === "row"
            ? "flex flex-wrap items-end gap-x-4 gap-y-3"
            : "grid grid-cols-2 gap-3"
        }
      >
        <label className="block min-w-[7.5rem] flex-1">
          <span className="sr-only">Цена от</span>
          <input
            type="text"
            inputMode="numeric"
            name="min"
            autoComplete="off"
            placeholder="От"
            value={minText}
            onChange={(e) => setMinText(e.target.value.replace(/[^\d\s]/g, ""))}
            className={inputClass}
          />
        </label>
        <label className="block min-w-[7.5rem] flex-1">
          <span className="sr-only">Цена до</span>
          <input
            type="text"
            inputMode="numeric"
            name="max"
            autoComplete="off"
            placeholder="До"
            value={maxText}
            onChange={(e) => setMaxText(e.target.value.replace(/[^\d\s]/g, ""))}
            className={inputClass}
          />
        </label>
      </div>
      <div className="flex items-center gap-4">
        <button type="submit" className={actionClass}>
          Применить
        </button>
        {hasRange ? (
          <button type="button" onClick={clearRange} className={actionClass}>
            Сбросить
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default function CatalogSortControls({
  variant = "featured",
  className = "",
}: CatalogSortControlsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const saleOnly =
    searchParams.get("sale") === "1" || searchParams.get("sale") === "true";
  const current = parseCatalogSort(searchParams.get("sort"));
  const priceRange = parseCatalogPriceRange(
    searchParams.get("min"),
    searchParams.get("max"),
  );
  const onCatalog =
    pathname === "/collection" || pathname.startsWith("/collection/");

  if (variant === "sidenav" || variant === "burger") {
    const dark = variant === "burger";
    return (
      <div
        className={`catalog-sort catalog-sort--${variant} ${className}`.trim()}
      >
        <p
          className={`mb-2 font-sans text-[10px] tracking-[0.18em] uppercase ${
            dark ? "text-museum-light/35" : "text-luxury-charcoal/40"
          }`}
        >
          Сортировка
        </p>
        <ul className="m-0 flex list-none flex-col gap-1 p-0" role="list">
          {CATALOG_SORT_OPTIONS.map((option) => {
            const active = onCatalog && current === option.id;
            const href = buildCatalogHref(
              pathname,
              saleOnly,
              option.id,
              priceRange.min,
              priceRange.max,
            );
            return (
              <li key={option.id}>
                <Link
                  href={href}
                  aria-current={active ? "true" : undefined}
                  className={`block rounded-sm border-l-2 pl-3.5 pr-2 py-2.5 min-h-11 font-sans text-[11px] leading-snug tracking-[0.1em] uppercase transition-colors duration-300 select-text ${
                    dark
                      ? active
                        ? "border-accent-gold bg-accent-gold/10 text-accent-gold"
                        : "border-transparent text-museum-light/55 hover:bg-museum-light/[0.04] hover:text-accent-gold"
                      : active
                        ? "border-accent-brass bg-accent-brass/[0.08] text-accent-brass"
                        : "border-transparent text-luxury-charcoal/55 hover:bg-luxury-charcoal/[0.035] hover:text-luxury-charcoal/90"
                  }`}
                >
                  {option.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <PriceRangeFields dark={dark} layout="stack" />
      </div>
    );
  }

  return (
    <div
      className={`catalog-sort catalog-sort--featured ${className}`.trim()}
      role="group"
      aria-label="Сортировка и цена"
    >
      <p className="mb-3 font-sans text-[10px] tracking-[0.22em] uppercase text-luxury-charcoal/35">
        Сортировка
      </p>
      <ul className="m-0 flex list-none flex-wrap items-baseline gap-x-5 gap-y-2.5 p-0 sm:gap-x-7">
        {CATALOG_SORT_OPTIONS.map((option) => {
          const active = onCatalog && current === option.id;
          const href = buildCatalogHref(
            pathname,
            saleOnly,
            option.id,
            priceRange.min,
            priceRange.max,
          );
          const isMax = option.id === "price_desc";
          return (
            <li key={option.id}>
              <Link
                href={href}
                aria-current={active ? "true" : undefined}
                className={`home-cat-link home-cat-link--featured cursor-pointer font-sans text-[13px] sm:text-sm leading-snug tracking-[0.08em] uppercase ${
                  active
                    ? "home-cat-link--accent"
                    : isMax
                      ? "home-cat-link--featured-muted text-luxury-charcoal/70"
                      : "home-cat-link--featured-muted"
                }`}
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <PriceRangeFields dark={false} layout="row" />
    </div>
  );
}
