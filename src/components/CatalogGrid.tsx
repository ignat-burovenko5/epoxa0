import Image from "next/image";
import Link from "next/link";
import ProductPrice from "@/components/ProductPrice";
import { catalogItems, getDiscountPercent, type CatalogProduct } from "@/lib/catalog";
import { getCatalogImage } from "@/lib/site-images";

export type CatalogItem = CatalogProduct;

export function CatalogGrid({ items }: { items: CatalogItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-12">
      {items.map((item) => {
        const discountPercent = getDiscountPercent(item.price, item.compareAtPrice);

        return (
          <article key={item.slug} className="group cursor-pointer">
            <Link href={`/${item.slug}`} className="block">
              <div className="relative aspect-[3/4] bg-museum-warm mb-4 overflow-hidden">
                <div className="absolute inset-0 bg-luxury-base/5 group-hover:bg-transparent transition-colors z-10" />
                <Image
                  src={getCatalogImage(item.slug)}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-luxury-ease group-hover:scale-105"
                />
                {discountPercent ? (
                  <div className="absolute top-3 right-3 z-20 bg-luxury-bordeaux text-museum-light text-[10px] px-2.5 py-1 uppercase tracking-widest font-sans">
                    −{discountPercent}%
                  </div>
                ) : null}
              </div>
              <h2 className="font-serif text-xl md:text-2xl text-luxury-base mb-1">
                {item.title}
              </h2>
              <p className="font-sans text-sm text-luxury-charcoal/60 mb-3">{item.era}</p>
              <ProductPrice
                price={item.price}
                compareAtPrice={item.compareAtPrice}
                size="sm"
                className="mb-3"
              />
              <span className="font-sans text-xs tracking-widest uppercase border-b border-accent-brass pb-1 text-luxury-base group-hover:text-accent-brass transition-colors">
                Зарезервировать
              </span>
            </Link>
          </article>
        );
      })}
    </div>
  );
}

export { catalogItems };
