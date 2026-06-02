"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site";

const WHATSAPP_HREF = `https://wa.me/${siteConfig.whatsapp}`;
const TELEGRAM_HREF = `https://t.me/${siteConfig.telegram}`;

function whatsappHref(message: string) {
  return `${WHATSAPP_HREF}?text=${encodeURIComponent(message)}`;
}

function telegramHref(message: string) {
  return `${TELEGRAM_HREF}?text=${encodeURIComponent(message)}`;
}

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
          <p className="font-serif text-2xl mb-2 text-accent-gold">Личный куратор</p>
          <p className="font-sans text-sm text-museum-warm/80 leading-relaxed mb-6">
            Ответим на вопросы о провенансе, состоянии и доставке по России. Работаем через WhatsApp и Telegram — как вам удобнее.
          </p>
          <div className="space-y-3">
            <a
              href={whatsappHref("Здравствуйте! Хотел(а) бы получить консультацию по коллекции.")}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer block w-full text-center border border-accent-brass/50 py-3 font-sans text-xs tracking-widest uppercase hover:bg-accent-brass/10 transition-colors"
            >
              WhatsApp
            </a>
            <a
              href={telegramHref("Здравствуйте! Хотел(а) бы получить консультацию по коллекции.")}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer block w-full text-center border border-accent-brass/50 py-3 font-sans text-xs tracking-widest uppercase hover:bg-accent-brass/10 transition-colors"
            >
              Telegram
            </a>
            <a
              href={siteConfig.phoneHref}
              className="cursor-pointer block w-full text-center py-3 font-sans text-xs tracking-widest uppercase text-museum-light/60 hover:text-museum-light transition-colors"
            >
              {siteConfig.phone}
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
