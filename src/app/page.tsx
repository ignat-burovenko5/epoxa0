import BrandLines from "@/components/BrandLines";
import ProductPrice from "@/components/ProductPrice";
import Image from "next/image";
import Link from "next/link";
import FloatingConciergeLazy from "@/components/FloatingConciergeLazy";
import HomeInfoSections from "@/components/HomeInfoSections";
import PageContainer from "@/components/PageContainer";
import { catalogItems, catalogProducts, featuredSlugs, getDiscountPercent } from "@/lib/catalog";
import { getCatalogImage, siteImages } from "@/lib/site-images";

const featured = featuredSlugs.map((slug) => {
  const product = catalogProducts[slug];
  return {
    ...product,
    image: getCatalogImage(slug, 2070),
    alt: `${product.title}, ${product.era}`,
  };
});

export default function Homepage() {
  return (
    <main className="bg-luxury-base text-museum-light">
      <section className="relative w-full min-h-[45vh] md:min-h-[55vh] flex flex-col justify-end items-start">
        <div className="absolute inset-0 z-0 overflow-hidden bg-luxury-charcoal">
          <Image
            src={siteImages.hero}
            alt="Интерьер салона в духе XVIII века"
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-left opacity-40 mix-blend-luminosity"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-base via-luxury-base/20 to-luxury-base/40 z-10" />

        <PageContainer className="relative z-20 w-full pb-10 md:pb-16 pt-6 md:pt-10 text-left">
          <div className="max-w-3xl mr-auto">
            <BrandLines className="mb-4" />
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.15] mb-5 text-museum-light">
              Где история
              <br />
              становится
              <br />
              архитектурой интерьера
            </h1>
            <p className="font-sans text-sm md:text-base text-museum-light/70 max-w-lg mb-8 leading-relaxed">
              Музейные предметы для коллекционеров, дизайнеров и частных резиденций. Доставка по Москве, Петербургу и всей России.
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

      <section className="section-y bg-museum-light text-luxury-charcoal">
        <PageContainer>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 md:mb-16">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl max-w-2xl leading-snug">
              Редкие предметы для взыскательного коллекционера
            </h2>
            <p className="font-sans text-sm md:text-base max-w-md leading-relaxed text-luxury-charcoal/80">
              Каждый лот проходит экспертизу подлинности и сохраняет патину времени. Мы работаем с частными европейскими коллекциями и закрытыми аукционами.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {featured.map((item, index) => {
              const discountPercent = getDiscountPercent(item.price, item.compareAtPrice);

              return (
              <article
                key={item.slug}
                className={`group cursor-pointer flex flex-col ${index === 2 ? "hidden lg:flex" : ""}`}
              >
                <Link href={`/${item.slug}`} className="flex flex-col h-full">
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
                    className="mt-auto"
                  />
                </Link>
              </article>
            );
            })}
          </div>

          <div className="mt-12 md:mt-16 flex flex-col items-center gap-4 text-center">
            <Link
              href="/collection"
              className="inline-flex items-center justify-center gap-3 min-h-12 px-8 py-3 border border-luxury-base/25 font-sans text-xs tracking-widest uppercase text-luxury-base hover:border-accent-brass hover:text-accent-brass transition-colors duration-300 ease-luxury-ease"
            >
              <span>Смотреть все предметы</span>
              <span aria-hidden="true">⟶</span>
            </Link>
            <p className="font-sans text-sm text-luxury-charcoal/55">
              {catalogItems.length} предметов в коллекции
            </p>
          </div>
        </PageContainer>
      </section>

      <HomeInfoSections />

      <section className="section-y bg-museum-light text-luxury-charcoal border-t border-museum-light/10">
        <PageContainer>
          <div className="max-w-2xl">
            <p className="font-sans text-xs tracking-widest uppercase text-accent-gold-on-light mb-3">
              Для дизайнеров и архитекторов
            </p>
            <h2 className="font-serif text-3xl md:text-4xl mb-4 text-luxury-base">
              Trade‑программа для профессионалов
            </h2>
            <p className="font-sans text-sm md:text-base text-luxury-charcoal/80 leading-relaxed mb-6">
              Специальные условия, персональный менеджер, ранний доступ к новым поступлениям и PDF‑листы для презентаций клиентам.
            </p>
            <Link
              href="/collection"
              className="inline-block border border-luxury-base/40 px-6 py-3 font-sans text-xs tracking-widest uppercase text-luxury-base hover:bg-luxury-base/5 transition-colors"
            >
              Подать заявку
            </Link>
          </div>
        </PageContainer>
      </section>

      <FloatingConciergeLazy />
    </main>
  );
}
