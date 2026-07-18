import Link from "next/link";
import { categoryHref, siteConfig } from "@/lib/site";

/**
 * Homepage catalog index — scannable columns, no middot wall.
 */
export default function HomeCategoriesNav() {
  return (
    <nav aria-label="Категории каталога" className="mb-12 md:mb-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 md:mb-8">
        <div>
          <p className="mb-2 font-sans text-[10px] tracking-[0.22em] uppercase text-accent-brass/85">
            Каталог
          </p>
          <h3 className="font-serif text-2xl md:text-[1.75rem] leading-none tracking-tight text-luxury-base">
            Категории
          </h3>
        </div>
        <Link
          href="/collection"
          className="font-sans text-[11px] tracking-[0.14em] uppercase text-accent-brass transition-colors hover:text-luxury-base underline-offset-4 hover:underline"
        >
          Все предметы
        </Link>
      </div>

      <span
        className="mb-7 block h-px w-14 bg-gradient-to-r from-accent-brass/75 to-transparent md:mb-8"
        aria-hidden="true"
      />

      <ul className="m-0 grid list-none grid-cols-1 gap-x-10 gap-y-3.5 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {siteConfig.categoryLinks.map((item) => {
          const highlighted = "highlight" in item && item.highlight;
          return (
            <li key={item.slug}>
              <Link
                href={categoryHref(item.slug)}
                className={`block py-0.5 font-sans text-[12px] leading-relaxed tracking-[0.06em] uppercase transition-colors duration-300 ${
                  highlighted
                    ? "text-luxury-bordeaux hover:text-luxury-bordeaux/80"
                    : "text-luxury-charcoal/65 hover:text-accent-brass"
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
