"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import CatalogSortControls from "@/components/CatalogSortControls";
import {
  parseCatalogPriceRange,
  parseCatalogSort,
} from "@/lib/catalog-shared";
import {
  categoryHref,
  COLLECTION_SALE_HREF,
  collectionHref,
  groupedCategoryLinks,
} from "@/lib/site";

function isActive(pathname: string, slug: string) {
  return pathname === categoryHref(slug);
}

function itemClass(active: boolean, highlighted = false) {
  const base =
    "block rounded-sm border-l-2 pl-3.5 pr-2 py-2.5 min-h-11 font-sans text-[11px] leading-snug tracking-[0.1em] uppercase transition-colors duration-300 select-text";

  if (highlighted) {
    return `${base} ${
      active
        ? "border-luxury-bordeaux bg-luxury-bordeaux/[0.06] text-luxury-bordeaux"
        : "border-transparent text-luxury-bordeaux/70 hover:bg-luxury-bordeaux/[0.04] hover:text-luxury-bordeaux"
    }`;
  }

  return `${base} ${
    active
      ? "border-accent-brass bg-accent-brass/[0.08] text-accent-brass"
      : "border-transparent text-luxury-charcoal/55 hover:bg-luxury-charcoal/[0.035] hover:text-luxury-charcoal/90"
  }`;
}

const groupLabelClass =
  "mb-2 font-sans text-[10px] tracking-[0.18em] uppercase text-luxury-charcoal/40";

export default function CollectionSidenav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const saleOnly =
    searchParams.get("sale") === "1" || searchParams.get("sale") === "true";
  const sort = parseCatalogSort(searchParams.get("sort"));
  const priceRange = parseCatalogPriceRange(
    searchParams.get("min"),
    searchParams.get("max"),
  );
  const allActive = pathname === "/collection" && !saleOnly;
  const saleActive = pathname === "/collection" && saleOnly;
  const groups = useMemo(() => groupedCategoryLinks(), []);
  const flat = useMemo(
    () => groups.flatMap((group) => group.items),
    [groups],
  );

  const withFilters = (href: string) => {
    const url = new URL(href, "https://example.local");
    if (sort !== "default") url.searchParams.set("sort", sort);
    if (priceRange.min != null) url.searchParams.set("min", String(priceRange.min));
    if (priceRange.max != null) url.searchParams.set("max", String(priceRange.max));
    const qs = url.searchParams.toString();
    return qs ? `${url.pathname}?${qs}` : url.pathname;
  };

  const filterOpts = {
    sort,
    min: priceRange.min,
    max: priceRange.max,
  };

  return (
    <aside
      aria-label="Категории каталога"
      className="shrink-0 md:w-60 lg:w-64 md:sticky md:top-[calc(var(--site-header-offset)+1rem)] md:self-start md:max-h-[calc(100dvh-var(--site-header-offset)-2rem)] md:flex md:flex-col"
    >
      {/* Mobile — category strip scrolls on its own; filters stay fixed below */}
      <div className="md:hidden mb-8">
        <div className="mb-3 flex items-baseline gap-3">
          <p className="font-serif text-lg text-luxury-base">Каталог</p>
          <span className="h-px flex-1 max-w-[3rem] bg-accent-brass/50" aria-hidden />
        </div>
        <div className="collection-category-scroll -mx-4 px-4 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:thin]">
          <ul className="flex gap-1 min-w-max">
            <li>
              <Link
                href={withFilters("/collection")}
                className={`inline-flex min-h-10 items-center border-b-2 px-3 font-sans text-[11px] tracking-[0.12em] uppercase whitespace-nowrap select-text ${
                  allActive
                    ? "border-accent-brass text-accent-brass"
                    : "border-transparent text-luxury-charcoal/55 hover:text-accent-brass"
                }`}
              >
                Все
              </Link>
            </li>
            <li>
              <Link
                href={withFilters(COLLECTION_SALE_HREF)}
                className={`inline-flex min-h-10 items-center border-b-2 px-3 font-sans text-[11px] tracking-[0.12em] uppercase whitespace-nowrap select-text ${
                  saleActive
                    ? "border-luxury-bordeaux text-luxury-bordeaux"
                    : "border-transparent text-luxury-bordeaux/70 hover:text-luxury-bordeaux"
                }`}
              >
                Акционные
              </Link>
            </li>
            {flat.map((item) => {
              const active = isActive(pathname, item.slug);
              const highlighted = "highlight" in item && item.highlight;
              return (
                <li key={item.slug}>
                  <Link
                    href={withFilters(categoryHref(item.slug))}
                    className={`inline-flex min-h-10 max-w-[15rem] items-center border-b-2 px-3 font-sans text-[11px] tracking-[0.1em] uppercase select-text ${
                      active
                        ? highlighted
                          ? "border-luxury-bordeaux text-luxury-bordeaux"
                          : "border-accent-brass text-accent-brass"
                        : highlighted
                          ? "border-transparent text-luxury-bordeaux/70 hover:text-luxury-bordeaux"
                          : "border-transparent text-luxury-charcoal/50 hover:text-luxury-charcoal/80"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="mt-5">
          <Suspense fallback={null}>
            <CatalogSortControls variant="featured" />
          </Suspense>
        </div>
      </div>

      {/* Desktop — grouped */}
      <nav
        className="collection-category-scroll collection-sidenav-panel hidden md:flex md:min-h-0 md:flex-1 md:flex-col md:overflow-y-auto md:overscroll-y-contain border-r border-luxury-charcoal/10 pr-4 lg:pr-5"
        aria-label="Категории"
      >
        <header className="shrink-0 pb-5 mb-1">
          <h2 className="font-serif text-[1.65rem] leading-none tracking-tight text-luxury-base select-text">
            Каталог
          </h2>
          <span
            className="mt-3 block h-px w-11 bg-gradient-to-r from-accent-brass to-accent-brass/0"
            aria-hidden="true"
          />
        </header>

        <div className="flex flex-col gap-6 pb-8">
          <Suspense fallback={null}>
            <CatalogSortControls variant="sidenav" />
          </Suspense>

          {groups.map((group, groupIndex) => {
            const isFeatured = groupIndex === 0;
            return (
            <div key={group.label}>
              <p className={groupLabelClass}>
                {isFeatured ? "Подборка" : group.label}
              </p>
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {isFeatured ? (
                  <>
                    <li>
                      <Link
                        href={collectionHref(null, filterOpts)}
                        className={itemClass(allActive)}
                      >
                        Все категории
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={collectionHref(null, { sale: true, ...filterOpts })}
                        className={itemClass(saleActive, true)}
                      >
                        Акционные товары
                      </Link>
                    </li>
                  </>
                ) : null}
                {group.items.map((item) => {
                  const active = isActive(pathname, item.slug);
                  const highlighted = "highlight" in item && item.highlight;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={collectionHref(item.slug, filterOpts)}
                        className={itemClass(active, Boolean(highlighted))}
                      >
                        <span className="line-clamp-2">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
