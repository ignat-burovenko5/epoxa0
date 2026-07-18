"use client";

import { useId, useState } from "react";
import {
  MaxIcon,
  PhoneIcon,
  TelegramIcon,
  WhatsAppIcon,
} from "@/components/NavContactIcons";
import {
  inquiryMessage,
  maxUrl,
  siteConfig,
  telegramUrl,
  whatsappUrl,
} from "@/lib/site";

type ProductGetContactsProps = {
  productName: string;
  variant?: "inline" | "sticky";
  className?: string;
};

const contactLinkClass =
  "inline-flex min-h-11 w-full items-center gap-3 border border-luxury-charcoal/15 bg-museum-light px-3 py-2.5 font-sans text-xs tracking-[0.1em] uppercase text-luxury-charcoal/80 transition-colors hover:border-luxury-charcoal/30 hover:bg-museum-warm hover:text-luxury-base focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 touch-manipulation";

const contactIconClass =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent-brass/35 text-accent-brass";

export default function ProductGetContacts({
  productName,
  variant = "inline",
  className = "",
}: ProductGetContactsProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const isSticky = variant === "sticky";
  const message = inquiryMessage(productName);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`btn-buy-primary flex w-full items-center justify-center px-5 font-sans text-sm font-semibold uppercase text-museum-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxury-bordeaux touch-manipulation sm:text-base ${
          isSticky ? "min-h-14 py-3.5" : "min-h-[3.75rem] py-4 md:min-h-14 md:py-4"
        }`}
      >
        <span className="relative z-[1]">Получить Контакты</span>
      </button>

      {open ? (
        <div
          id={panelId}
          className={`flex flex-col gap-2 ${isSticky ? "mt-2 border-t border-luxury-charcoal/10 pt-2" : "mt-3"}`}
          role="group"
          aria-label="Контакты куратора"
        >
          <a
            href={maxUrl(message)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Написать в MAX"
            className={contactLinkClass}
          >
            <span className={contactIconClass}>
              <MaxIcon className="h-4 w-4" />
            </span>
            <span>MAX</span>
          </a>
          <a
            href={whatsappUrl(message)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Написать в WhatsApp"
            className={contactLinkClass}
          >
            <span className={contactIconClass}>
              <WhatsAppIcon className="h-4 w-4" />
            </span>
            <span>WhatsApp</span>
          </a>
          <a
            href={telegramUrl(message)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Написать в Telegram"
            className={contactLinkClass}
          >
            <span className={contactIconClass}>
              <TelegramIcon className="h-4 w-4" />
            </span>
            <span>Telegram</span>
          </a>
          <a
            href={siteConfig.phoneHref}
            aria-label={`Позвонить куратору: ${siteConfig.phone}`}
            className={`${contactLinkClass} normal-case tracking-normal`}
          >
            <span className={contactIconClass}>
              <PhoneIcon className="h-4 w-4" />
            </span>
            <span>{siteConfig.phone}</span>
          </a>
        </div>
      ) : null}
    </div>
  );
}
