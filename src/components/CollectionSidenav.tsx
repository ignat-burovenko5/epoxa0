"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { categoryHref, groupedCategoryLinks } from "@/lib/site";

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
  const allActive = pathname === "/collection";
  const groups = useMemo(() => groupedCategoryLinks(), []);
  const flat = useMemo(
    () => groups.flatMap((group) => group.items),
    [groups],
  );

  return (
    <aside
      aria-label="Категории каталога"
      className="shrink-0 md:w-60 lg:w-64 md:sticky md:top-[calc(var(--site-header-offset)+1rem)] md:self-start md:max-h-[calc(100dvh-var(--site-header-offset)-2rem)] md:flex md:flex-col"
    >
      {/* Mobile — flat sorted strip */}
      <div className="collection-category-scroll md:hidden mb-8 overflow-x-auto overscroll-x-contain pb-3">
        <div className="mb-3 flex items-baseline gap-3">
          <p className="font-serif text-lg text-luxury-base">Каталог</p>
          <span className="h-px flex-1 max-w-[3rem] bg-accent-brass/50" aria-hidden />
        </div>
        <ul className="flex gap-1 min-w-max">
          <li>
            <Link
              href="/collection"
              className={`inline-flex min-h-10 items-center border-b-2 px-3 font-sans text-[11px] tracking-[0.12em] uppercase whitespace-nowrap select-text ${
                allActive
                  ? "border-accent-brass text-accent-brass"
                  : "border-transparent text-luxury-charcoal/55 hover:text-accent-brass"
              }`}
            >
              Все
            </Link>
          </li>
          {flat.map((item) => {
            const active = isActive(pathname, item.slug);
            const highlighted = "highlight" in item && item.highlight;
            return (
              <li key={item.slug}>
                <Link
                  href={categoryHref(item.slug)}
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

        <div className="mb-6">
          <Link href="/collection" className={itemClass(allActive)}>
            Все категории
          </Link>
        </div>

        <div className="flex flex-col gap-6 pb-8">
          {groups.map((group) => (
            <div key={group.label}>
              <p className={groupLabelClass}>{group.label}</p>
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.slug);
                  const highlighted = "highlight" in item && item.highlight;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={categoryHref(item.slug)}
                        className={itemClass(active, Boolean(highlighted))}
                      >
                        <span className="line-clamp-2">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}
