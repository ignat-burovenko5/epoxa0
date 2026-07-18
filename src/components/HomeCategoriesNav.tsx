import Link from "next/link";
import { categoryHref, siteConfig } from "@/lib/site";

/**
 * Homepage catalog index — compact, few rules, clear hierarchy.
 */
export default function HomeCategoriesNav() {
  return (
    <nav aria-label="Категории каталога" className="mb-10 md:mb-14">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <p className="font-sans text-[9px] tracking-[0.28em] uppercase text-accent-brass/75 mb-1.5">
            Каталог
          </p>
          <h3 className="font-serif text-xl md:text-2xl leading-none tracking-tight text-luxury-base">
            Категории
          </h3>
        </div>
        <Link
          href="/collection"
          className="font-sans text-[10px] tracking-[0.16em] uppercase text-accent-brass hover:text-luxury-base transition-colors underline-offset-4 hover:underline"
        >
          Все предметы
        </Link>
      </div>

      <span
        className="mb-5 block h-px w-12 bg-gradient-to-r from-accent-brass/70 to-transparent"
        aria-hidden="true"
      />

      <ul className="m-0 flex list-none flex-wrap gap-x-1 gap-y-1.5 p-0">
        {siteConfig.categoryLinks.map((item, index) => {
          const highlighted = "highlight" in item && item.highlight;
          return (
            <li key={item.slug} className="inline-flex items-center">
              {index > 0 ? (
                <span
                  className="mx-2 select-none text-luxury-charcoal/20"
                  aria-hidden="true"
                >
                  ·
                </span>
              ) : null}
              <Link
                href={categoryHref(item.slug)}
                className={`font-sans text-[10px] sm:text-[11px] leading-snug tracking-[0.08em] uppercase transition-colors duration-300 ${
                  highlighted
                    ? "text-luxury-bordeaux hover:text-luxury-bordeaux/75"
                    : "text-luxury-charcoal/50 hover:text-accent-brass"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
