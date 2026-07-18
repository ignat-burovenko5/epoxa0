import Link from "next/link";
import {
  categoryHref,
  COLLECTION_SALE_HREF,
  groupedCategoryLinks,
} from "@/lib/site";

/**
 * Homepage catalog index — featured strip + height-balanced columns.
 * Hierarchy: section title → featured picks → group labels → item links.
 */
export default function HomeCategoriesNav() {
  const groups = groupedCategoryLinks();
  const featured = groups[0];
  const rest = groups.slice(1);

  return (
    <nav
      aria-label="Категории каталога"
      className="home-categories-nav mb-12 md:mb-16"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 md:mb-8">
        <div>
          <p className="mb-2 font-sans text-[10px] tracking-[0.28em] uppercase text-accent-brass/70">
            Каталог
          </p>
          <h3 className="font-serif text-[2rem] md:text-[2.35rem] lg:text-[2.6rem] leading-[0.95] tracking-[-0.02em] text-luxury-base">
            Категории
          </h3>
        </div>
        <Link
          href="/collection"
          className="home-cat-btn inline-flex cursor-pointer items-center justify-center border border-accent-brass bg-transparent px-4 py-2.5 font-sans text-[11px] tracking-[0.16em] uppercase text-accent-brass"
        >
          Все предметы
        </Link>
      </div>

      <span
        className="mb-8 block h-px w-16 bg-gradient-to-r from-accent-brass to-transparent md:mb-10"
        aria-hidden="true"
      />

      {/* Featured — primary scan band */}
      {featured ? (
        <div className="home-categories-featured mb-10 md:mb-12">
          <p className="mb-4 font-sans text-[10px] tracking-[0.22em] uppercase text-luxury-charcoal/35">
            {featured.label}
          </p>
          <ul className="m-0 flex list-none flex-wrap items-baseline gap-x-6 gap-y-3 p-0 sm:gap-x-8 md:gap-x-10">
            <li>
              <Link
                href={COLLECTION_SALE_HREF}
                className="home-cat-link home-cat-link--featured home-cat-link--accent cursor-pointer font-sans text-[13px] sm:text-sm leading-snug tracking-[0.08em] uppercase"
              >
                Акционные товары
              </Link>
            </li>
            {featured.items.map((item) => {
              const highlighted = "highlight" in item && item.highlight;
              return (
                <li key={item.slug}>
                  <Link
                    href={categoryHref(item.slug)}
                    className={`home-cat-link home-cat-link--featured cursor-pointer font-sans text-[13px] sm:text-sm leading-snug tracking-[0.08em] uppercase ${
                      highlighted
                        ? "home-cat-link--accent"
                        : "home-cat-link--featured-muted"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {/* Remaining groups — CSS columns balance height across the band */}
      <div className="home-categories-columns gap-x-10 sm:gap-x-12 lg:gap-x-16">
        {rest.map((group) => (
          <div
            key={group.label}
            className="home-categories-group mb-8 break-inside-avoid last:mb-0 sm:mb-10"
          >
            <p className="home-categories-group__label mb-3.5">
              {group.label}
            </p>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {group.items.map((item) => {
                const highlighted = "highlight" in item && item.highlight;
                return (
                  <li key={item.slug}>
                    <Link
                      href={categoryHref(item.slug)}
                      className={`home-cat-link home-cat-link--stack cursor-pointer font-sans text-[12px] leading-snug tracking-[0.04em] uppercase ${
                        highlighted
                          ? "home-cat-link--accent"
                          : "home-cat-link--muted"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
