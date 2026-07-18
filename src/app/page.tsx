import type { Metadata } from "next";
import { connection } from "next/server";
import BrandLines from "@/components/BrandLines";
import HomeCategoriesNav from "@/components/HomeCategoriesNav";
import ProductPrice from "@/components/ProductPrice";
import Image from "next/image";
import Link from "next/link";
import FloatingConciergeLazy from "@/components/FloatingConciergeLazy";
import PageContainer from "@/components/PageContainer";
import { ArrowSquareUpRightIcon } from "@/components/NavContactIcons";
import {
  getCatalogItems,
  getCatalogProduct,
  getDiscountPercent,
  getRandomFeaturedSlugs,
} from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { getCatalogImage, siteImages } from "@/lib/site-images";

export const metadata: Metadata = pageMetadata({
  title: `${siteConfig.name} — антикварная мебель на продажу, купить в салоне`,
  description:
    "Каталог антикварной мебели и предметов интерьера: буфеты, комоды, кресла, люстры. Экспертиза, провенанс, доставка по России.",
  path: "/",
});

function buildFeatured(slugs: string[]) {
  return slugs.flatMap((slug) => {
    const product = getCatalogProduct(slug);
    if (!product) return [];
    return [
      {
        ...product,
        image: getCatalogImage(slug, 2070),
        alt: `${product.title}, ${product.era}`,
      },
    ];
  });
}

export default async function Homepage() {
  await connection();
  const featured = buildFeatured(getRandomFeaturedSlugs());
  return (
    <main className="bg-luxury-base text-museum-light">
      <section className="relative w-full min-h-[38vh] sm:min-h-[45vh] md:min-h-[55vh] -mt-[var(--site-header-offset)] pt-[var(--site-header-offset)] flex flex-col justify-end items-start">
        <div className="absolute inset-0 z-0 overflow-hidden bg-luxury-charcoal pointer-events-none">
          <Image
            src={siteImages.hero}
            alt="Роскошный исторический интерьер в духе антикварной «Эпохи»"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div
          className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-luxury-base via-luxury-base/85 to-luxury-base/40"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 z-10 pointer-events-none bg-luxury-base/45 md:bg-luxury-base/30"
          aria-hidden="true"
        />

        <PageContainer className="relative z-20 w-full pb-10 md:pb-16 pt-6 md:pt-10 text-left">
          <div className="max-w-3xl mr-auto">
            <BrandLines variant="hero" className="mb-5 md:mb-6" />
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.15] mb-5 text-museum-light">
              Исторически редкая антиквариатная мебель
            </h1>
            <p className="font-sans text-sm md:text-base text-museum-light/70 max-w-lg mb-8 leading-relaxed">
              Антикварная мебель на продажу — для коллекционеров, дизайнеров и частных интерьеров. Покупайте с доставкой по Москве, Петербургу и всей России.
            </p>
            <Link
              href="/collection"
              className="inline-flex items-center gap-3 min-h-12 py-2 border-b border-accent-brass pb-1.5 text-sm font-sans tracking-wide hover:text-accent-gold transition-colors ease-luxury-ease"
            >
              <span>Смотреть коллекцию</span>
              <span aria-hidden="true">⟶</span>
            </Link>
          </div>
        </PageContainer>
      </section>

      <section className="bg-museum-light text-luxury-charcoal pt-8 pb-12 sm:pt-10 sm:pb-16 md:pt-12 md:pb-24">
        <PageContainer>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl max-w-2xl leading-snug mb-8 md:mb-10">
            Редкие предметы для вашего интерьера
          </h2>

          <HomeCategoriesNav />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12">
            {featured.map((item, index) => {
              const discountPercent = getDiscountPercent(item.price, item.compareAtPrice);

              return (
              <Link
                key={item.slug}
                href={`/${item.slug}`}
                className="group flex flex-col h-full touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-brass/70"
              >
                <article className="flex flex-col flex-1">
                  <div className="relative w-full aspect-[4/5] mb-5 overflow-hidden bg-museum-warm">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      loading={index === 0 ? "eager" : "lazy"}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-luxury-ease group-hover:scale-105"
                    />
                    {item.badge ? (
                      <div className="absolute top-3 left-3 bg-luxury-base text-accent-gold text-[10px] px-2.5 py-1 uppercase tracking-widest font-sans">
                        {item.badge}
                      </div>
                    ) : null}
                    {discountPercent ? (
                      <div className="absolute top-3 right-3 bg-luxury-bordeaux text-museum-light text-[10px] px-2.5 py-1 uppercase tracking-widest font-sans">
                        −{discountPercent}%
                      </div>
                    ) : null}
                  </div>
                  <p className="font-serif text-xl md:text-2xl mb-1.5">{item.title}</p>
                  <p className="font-sans text-sm text-luxury-charcoal/75 mb-3">
                    {item.era}
                  </p>
                  <ProductPrice
                    price={item.price}
                    compareAtPrice={item.compareAtPrice}
                    size="sm"
                    className="mb-0"
                  />
                </article>
              </Link>
            );
            })}
          </div>

          <div className="mt-12 md:mt-16 flex flex-col items-center gap-4 text-center">
            <Link
              href="/collection"
              className="inline-flex items-center justify-center gap-3 min-h-12 px-8 py-3 border border-luxury-base/25 font-sans text-xs tracking-widest uppercase text-luxury-base hover:border-accent-brass hover:text-accent-brass transition-colors duration-300 ease-luxury-ease"
            >
              <span>Смотреть все предметы</span>
              <ArrowSquareUpRightIcon className="h-4 w-4 shrink-0" />
            </Link>
            <p className="font-sans text-sm text-luxury-charcoal/55">
              {getCatalogItems().length} предметов в коллекции
            </p>
          </div>
        </PageContainer>
      </section>

      <FloatingConciergeLazy />
    </main>
  );
}
