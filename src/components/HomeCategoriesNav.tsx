import Link from "next/link";
import {
  categoryHref,
  COLLECTION_SALE_HREF,
  groupedCategoryLinks,
} from "@/lib/site";

/**
 * Homepage catalog index — featured strip + height-balanced columns.
 */
export default function HomeCategoriesNav() {
  const groups = groupedCategoryLinks();
  const featured = groups[0];
  const rest = groups.slice(1);

  return (
    <nav
      aria-label="Категории каталога"
      className="home-categories-nav mb-12 md:mb-14"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 md:mb-6">
        <div>
          <p className="mb-1.5 font-sans text-[10px] tracking-[0.22em] uppercase text-accent-brass/85">
            Каталог
          </p>
          <h3 className="font-serif text-2xl md:text-[1.75rem] leading-none tracking-tight text-luxury-base">
            Категории
          </h3>
        </div>
        <Link
          href="/collection"
          className="home-cat-btn inline-flex cursor-pointer items-center justify-center border border-accent-brass bg-transparent px-4 py-2 font-sans text-[11px] tracking-[0.14em] uppercase text-accent-brass"
        >
          Все предметы
        </Link>
      </div>

      <span
        className="mb-6 block h-px w-14 bg-gradient-to-r from-accent-brass/75 to-transparent md:mb-7"
        aria-hidden="true"
      />

      {/* Featured — one short horizontal band */}
      {featured ? (
        <div className="mb-8 md:mb-10">
          <p className="mb-3 font-sans text-[10px] tracking-[0.18em] uppercase text-luxury-charcoal/40">
            {featured.label}
          </p>
          <ul className="m-0 flex list-none flex-wrap items-baseline gap-x-5 gap-y-2.5 p-0 sm:gap-x-7">
            <li>
              <Link
                href={COLLECTION_SALE_HREF}
                className="home-cat-link home-cat-link--accent cursor-pointer font-sans text-[12px] leading-snug tracking-[0.06em] uppercase"
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
                    className={`home-cat-link cursor-pointer font-sans text-[12px] leading-snug tracking-[0.06em] uppercase ${
                      highlighted ? "home-cat-link--accent" : "home-cat-link--muted"
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
      <div className="home-categories-columns gap-x-10 sm:gap-x-12 lg:gap-x-14">
        {rest.map((group) => (
          <div key={group.label} className="home-categories-group mb-7 break-inside-avoid last:mb-0 sm:mb-8">
            <p className="mb-2.5 font-sans text-[10px] tracking-[0.18em] uppercase text-luxury-charcoal/40">
              {group.label}
            </p>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {group.items.map((item) => {
                const highlighted = "highlight" in item && item.highlight;
                return (
                  <li key={item.slug}>
                    <Link
                      href={categoryHref(item.slug)}
                      className={`home-cat-link home-cat-link--stack cursor-pointer font-sans text-[12px] leading-snug tracking-[0.05em] uppercase ${
                        highlighted ? "home-cat-link--accent" : "home-cat-link--muted"
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
