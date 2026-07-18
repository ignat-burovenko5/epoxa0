import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentEntryPage from "@/components/ContentEntryPage";
import FloatingConcierge from "@/components/FloatingConcierge";
import InfoSectionPage from "@/components/InfoSectionPage";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductPrice from "@/components/ProductPrice";
import ProductGetContacts from "@/components/ProductGetContacts";
import StickyInquiryBar from "@/components/StickyInquiryBar";
import { ClockIcon } from "@/components/NavContactIcons";
import YandexSalonMap from "@/components/YandexSalonMap";
import { getCatalogProduct } from "@/lib/catalog";
import { getContentEntryBySlug } from "@/lib/content";
import { getHomeSection } from "@/lib/info-sections";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  pageMetadata,
  productPageDescription,
  productPageTitle,
} from "@/lib/seo";
import { categoryHref, categorySlugFromLabel, siteConfig } from "@/lib/site";
import { getProductGallery } from "@/lib/site-images";

const RESERVED_SLUGS = new Set([
  "robots.txt",
  "sitemap.xml",
  "favicon.ico",
  "manifest.json",
  "apple-touch-icon.png",
]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const contentEntry = getContentEntryBySlug(slug);
  if (contentEntry) {
    return pageMetadata({
      title: contentEntry.title,
      description: contentEntry.excerpt,
      path: `/${slug}`,
    });
  }

  const infoSection = getHomeSection(slug);
  if (infoSection) {
    const description =
      infoSection.description ?? infoSection.paragraphs[0] ?? siteConfig.description;
    return pageMetadata({
      title: infoSection.title,
      description,
      path: `/${slug}`,
    });
  }

  const product = getCatalogProduct(slug);
  if (!product) {
    return pageMetadata({
      title: "Страница не найдена",
      description: "Запрашиваемая страница не найдена.",
      noIndex: true,
      enrichDescription: false,
    });
  }

  const title = product.title;

  return pageMetadata({
    title: productPageTitle(title),
    description: productPageDescription(title, product.category),
    path: `/${slug}`,
  });
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

  const contentEntry = getContentEntryBySlug(slug);
  if (contentEntry) {
    return <ContentEntryPage entry={contentEntry} />;
  }

  const product = getCatalogProduct(slug);
  if (product) {
    const title = product.title;
    const [galleryMain, galleryDetail, galleryInterior] = getProductGallery(slug);
    const gallerySlides = [
      { src: galleryMain, alt: `${title} — общий вид`, priority: true },
      { src: galleryDetail, alt: `${title} — детали и фактура`, priority: false },
      { src: galleryInterior, alt: `${title} — в современном интерьере`, priority: false },
    ] as const;
    const descriptionParagraphs = product.description.filter(
      (paragraph) => paragraph !== product.era,
    );
    const categorySlug = categorySlugFromLabel(product.category);

    return (
    <main className="bg-museum-light text-luxury-charcoal min-h-screen relative pb-mobile-chrome lg:pb-0 -mt-[var(--site-header-offset)] pt-[var(--site-header-offset)]">
      <div className="flex flex-col lg:flex-row lg:items-start">
        <div className="w-full lg:w-[68%] xl:w-[70%] lg:shrink-0">
          <ProductImageGallery slides={gallerySlides} />
        </div>

        <div className="w-full lg:w-[32%] xl:w-[30%] px-4 sm:px-6 lg:px-8 xl:px-10 pt-10 pb-2 md:pt-16 md:pb-8 lg:pt-8 lg:pb-12 flex flex-col justify-start">
          <div className="max-w-md w-full">
            {categorySlug ? (
              <Link
                href={categoryHref(categorySlug)}
                className="inline-block font-sans text-xs tracking-widest uppercase text-accent-brass mb-3 transition-colors hover:text-luxury-charcoal underline-offset-4 hover:underline"
              >
                {product.category}
              </Link>
            ) : (
              <p className="font-sans text-xs tracking-widest uppercase text-accent-brass mb-3">
                {product.category}
              </p>
            )}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight mb-4">
              {title}
            </h1>
            {product.era ? (
              <p className="font-sans text-sm text-luxury-charcoal/60 mb-4 tracking-wide leading-relaxed">
                {product.era}
              </p>
            ) : null}
            <ProductPrice
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              size="lg"
              className="mb-4"
            />
            <ProductGetContacts
              productName={title}
              className="mb-8 lg:mb-10 hidden lg:block"
            />

            <div className="space-y-4 text-sm font-sans leading-relaxed text-luxury-charcoal/80 mb-8">
              {descriptionParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <YandexSalonMap
              variant="light"
              compact
              heading="Шоурум — осмотр и самовывоз"
              className="mb-6 pt-8 border-t border-luxury-charcoal/10"
            />
            <p className="flex items-start gap-2 font-sans text-xs text-luxury-charcoal/55 leading-relaxed mb-0 lg:mb-10">
              <ClockIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-brass" />
              <span>
                {siteConfig.workingHours}
                {" · "}
                <Link
                  href={siteConfig.addressHref}
                  className="text-accent-brass underline underline-offset-2 hover:text-luxury-charcoal"
                >
                  как добраться
                </Link>
              </span>
            </p>

          </div>
        </div>
      </div>

      <StickyInquiryBar productName={title} />

      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "@id": `${absoluteUrl(`/${slug}`)}#product`,
            name: title,
            inLanguage: "ru-RU",
            category: product.category,
            sku: slug,
            image: [galleryMain, galleryDetail, galleryInterior].map((src) =>
              src.startsWith("http") ? src : absoluteUrl(src),
            ),
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
              url: absoluteUrl(`/${slug}`),
              itemCondition: "https://schema.org/UsedCondition",
              areaServed: {
                "@type": "Country",
                name: "Russia",
              },
              seller: {
                "@id": `${siteConfig.url}/#organization`,
              },
            },
          },
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Коллекция", path: "/collection" },
            ...(categorySlug
              ? [{ name: product.category, path: categoryHref(categorySlug) }]
              : []),
            { name: title, path: `/${slug}` },
          ]),
        ])}
      </script>
      <FloatingConcierge />
    </main>
    );
  }

  const infoSection = getHomeSection(slug);
  if (infoSection) {
    return <InfoSectionPage section={infoSection} />;
  }

  notFound();
}
