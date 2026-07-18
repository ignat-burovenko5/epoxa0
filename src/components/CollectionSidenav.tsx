"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categoryHref, siteConfig } from "@/lib/site";

function isActive(pathname: string, slug: string) {
  return pathname === categoryHref(slug);
}

function linkClass(opts: {
  active: boolean;
  highlighted?: boolean;
  primary?: boolean;
}) {
  const { active, highlighted, primary } = opts;
  const base =
    "group relative block w-full border-l-2 pl-3.5 pr-2 transition-colors duration-300 ease-luxury-ease";

  if (primary) {
    return `${base} min-h-11 py-2.5 font-sans text-[11px] tracking-[0.16em] uppercase ${
      active
        ? "border-accent-brass bg-accent-brass/[0.07] text-accent-brass"
        : "border-transparent text-luxury-charcoal/70 hover:border-luxury-charcoal/15 hover:bg-luxury-charcoal/[0.03] hover:text-accent-brass"
    }`;
  }

  if (highlighted) {
    return `${base} min-h-10 py-2 font-sans text-[10px] lg:text-[11px] leading-snug tracking-[0.08em] uppercase ${
      active
        ? "border-luxury-bordeaux bg-luxury-bordeaux/[0.06] text-luxury-bordeaux"
        : "border-transparent text-luxury-bordeaux/75 hover:border-luxury-bordeaux/25 hover:bg-luxury-bordeaux/[0.04] hover:text-luxury-bordeaux"
    }`;
  }

  return `${base} min-h-10 py-2 font-sans text-[10px] lg:text-[11px] leading-snug tracking-[0.08em] uppercase ${
    active
      ? "border-accent-brass bg-accent-brass/[0.07] text-accent-brass"
      : "border-transparent text-luxury-charcoal/50 hover:border-luxury-charcoal/12 hover:bg-luxury-charcoal/[0.03] hover:text-luxury-charcoal/85"
  }`;
}

export default function CollectionSidenav() {
  const pathname = usePathname();
  const categoryCount = siteConfig.categoryLinks.length;

  return (
    <aside
      aria-label="Категории каталога"
      className="shrink-0 md:w-56 lg:w-64 md:self-start"
    >
      {/* Mobile strip */}
      <div className="collection-category-scroll md:hidden mb-6 overflow-x-auto overscroll-x-contain border-b border-luxury-charcoal/10 pb-3">
        <div className="mb-2 flex items-baseline justify-between gap-3 px-0.5">
          <p className="font-serif text-sm tracking-wide text-luxury-charcoal/80">
            Каталог
          </p>
          <span className="font-sans text-[10px] tracking-[0.14em] uppercase text-luxury-charcoal/35">
            {categoryCount} разделов
          </span>
        </div>
        <ul className="flex gap-1 min-w-max pr-1">
          <li>
            <Link
              href="/collection"
              className={`inline-flex min-h-10 items-center border-b-2 px-2.5 font-sans text-[10px] tracking-[0.12em] uppercase whitespace-nowrap transition-colors ${
                pathname === "/collection"
                  ? "border-accent-brass text-accent-brass"
                  : "border-transparent text-luxury-charcoal/55 hover:text-accent-brass"
              }`}
            >
              Все
            </Link>
          </li>
          {siteConfig.categoryLinks.map((item) => {
            const active = isActive(pathname, item.slug);
            const highlighted = "highlight" in item && item.highlight;
            return (
              <li key={item.slug}>
                <Link
                  href={categoryHref(item.slug)}
                  className={`inline-flex min-h-10 max-w-[14rem] items-center border-b-2 px-2.5 font-sans text-[10px] tracking-[0.1em] uppercase transition-colors ${
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

      {/* Desktop pane */}
      <nav
        className="collection-category-scroll collection-sidenav-panel hidden md:block sticky top-[calc(var(--site-header-offset)+0.75rem)] max-h-[calc(100dvh-var(--site-header-offset)-1.5rem)] overflow-y-auto overscroll-y-contain"
        aria-label="Категории"
      >
        <header className="sticky top-0 z-[1] border-b border-luxury-charcoal/10 bg-museum-light/95 pb-4 pt-1 backdrop-blur-sm">
          <p className="font-sans text-[9px] tracking-[0.28em] uppercase text-accent-brass/80 mb-1.5">
            Навигация
          </p>
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-serif text-2xl lg:text-[1.75rem] leading-none tracking-tight text-luxury-base">
              Каталог
            </h2>
            <span className="pb-0.5 font-sans text-[10px] tabular-nums tracking-[0.12em] uppercase text-luxury-charcoal/35">
              {categoryCount}
            </span>
          </div>
          <span
            className="mt-3 block h-px w-10 bg-gradient-to-r from-accent-brass/80 to-transparent"
            aria-hidden="true"
          />
        </header>

        <div className="pt-3 pb-6 pr-2 lg:pr-3">
          <p className="mb-1.5 px-3.5 font-sans text-[9px] tracking-[0.2em] uppercase text-luxury-charcoal/35">
            Обзор
          </p>
          <ul className="mb-4 list-none m-0 p-0">
            <li>
              <Link
                href="/collection"
                className={linkClass({
                  active: pathname === "/collection",
                  primary: true,
                })}
              >
                <span className="block">Все категории</span>
                <span
                  className={`mt-0.5 block font-sans text-[9px] normal-case tracking-normal ${
                    pathname === "/collection"
                      ? "text-accent-brass/70"
                      : "text-luxury-charcoal/35 group-hover:text-luxury-charcoal/50"
                  }`}
                >
                  Полный архив
                </span>
              </Link>
            </li>
          </ul>

          <p className="mb-1.5 px-3.5 font-sans text-[9px] tracking-[0.2em] uppercase text-luxury-charcoal/35">
            Разделы
          </p>
          <ul className="list-none m-0 space-y-0.5 p-0 border-t border-luxury-charcoal/[0.06] pt-1">
            {siteConfig.categoryLinks.map((item) => {
              const active = isActive(pathname, item.slug);
              const highlighted = "highlight" in item && item.highlight;

              return (
                <li key={item.slug}>
                  <Link
                    href={categoryHref(item.slug)}
                    className={linkClass({ active, highlighted })}
                  >
                    <span className="line-clamp-2">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
