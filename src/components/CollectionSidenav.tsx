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
    <aside aria-label="Категории каталога" className="shrink-0 md:w-52 lg:w-56">
      <div className="md:hidden mb-6 overflow-x-auto hidden-scrollbar border-b border-luxury-charcoal/10 pb-3">
        <ul className="flex gap-4 min-w-max">
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

      <nav className="hidden md:block sticky top-4 max-h-[calc(100vh-5rem)] overflow-y-auto hidden-scrollbar pr-4 lg:pr-6 border-r border-luxury-charcoal/10">
        <p className="font-sans text-[10px] tracking-widest uppercase text-luxury-charcoal/40 mb-3">
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
