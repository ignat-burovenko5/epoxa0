import HeaderBurgerMenu from "@/components/HeaderBurgerMenu";
import Logo from "@/components/Logo";
import { EmailIcon, PhoneIcon } from "@/components/NavContactIcons";
import { siteConfig } from "@/lib/site";

const navContactLinkClass =
  "contact-link-animated contact-enter group grid grid-cols-[2.25rem_1fr] sm:grid-cols-[2.5rem_1fr] gap-x-2.5 sm:gap-x-3 items-center text-museum-light hover:text-white transition-colors duration-300 py-0.5";

const navIconSlotClass =
  "contact-icon-ring flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center justify-self-start rounded-full border border-transparent text-accent-gold/90";

const navContactTextClass =
  "font-serif text-[1.0625rem] sm:text-xl md:text-[1.375rem] lg:text-2xl leading-none whitespace-nowrap tracking-[0.01em]";

export default function SiteHeader() {
  return (
    <header className="site-header fixed top-0 left-0 right-0 overflow-visible border-b border-museum-light/5 bg-luxury-base/95 backdrop-blur-md supports-[backdrop-filter]:bg-luxury-base/90">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 sm:gap-4 md:py-4 px-4 sm:px-6 lg:px-8">
        <div className="site-header-menu relative shrink-0">
          <HeaderBurgerMenu />
        </div>
        <div className="site-header-logo relative min-w-0 overflow-visible">
          <Logo className="shrink-0 max-w-full" />
        </div>
        <div className="site-header-contacts flex shrink-0 flex-col justify-center gap-0.5 sm:gap-1">
          <a
            href={siteConfig.salonEmailHref}
            className={`${navContactLinkClass} contact-link-email contact-enter-delay-1`}
          >
            <span className={navIconSlotClass}>
              <EmailIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
            </span>
            <span className={`${navContactTextClass} transition-transform duration-300 group-hover:translate-x-0.5`}>
              {siteConfig.salonEmail}
            </span>
          </a>
          <a
            href={siteConfig.phoneHref}
            className={`${navContactLinkClass} contact-link-phone contact-enter-delay-2`}
          >
            <span className={navIconSlotClass}>
              <PhoneIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
            </span>
            <span className={`${navContactTextClass} transition-transform duration-300`}>
              {siteConfig.phone}
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
