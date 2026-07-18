import type { Metadata } from "next";
import { connection } from "next/server";
import BrandLines from "@/components/BrandLines";
import Image from "next/image";
import Link from "next/link";
import FloatingConciergeLazy from "@/components/FloatingConciergeLazy";
import PageContainer from "@/components/PageContainer";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { siteImages } from "@/lib/site-images";

export const metadata: Metadata = pageMetadata({
  title: `${siteConfig.name} — антикварная мебель на продажу, купить в салоне`,
  description:
    "Каталог антикварной мебели и предметов интерьера: буфеты, комоды, кресла, люстры. Экспертиза, провенанс, доставка по России.",
  path: "/",
});

export default async function Homepage() {
  await connection();
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

      <FloatingConciergeLazy />
    </main>
  );
}
