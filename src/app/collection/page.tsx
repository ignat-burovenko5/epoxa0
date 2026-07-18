import type { Metadata } from "next";
import CollectionCatalog from "@/components/CollectionCatalog";
import FloatingConcierge from "@/components/FloatingConcierge";
import { getCategoryProductCount, getSaleProductCount } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Архив коллекции — антикварная мебель на продажу",
  description:
    "Полный каталог антикварной мебели и предметов интерьера: буфеты, комоды, кресла, люстры, зеркала. Купить с доставкой по России.",
  path: "/collection",
});

export default async function CollectionListing({
  searchParams,
}: {
  searchParams: Promise<{ sale?: string }>;
}) {
  const params = await searchParams;
  const saleOnly = params.sale === "1" || params.sale === "true";
  const total = saleOnly ? getSaleProductCount() : getCategoryProductCount(null);

  return (
    <div className="pb-24 md:pb-20">
      <header className="mb-8 md:mb-10">
        {saleOnly ? (
          <>
            <p className="font-sans text-xs tracking-widest uppercase text-luxury-bordeaux mb-2">
              Акция
            </p>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-luxury-base mb-3">
              Акционные товары
            </h1>
            <p className="font-sans text-sm md:text-base text-luxury-charcoal/70 max-w-xl leading-relaxed">
              Предметы со скидкой — актуальная подборка из архива. Купить с доставкой по России.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-luxury-base mb-3">
              Архив коллекции
            </h1>
            <p className="font-sans text-sm md:text-base text-luxury-charcoal/70 max-w-xl leading-relaxed">
              Антикварная мебель на продажу — живая подборка для резиденций, загородных домов и проектов дизайнеров. Купить с доставкой по России.
            </p>
          </>
        )}
      </header>

      <p className="mb-8 font-sans text-xs md:text-sm text-luxury-charcoal/50">
        {total} предметов
        {saleOnly ? (
          <>
            {" · "}
            <a
              href="/collection"
              className="text-accent-brass hover:text-luxury-base transition-colors"
            >
              весь каталог
            </a>
          </>
        ) : null}
      </p>

      <CollectionCatalog saleOnly={saleOnly} />
      <FloatingConcierge />
    </div>
  );
}
