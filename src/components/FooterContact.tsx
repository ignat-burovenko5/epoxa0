import type { ReactNode } from "react";
import Link from "next/link";
import { ClockIcon, EmailIcon, LocationIcon, PhoneIcon } from "@/components/NavContactIcons";
import { siteConfig } from "@/lib/site";

type ContactRowProps = {
  href: string;
  label: string;
  value: string;
  icon: ReactNode;
  external?: boolean;
  animateClass?: string;
  linkVariant?: "email" | "phone";
};

function ContactRow({
  href,
  label,
  value,
  icon,
  external,
  animateClass = "",
  linkVariant,
}: ContactRowProps) {
  const variantClass =
    linkVariant === "email"
      ? "contact-link-email"
      : linkVariant === "phone"
        ? "contact-link-phone"
        : "";

  const content = (
    <>
      <span className="contact-icon-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent-gold/20 bg-museum-light/[0.03] text-accent-gold">
        {icon}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5 pt-1.5">
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-museum-light/60">
          {label}
        </span>
        <span className="font-serif text-sm leading-snug text-museum-light/90 transition-colors duration-300 group-hover:text-white md:text-base">
          {value}
        </span>
      </span>
    </>
  );

  const className = [
    "contact-link-animated group contact-enter flex w-full max-w-sm items-start gap-3.5 rounded-sm px-1 py-2.5 -mx-1 transition-colors duration-300 ease-luxury-ease hover:bg-museum-light/[0.04] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/60",
    variantClass,
    animateClass,
  ]
    .filter(Boolean)
    .join(" ");

  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

const iconClass = "h-[1.125rem] w-[1.125rem]";

export default function FooterContact() {
  return (
    <div className="w-full max-w-sm">
      <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.25em] text-accent-gold/90">
        Контакты
      </p>
      <div className="flex flex-col gap-0.5">
        <ContactRow
          href={siteConfig.salonEmailHref}
          label="Email"
          value={siteConfig.salonEmail}
          icon={<EmailIcon className={iconClass} />}
          linkVariant="email"
          animateClass="contact-enter-delay-1"
        />
        <ContactRow
          href={siteConfig.phoneHref}
          label="Телефон"
          value={siteConfig.phone}
          icon={<PhoneIcon className={iconClass} />}
          linkVariant="phone"
          animateClass="contact-enter-delay-2"
        />
        <ContactRow
          href={siteConfig.addressHref}
          label="Шоурум"
          value={siteConfig.addressLine}
          icon={<LocationIcon className={iconClass} />}
        />
      </div>
      <div className="mt-2 flex w-full max-w-sm items-start gap-3.5 px-1 py-2.5 -mx-1">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent-gold/20 bg-museum-light/[0.03] text-accent-gold">
          <ClockIcon className={iconClass} />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5 pt-1.5">
          <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-museum-light/60">
            Часы работы
          </span>
          <span className="font-serif text-sm leading-snug text-museum-light/80 md:text-base">
            {siteConfig.workingHours}
          </span>
        </span>
      </div>
    </div>
  );
}
