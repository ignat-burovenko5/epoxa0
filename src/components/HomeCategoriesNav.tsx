import Link from "next/link";
import { categoryHref, siteConfig } from "@/lib/site";

/**
 * Compact catalog index for the homepage — all categories before featured images.
 */
export default function HomeCategoriesNav() {
  return (
    <nav
      aria-label="Категории каталога"
      className="mb-10 md:mb-12 border-y border-luxury-charcoal/10 py-5 md:py-6"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <p className="font-sans text-[10px] tracking-[0.22em] uppercase text-luxury-charcoal/40">
          Категории
        </p>
        <Link
          href="/collection"
          className="font-sans text-[10px] tracking-[0.18em] uppercase text-accent-brass hover:text-luxury-base transition-colors underline-offset-4 hover:underline"
        >
          Все предметы
        </Link>
      </div>

      <ul className="m-0 grid list-none grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-0 p-0">
        {siteConfig.categoryLinks.map((item) => {
          const highlighted = "highlight" in item && item.highlight;
          return (
            <li key={item.slug} className="min-w-0 border-t border-luxury-charcoal/[0.06]">
              <Link
                href={categoryHref(item.slug)}
                className={`group flex min-h-10 items-center py-2 font-sans text-[10px] sm:text-[11px] leading-snug tracking-[0.06em] uppercase transition-colors ${
                  highlighted
                    ? "text-luxury-bordeaux hover:text-luxury-bordeaux/80"
                    : "text-luxury-charcoal/55 hover:text-accent-brass"
                }`}
              >
                <span className="line-clamp-2 group-hover:translate-x-0.5 transition-transform duration-300 ease-luxury-ease">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
