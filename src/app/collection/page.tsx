import type { Metadata } from "next";
import CollectionCatalog from "@/components/CollectionCatalog";
import FloatingConcierge from "@/components/FloatingConcierge";
import { getCategoryProductCount } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Коллекция — антикварная мебель и предметы интерьера",
  description:
    "Каталог музейных антикварных предметов: мебель, освещение, зеркала, часы. Фильтр по эпохе, материалу и мастерской. Доставка по России.",
};

export default function CollectionListing() {
  const total = getCategoryProductCount(null);

  return (
    <div className="pb-16 md:pb-20">
      <header className="mb-8 md:mb-10">
        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-luxury-base mb-3">
          Архив коллекции
        </h1>
        <p className="font-sans text-sm md:text-base text-luxury-charcoal/70 max-w-xl leading-relaxed">
          Живая подборка исторически значимых предметов — для современных резиденций, загородных домов и проектов дизайнеров.
        </p>
      </header>

      <div className="flex flex-col gap-3 border-y border-luxury-charcoal/10 py-3 mb-8 font-sans text-xs md:text-sm tracking-widest uppercase text-luxury-base">
        <div className="flex gap-5 overflow-x-auto hidden-scrollbar">
          <button type="button" className="inline-flex items-center min-h-12 px-3 whitespace-nowrap hover:text-accent-brass transition-colors">
            Эпоха
          </button>
          <button type="button" className="inline-flex items-center min-h-12 px-3 whitespace-nowrap hover:text-accent-brass transition-colors">
            Материал
          </button>
          <button type="button" className="inline-flex items-center min-h-12 px-3 whitespace-nowrap hover:text-accent-brass transition-colors">
            Мастерская
          </button>
        </div>
        <p className="text-luxury-charcoal/50 normal-case tracking-normal text-xs md:text-sm shrink-0">
          {total} предметов
        </p>
      </div>

      <CollectionCatalog />
      <FloatingConcierge />
    </div>
  );
}
