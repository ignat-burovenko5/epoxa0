import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FloatingConcierge from "@/components/FloatingConcierge";
import { CatalogGrid, catalogItems } from "@/components/CatalogGrid";
import { categoryLabel, siteConfig } from "@/lib/site";

export function generateStaticParams() {
  return siteConfig.categoryLinks.map((item) => ({ category: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const label = categoryLabel(category);

  return {
    title: `${label} — каталог антиквариата`,
    description: `Антикварные предметы: ${label.toLowerCase()}. Доставка по России.`,
  };
}

function formatCategoryIntro(label: string) {
  return label.charAt(0) + label.slice(1).toLowerCase();
}

export default async function CategoryListing({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const exists = siteConfig.categoryLinks.some((item) => item.slug === category);

  if (!exists) {
    notFound();
  }

  const label = categoryLabel(category);
  const isSale = category === "vesennyaya-rasprodazha";

  return (
    <div className="pb-16 md:pb-20">
      <header className="mb-8 md:mb-10">
        {isSale && (
          <p className="font-sans text-xs tracking-widest uppercase text-luxury-bordeaux mb-2">
            Акция
          </p>
        )}
        <h1 className="font-serif text-2xl md:text-4xl lg:text-5xl text-luxury-base mb-3 leading-tight">
          {label}
        </h1>
        <p className="font-sans text-sm md:text-base text-luxury-charcoal/70 max-w-xl leading-relaxed">
          Подборка предметов из раздела «{formatCategoryIntro(label)}».{" "}
          <span className="text-luxury-charcoal/50">{catalogItems.length} предметов</span>
        </p>
      </header>

      <CatalogGrid items={catalogItems} />
      <FloatingConcierge />
    </div>
  );
}
