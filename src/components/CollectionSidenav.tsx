"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categoryHref, siteConfig } from "@/lib/site";

const linkBase =
  "block min-h-12 py-2.5 font-sans text-[10px] lg:text-[11px] leading-snug tracking-wide uppercase transition-colors";

function isActive(pathname: string, slug: string) {
  return pathname === categoryHref(slug);
}

export default function CollectionSidenav() {
  const pathname = usePathname();

  return (
    <aside aria-label="Категории каталога" className="shrink-0 md:w-52 lg:w-56 md:self-start">
      {/* Mobile: horizontal category strip with visible scrollbar */}
      <div className="collection-category-scroll md:hidden mb-6 overflow-x-auto overscroll-x-contain border-b border-luxury-charcoal/10 pb-3">
        <ul className="flex gap-4 min-w-max pr-1">
          <li>
            <Link
              href="/collection"
              className={`${linkBase} whitespace-nowrap ${
                pathname === "/collection"
                  ? "text-accent-brass"
                  : "text-luxury-charcoal/60 hover:text-accent-brass"
              }`}
            >
              Все категории
            </Link>
          </li>
          {siteConfig.categoryLinks.map((item) => (
            <li key={item.slug}>
              <Link
                href={categoryHref(item.slug)}
                className={`${linkBase} whitespace-nowrap ${
                  "highlight" in item && item.highlight
                    ? isActive(pathname, item.slug)
                      ? "text-luxury-bordeaux"
                      : "text-luxury-bordeaux/80 hover:text-luxury-bordeaux"
                    : isActive(pathname, item.slug)
                      ? "text-accent-brass"
                      : "text-luxury-charcoal/60 hover:text-accent-brass"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop: independent vertical scroll, below fixed header */}
      <nav
        className="collection-category-scroll hidden md:block sticky top-[calc(var(--site-header-offset)+0.75rem)] max-h-[calc(100dvh-var(--site-header-offset)-1.5rem)] overflow-y-auto overscroll-y-contain pr-3 lg:pr-5 border-r border-luxury-charcoal/10"
        aria-label="Категории"
      >
        <p className="font-sans text-[10px] tracking-widest uppercase text-luxury-charcoal/40 mb-3 sticky top-0 z-[1] bg-museum-light/95 py-1 backdrop-blur-sm">
          Каталог
        </p>
        <ul>
          <li>
            <Link
              href="/collection"
              className={`${linkBase} ${
                pathname === "/collection"
                  ? "text-accent-brass border-l-2 border-accent-brass pl-3 -ml-px"
                  : "text-luxury-charcoal/60 hover:text-accent-brass pl-3"
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
                  className={`${linkBase} pl-3 ${
                    active
                      ? highlighted
                        ? "text-luxury-bordeaux border-l-2 border-luxury-bordeaux -ml-px"
                        : "text-accent-brass border-l-2 border-accent-brass -ml-px"
                      : highlighted
                        ? "text-luxury-bordeaux/80 hover:text-luxury-bordeaux"
                        : "text-luxury-charcoal/60 hover:text-accent-brass"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
