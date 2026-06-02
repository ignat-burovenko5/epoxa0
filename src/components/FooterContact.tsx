import type { ReactNode } from "react";
import Link from "next/link";
import {
  ClockIcon,
  DeliveryIcon,
  EmailIcon,
  LocationIcon,
  PhoneIcon,
} from "@/components/NavContactIcons";
import { salonContactFields } from "@/lib/salon-contact";
import YandexSalonMap from "@/components/YandexSalonMap";

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

const footerContactIcons = {
  Email: <EmailIcon className={iconClass} />,
  Телефон: <PhoneIcon className={iconClass} />,
  Шоурум: <LocationIcon className={iconClass} />,
  "Часы работы": <ClockIcon className={iconClass} />,
  Доставка: <DeliveryIcon className={iconClass} />,
} as const;

export default function FooterContact() {
  const [email, phone, showroom, hours] = salonContactFields;

  return (
    <div className="w-full max-w-sm">
      <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.25em] text-accent-gold/90">
        Контакты
      </p>
      <div className="flex flex-col gap-0.5">
        <ContactRow
          href={email.href!}
          label={email.label}
          value={email.value}
          icon={footerContactIcons.Email}
          linkVariant="email"
          animateClass="contact-enter-delay-1"
        />
        <ContactRow
          href={phone.href!}
          label={phone.label}
          value={phone.value}
          icon={footerContactIcons.Телефон}
          linkVariant="phone"
          animateClass="contact-enter-delay-2"
        />
        <ContactRow
          href={showroom.href!}
          label={showroom.label}
          value={showroom.value}
          icon={footerContactIcons.Шоурум}
          external={showroom.external}
        />
      </div>
      <div className="mt-2 flex w-full max-w-sm items-start gap-3.5 px-1 py-2.5 -mx-1">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent-gold/20 bg-museum-light/[0.03] text-accent-gold">
          {footerContactIcons["Часы работы"]}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5 pt-1.5">
          <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-museum-light/60">
            {hours.label}
          </span>
          <span className="font-serif text-sm leading-snug text-museum-light/80 md:text-base">
            {hours.value}
          </span>
        </span>
      </div>
      <div className="mt-4 w-full max-w-sm">
        <div className="mb-3 flex w-full max-w-sm items-start gap-3.5 px-1 py-2.5 -mx-1">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent-gold/20 bg-museum-light/[0.03] text-accent-gold">
            {footerContactIcons.Доставка}
          </span>
          <span className="flex min-w-0 flex-col justify-center pt-1.5">
            <span className="font-serif text-sm leading-snug text-museum-light/90 md:text-base">
              Доставка по Москве, Санкт‑Петербургу и всей России
            </span>
          </span>
        </div>
        <YandexSalonMap compact showAddress={false} />
      </div>
    </div>
  );
}
