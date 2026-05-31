"use client";

import { useState } from "react";
import { siteConfig, telegramUrl, whatsappUrl } from "@/lib/site";

export default function FloatingConcierge() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-36 right-4 z-40 flex flex-col items-end md:bottom-8 md:right-8">
      <div
        className={`transition-all duration-500 ease-luxury-ease origin-bottom-right mb-4 ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-luxury-base text-museum-light p-8 w-80 shadow-2xl border border-luxury-charcoal">
          <p className="font-serif text-2xl mb-2 text-accent-gold">Личный куратор</p>
          <p className="font-sans text-sm text-museum-warm/80 leading-relaxed mb-6">
            Ответим на вопросы о провенансе, состоянии и доставке по России. Работаем через WhatsApp и Telegram — как вам удобнее.
          </p>
          <div className="space-y-3">
            <a
              href={whatsappUrl("Здравствуйте! Хотел(а) бы получить консультацию по коллекции.")}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer block w-full text-center border border-accent-brass/50 py-3 font-sans text-xs tracking-widest uppercase hover:bg-accent-brass/10 transition-colors"
            >
              WhatsApp
            </a>
            <a
              href={telegramUrl("Здравствуйте! Хотел(а) бы получить консультацию по коллекции.")}
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
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Закрыть меню куратора" : "Связаться с куратором"}
        className="cursor-pointer bg-accent-brass text-luxury-base rounded-full h-14 px-6 font-sans text-xs tracking-widest uppercase shadow-lg hover:bg-accent-gold transition-colors flex items-center space-x-2"
      >
        <span>{isOpen ? "Закрыть" : "Куратор"}</span>
      </button>
    </div>
  );
}
