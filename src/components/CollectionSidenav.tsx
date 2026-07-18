"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categoryHref, siteConfig } from "@/lib/site";

const linkBase =
  "block min-h-10 py-2 pl-3 pr-2 font-sans text-[10px] lg:text-[11px] leading-snug tracking-[0.08em] uppercase border-l-2 transition-colors duration-300 select-text";

function isActive(pathname: string, slug: string) {
  return pathname === categoryHref(slug);
}

export default function CollectionSidenav() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Категории каталога"
      className="shrink-0 md:w-56 lg:w-60 md:sticky md:top-[calc(var(--site-header-offset)+0.75rem)] md:self-start md:max-h-[calc(100dvh-var(--site-header-offset)-1.5rem)] md:flex md:flex-col"
    >
      {/* Mobile */}
      <div className="collection-category-scroll md:hidden mb-6 overflow-x-auto overscroll-x-contain border-b border-luxury-charcoal/10 pb-3">
        <ul className="flex gap-1 min-w-max pr-1">
          <li>
            <Link
              href="/collection"
              className={`inline-flex min-h-10 items-center border-b-2 px-2.5 font-sans text-[10px] tracking-[0.12em] uppercase whitespace-nowrap select-text ${
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
                  className={`inline-flex min-h-10 max-w-[14rem] items-center border-b-2 px-2.5 font-sans text-[10px] tracking-[0.1em] uppercase select-text ${
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

      {/* Desktop */}
      <nav
        className="collection-category-scroll collection-sidenav-panel hidden md:block md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-y-contain border-r border-luxury-charcoal/10 pr-3"
        aria-label="Категории"
      >
        <p className="mb-3 font-sans text-[10px] tracking-[0.22em] uppercase text-luxury-charcoal/40 select-text">
          Каталог
        </p>
        <ul className="m-0 list-none space-y-0.5 p-0">
          <li>
            <Link
              href="/collection"
              className={`${linkBase} ${
                pathname === "/collection"
                  ? "border-accent-brass text-accent-brass"
                  : "border-transparent text-luxury-charcoal/55 hover:text-accent-brass"
              }`}
            >
              Все категории
            </Link>
          </li>
          {siteConfig.categoryLinks.map((item) => {
            const active = isActive(pathname, item.slug);
            const highlighted = "highlight" in item && item.highlight;

            return (
              <li key={item.slug}>
                <Link
                  href={categoryHref(item.slug)}
                  className={`${linkBase} ${
                    active
                      ? highlighted
                        ? "border-luxury-bordeaux text-luxury-bordeaux"
                        : "border-accent-brass text-accent-brass"
                      : highlighted
                        ? "border-transparent text-luxury-bordeaux/75 hover:text-luxury-bordeaux"
                        : "border-transparent text-luxury-charcoal/50 hover:text-luxury-charcoal/80"
                  }`}
                >
                  <span className="line-clamp-2">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
