"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  CATALOG_SORT_OPTIONS,
  parseCatalogSort,
  type CatalogSort,
} from "@/lib/catalog-shared";
import { collectionHref } from "@/lib/site";

type CatalogSortControlsProps = {
  /** Visual placement: homepage strip vs collection sidenav. */
  variant?: "featured" | "sidenav";
  className?: string;
};

function buildSortHref(
  pathname: string,
  saleOnly: boolean,
  sort: CatalogSort,
) {
  const categoryMatch = pathname.match(/^\/collection\/([^/?#]+)/);
  const categorySlug = categoryMatch?.[1] ?? null;
  const onCollection = pathname === "/collection" || Boolean(categorySlug);

  if (!onCollection) {
    return collectionHref(null, { sort });
  }

  return collectionHref(saleOnly ? null : categorySlug, {
    sale: saleOnly,
    sort,
  });
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
  const onCatalog =
    pathname === "/collection" || pathname.startsWith("/collection/");

  if (variant === "sidenav") {
    return (
      <div className={`catalog-sort catalog-sort--sidenav ${className}`.trim()}>
        <p className="mb-2 font-sans text-[10px] tracking-[0.18em] uppercase text-luxury-charcoal/40">
          Сортировка
        </p>
        <ul className="m-0 flex list-none flex-col gap-1 p-0" role="list">
          {CATALOG_SORT_OPTIONS.map((option) => {
            const active = current === option.id;
            const href = buildSortHref(pathname, saleOnly, option.id);
            return (
              <li key={option.id}>
                <Link
                  href={href}
                  aria-current={active ? "true" : undefined}
                  className={`block rounded-sm border-l-2 pl-3.5 pr-2 py-2.5 min-h-11 font-sans text-[11px] leading-snug tracking-[0.1em] uppercase transition-colors duration-300 select-text ${
                    active
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
      </div>
    );
  }

  return (
    <div
      className={`catalog-sort catalog-sort--featured ${className}`.trim()}
      role="group"
      aria-label="Сортировка по цене"
    >
      <p className="mb-3 font-sans text-[10px] tracking-[0.22em] uppercase text-luxury-charcoal/35">
        Сортировка
      </p>
      <ul className="m-0 flex list-none flex-wrap items-baseline gap-x-5 gap-y-2.5 p-0 sm:gap-x-7">
        {CATALOG_SORT_OPTIONS.map((option) => {
          const active = onCatalog && current === option.id;
          const href = buildSortHref(pathname, saleOnly, option.id);
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
    </div>
  );
}
