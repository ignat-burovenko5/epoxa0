import Link from "next/link";
import FooterBrand from "@/components/FooterBrand";
import FooterContact from "@/components/FooterContact";
import { DeliveryIcon } from "@/components/NavContactIcons";
import PageContainer from "@/components/PageContainer";
import { footerLegalLinks } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="relative z-50 bg-luxury-base text-museum-light/70 border-t border-museum-light/10 max-lg:scroll-mt-4 max-lg:pb-8">
      <PageContainer className="py-14 pb-8 md:py-20 md:pb-20">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-20">
          <FooterBrand />
          <FooterContact />
        </div>

        <nav
          aria-label="Правовая информация"
          className="mt-10 grid gap-3 sm:grid-cols-2 md:mt-12"
        >
          {footerLegalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="footer-legal-link"
            >
              <span className="footer-legal-link__label">{link.label}</span>
              <span className="footer-legal-link__arrow" aria-hidden="true">
                ⟶
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-10 border-t border-museum-light/10 pt-8 font-sans text-xs text-museum-light/55 md:mt-12">
          <p className="mb-5 flex items-center gap-3 text-sm leading-snug text-museum-light/80 md:gap-3.5 md:text-base">
            <DeliveryIcon className="h-6 w-6 shrink-0 text-accent-gold md:h-7 md:w-7" />
            <span>Доставка по Москве, Санкт‑Петербургу и всей России.</span>
          </p>
          <p>© {new Date().getFullYear()} {siteConfig.name}</p>
        </div>
      </PageContainer>
    </footer>
  );
}
