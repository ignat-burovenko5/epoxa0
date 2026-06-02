import Link from "next/link";
import FooterBrand from "@/components/FooterBrand";
import FooterContact from "@/components/FooterContact";
import Logo from "@/components/Logo";
import { ArrowSquareUpRightIcon } from "@/components/NavContactIcons";
import PageContainer from "@/components/PageContainer";
import { footerLegalLinks } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="site-footer relative bg-luxury-base text-museum-light/70 border-t border-museum-light/10 max-lg:scroll-mt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <PageContainer className="pt-14 pb-0 md:pt-20 md:pb-0">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-20">
          <div className="flex min-w-0 flex-col gap-0 w-full max-w-md lg:max-w-xl">
            <FooterBrand />

            <nav
              aria-label="Разделы сайта"
              className="mt-10 grid grid-cols-2 gap-x-4 gap-y-3 md:mt-12"
            >
              {siteConfig.navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="footer-link-text group">
                  <span className="footer-legal-link__label">{link.label}</span>
                  <span className="footer-legal-link__arrow" aria-hidden="true">
                    <ArrowSquareUpRightIcon className="h-4 w-4 opacity-45 transition-[opacity,transform] duration-250 group-hover:opacity-90 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          <FooterContact />
        </div>

        <nav
          aria-label="Правовая информация"
          className="mt-6 grid grid-cols-1 gap-y-3 md:mt-8 md:grid-cols-2 md:gap-x-4"
        >
          {footerLegalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="footer-link-text group">
              <span className="footer-legal-link__label">{link.label}</span>
              <span className="footer-legal-link__arrow" aria-hidden="true">
                <ArrowSquareUpRightIcon className="h-4 w-4 opacity-45 transition-[opacity,transform] duration-250 group-hover:opacity-90 group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-museum-light/10 pt-8 text-center md:mt-12">
          <Logo size="footerMark" />
          <p className="font-sans text-xs text-museum-light/55">
            ©{new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
