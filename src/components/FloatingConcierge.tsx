"use client";

import { useState } from "react";
import { MaxIcon, PhoneIcon, TelegramIcon, WhatsAppIcon } from "@/components/NavContactIcons";
import { maxUrl, siteConfig, telegramUrl, whatsappUrl } from "@/lib/site";

const CONSULT_MESSAGE =
  "Здравствуйте! Хотел(а) бы получить консультацию по коллекции. Салон «Эпоха», тел. +7 (963) 780-64-30";

const contactLinkClass =
  "contact-link-animated group flex min-h-12 w-full cursor-pointer items-center gap-3 border border-accent-brass/40 px-3 py-2.5 font-sans text-xs tracking-widest uppercase text-museum-light transition-colors hover:border-accent-gold/70 hover:bg-accent-brass/10";

const contactIconClass =
  "contact-icon-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent-gold/25 text-accent-gold";

export default function FloatingConcierge() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mobile-fab fixed flex flex-col items-end">
      <div
        className={`transition-all duration-500 ease-luxury-ease origin-bottom-right mb-3 md:mb-4 ${
          isOpen ? "opacity-100 scale-100" : "hidden"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="bg-luxury-base text-museum-light p-5 sm:p-8 w-[min(20rem,calc(100vw-2rem))] shadow-2xl border border-luxury-charcoal max-h-[min(70dvh,28rem)] overflow-y-auto hidden-scrollbar">
          <p className="font-serif text-2xl mb-2 text-accent-gold">
            Ваш личный куратор
          </p>
          <p className="font-sans text-sm text-museum-warm/80 leading-relaxed mb-6">
            Ответит на вопросы о провенансе, состоянии и доставке по России. Выберите удобный способ связи.
          </p>
          <div className="space-y-3">
            <a
              href={maxUrl(CONSULT_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className={contactLinkClass}
              aria-label="Написать куратору в MAX"
            >
              <span className={`${contactIconClass} overflow-hidden p-0`}>
                <MaxIcon className="h-9 w-9 rounded-full" />
              </span>
              <span>MAX</span>
            </a>
            <a
              href={whatsappUrl(CONSULT_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className={contactLinkClass}
              aria-label="Написать куратору в WhatsApp"
            >
              <span className={contactIconClass}>
                <WhatsAppIcon className="h-5 w-5" />
              </span>
              <span>WhatsApp</span>
            </a>
            <a
              href={telegramUrl(CONSULT_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className={contactLinkClass}
              aria-label="Написать куратору в Telegram"
            >
              <span className={contactIconClass}>
                <TelegramIcon className="h-5 w-5" />
              </span>
              <span>Telegram</span>
            </a>
            <a
              href={siteConfig.phoneHref}
              className={`${contactLinkClass} contact-link-phone`}
              aria-label={`Позвонить куратору: ${siteConfig.phone}`}
            >
              <span className={contactIconClass}>
                <PhoneIcon className="h-5 w-5" />
              </span>
              <span>{siteConfig.phone}</span>
            </a>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Закрыть меню куратора" : "Связаться с куратором"}
        className="relative z-[1] cursor-pointer bg-accent-brass text-luxury-base rounded-full min-h-12 h-12 sm:h-14 px-5 sm:px-6 font-sans text-xs tracking-widest uppercase shadow-lg hover:bg-accent-gold transition-colors flex items-center gap-2 touch-manipulation"
      >
        <span>{isOpen ? "Закрыть" : "Куратор"}</span>
      </button>
    </div>
  );
}
