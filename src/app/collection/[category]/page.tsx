import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionCatalog from "@/components/CollectionCatalog";
import FloatingConcierge from "@/components/FloatingConcierge";
import { getFilteredProducts } from "@/lib/catalog";
import {
  parseCatalogPriceRange,
  parseCatalogSort,
} from "@/lib/catalog-shared";
import { categoryPageDescription, categoryPageTitle, pageMetadata } from "@/lib/seo";
import { categoryLabel, siteConfig } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const label = categoryLabel(category);

  return pageMetadata({
    title: categoryPageTitle(label),
    description: categoryPageDescription(label),
    path: `/collection/${category}`,
    enrichDescription: false,
  });
}

function formatCategoryIntro(label: string) {
  return label.charAt(0) + label.slice(1).toLowerCase();
}

export default async function CategoryListing({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string; min?: string; max?: string }>;
}) {
  const { category } = await params;
  const query = await searchParams;
  const exists = siteConfig.categoryLinks.some((item) => item.slug === category);

  if (!exists) {
    notFound();
  }

  const label = categoryLabel(category);
  const isSale = category === "vesennyaya-rasprodazha";
  const sort = parseCatalogSort(query.sort);
  const priceRange = parseCatalogPriceRange(query.min, query.max);
  const total = getFilteredProducts({
    categorySlug: category,
    sort,
    priceMin: priceRange.min,
    priceMax: priceRange.max,
  }).length;

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
          Антикварная мебель и предметы — раздел «{formatCategoryIntro(label)}». Купить с доставкой по России.{" "}
          <span className="text-luxury-charcoal/50">{total} предметов</span>
        </p>
      </header>

      <CollectionCatalog
        categorySlug={category}
        sort={sort}
        priceRange={priceRange}
      />
      <FloatingConcierge />
    </div>
  );
}
