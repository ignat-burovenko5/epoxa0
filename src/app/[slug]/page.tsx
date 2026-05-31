import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import FloatingConcierge from "@/components/FloatingConcierge";
import InfoSectionPage from "@/components/InfoSectionPage";
import ProductPrice from "@/components/ProductPrice";
import ProductPurchaseCtas from "@/components/ProductPurchaseCtas";
import StickyInquiryBar from "@/components/StickyInquiryBar";
import {
  catalogProducts,
  getCatalogProduct,
  getCatalogSlugs,
} from "@/lib/catalog";
import {
  getHomeSection,
  homeSectionSlugs,
  siteConfig,
} from "@/lib/site";
import { getProductGallery } from "@/lib/site-images";

const RESERVED_SLUGS = new Set([
  "robots.txt",
  "sitemap.xml",
  "favicon.ico",
  "manifest.json",
  "apple-touch-icon.png",
]);

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...homeSectionSlugs.map((slug) => ({ slug })),
    ...getCatalogSlugs().map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const infoSection = getHomeSection(slug);

  if (infoSection) {
    return {
      title: `${infoSection.title} | ${siteConfig.name}`,
      description: infoSection.paragraphs[0],
      openGraph: {
        locale: "ru_RU",
        title: `${infoSection.title} | ${siteConfig.name}`,
        description: infoSection.paragraphs[0],
      },
    };
  }

  const product = getCatalogProduct(slug);
  const title = product?.title ?? slug.replace(/-/g, " ");

  return {
    title: `${title} — купить антиквариат`,
    description: `${title}. Провенанс, экспертиза, доставка по России. Шоурум ${siteConfig.name}, Москва.`,
    openGraph: {
      locale: "ru_RU",
      title,
      description: `Редкий предмет коллекции ${siteConfig.name}. Консультация куратора и доставка по РФ.`,
    },
  };
}

export default async function ProductDossier({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (RESERVED_SLUGS.has(slug)) {
    notFound();
  }

  const infoSection = getHomeSection(slug);
  if (infoSection) {
    return <InfoSectionPage section={infoSection} />;
  }

  const product = catalogProducts[slug];
  if (!product) {
    notFound();
  }

  const title = product.title;
  const [galleryMain, galleryDetail, galleryInterior] = getProductGallery(slug);

  return (
    <main className="bg-museum-light text-luxury-charcoal min-h-screen relative pb-40 lg:pb-0">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <div className="w-full lg:w-3/5 lg:sticky lg:top-0 lg:h-screen overflow-y-auto hidden-scrollbar bg-museum-warm">
          <div className="flex flex-col gap-1">
            <div className="relative w-full h-[70vh] lg:h-screen bg-luxury-base">
              <Image
                src={galleryMain}
                alt={`${title} — общий вид`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover opacity-80"
              />
            </div>
            <div className="relative w-full h-[70vh] lg:h-screen bg-luxury-base">
              <Image
                src={galleryDetail}
                alt={`${title} — детали и фактура`}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover opacity-80"
              />
            </div>
            <div className="relative w-full h-[70vh] lg:h-screen bg-luxury-base">
              <Image
                src={galleryInterior}
                alt={`${title} — в современном интерьере`}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover opacity-80"
              />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/5 px-4 sm:px-6 lg:px-10 py-10 md:py-16 lg:py-20 flex flex-col justify-start">
          <div className="max-w-md w-full">
            <p className="font-sans text-xs tracking-widest uppercase text-accent-brass mb-3">
              {product.category}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight mb-4">
              {title}
            </h1>
            <ProductPrice
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              size="lg"
              className="mb-3"
            />
            <p className="font-sans text-sm text-luxury-charcoal/60 mb-5 tracking-wide">
              Доставка по России • Осмотр в шоуруме
            </p>

            <ProductPurchaseCtas
              productName={title}
              price={product.price}
              className="mb-8 lg:mb-10"
            />

            <div className="flex flex-wrap gap-2 mb-8">
              <span className="text-xs font-sans uppercase tracking-widest border border-accent-brass/40 px-3 py-1">
                Экспертиза
              </span>
              <span className="text-xs font-sans uppercase tracking-widest border border-accent-brass/40 px-3 py-1">
                Белые перчатки
              </span>
            </div>

            <div className="space-y-4 text-sm font-sans leading-relaxed text-luxury-charcoal/80 mb-10">
              {product.description.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

          </div>
        </div>
      </div>

      <StickyInquiryBar productName={title} price={product.price} />

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          name: title,
          inLanguage: "ru",
          image: [galleryMain, galleryDetail, galleryInterior],
          description: product.description[0],
          brand: {
            "@type": "Brand",
            name: siteConfig.name,
          },
          itemCondition: "https://schema.org/UsedCondition",
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/InStock",
            priceCurrency: siteConfig.currency,
            price: String(product.price),
            priceValidUntil: "2027-12-31",
            url: `${siteConfig.url}/${slug}`,
            areaServed: {
              "@type": "Country",
              name: "Russia",
            },
            seller: {
              "@type": "Organization",
              name: siteConfig.name,
              address: {
                "@type": "PostalAddress",
                addressLocality: siteConfig.address.city,
                addressCountry: siteConfig.address.country,
              },
            },
          },
        })}
      </script>
      <FloatingConcierge />
    </main>
  );
}
