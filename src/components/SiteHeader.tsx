import HeaderBurgerMenu from "@/components/HeaderBurgerMenu";
import Logo from "@/components/Logo";
import { EmailIcon, PhoneIcon } from "@/components/NavContactIcons";
import { siteChromeSurfaceClass } from "@/components/site-chrome";
import { siteConfig } from "@/lib/site";

const navContactLinkClass =
  "contact-link-animated contact-enter group grid grid-cols-[2rem_1fr] gap-x-2.5 items-center text-museum-light hover:text-white transition-colors duration-300 py-0";

const navIconSlotClass =
  "contact-icon-ring flex h-7 w-7 items-center justify-center justify-self-start rounded-full border border-transparent text-accent-gold/90";

const navContactTextClass =
  "font-serif text-[1.0625rem] lg:text-xl leading-none whitespace-nowrap tracking-[0.01em]";

const navIconOnlyClass =
  "flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-museum-light/10 text-accent-gold/90 transition-colors hover:border-accent-gold/40 hover:text-accent-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 touch-manipulation";

export default function SiteHeader() {
  return (
    <header
      className={`site-header fixed top-0 left-0 right-0 overflow-x-clip border-b ${siteChromeSurfaceClass} pt-[env(safe-area-inset-top,0px)]`}
    >
      <div className="site-header__inner mx-auto flex w-full max-w-[1760px] items-center justify-between gap-3 px-3 sm:px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
          <div className="site-header-menu relative shrink-0">
            <HeaderBurgerMenu />
          </div>
          <div className="site-header-logo relative min-w-0 overflow-visible">
            <Logo className="shrink-0 max-w-full" />
          </div>
        </div>
        <div className="site-header-contacts flex shrink-0 items-center justify-end gap-1 sm:gap-2">
          <div className="site-header-contacts-icons-mobile flex items-center md:hidden">
            <a
              href={siteConfig.salonEmailHref}
              className={`${navIconOnlyClass} contact-link-email`}
              aria-label={`Написать на ${siteConfig.salonEmail}`}
            >
              <EmailIcon className="h-[1.125rem] w-[1.125rem]" />
            </a>
            <a
              href={siteConfig.phoneHref}
              className={`${navIconOnlyClass} contact-link-phone`}
              aria-label={`Позвонить: ${siteConfig.phone}`}
            >
              <PhoneIcon className="h-[1.125rem] w-[1.125rem]" />
            </a>
          </div>
          <div className="hidden md:flex flex-col justify-center gap-1.5">
            <a
              href={siteConfig.salonEmailHref}
              className={`${navContactLinkClass} contact-link-email contact-enter-delay-1`}
            >
              <span className={navIconSlotClass}>
                <EmailIcon className="h-4 w-4 lg:h-5 lg:w-5" />
              </span>
              <span
                className={`${navContactTextClass} transition-transform duration-300 group-hover:translate-x-0.5`}
              >
                {siteConfig.salonEmail}
              </span>
            </a>
            <a
              href={siteConfig.phoneHref}
              className={`${navContactLinkClass} contact-link-phone contact-enter-delay-2`}
            >
              <span className={navIconSlotClass}>
                <PhoneIcon className="h-4 w-4 lg:h-5 lg:w-5" />
              </span>
              <span className={`${navContactTextClass} transition-transform duration-300`}>
                {siteConfig.phone}
              </span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
