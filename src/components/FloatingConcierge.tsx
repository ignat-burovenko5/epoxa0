"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MaxIcon, PhoneIcon, TelegramIcon, WhatsAppIcon } from "@/components/NavContactIcons";
import { maxUrl, siteConfig, telegramUrl, whatsappUrl } from "@/lib/site";

const CONSULT_MESSAGE =
  "Здравствуйте! Хотел(а) бы получить консультацию по коллекции. Салон «Эпоха», тел. +7 (963) 780-64-30";

const SCROLL_TOP_SHOW_AT = 420;

const contactLinkClass =
  "contact-link-animated group flex min-h-12 w-full cursor-pointer items-center gap-3 border border-accent-brass/40 px-3 py-2.5 font-sans text-xs tracking-widest uppercase text-museum-light transition-colors hover:border-accent-gold/70 hover:bg-accent-brass/10";

const contactIconClass =
  "contact-icon-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent-gold/25 text-accent-gold";

function ArrowUpIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 19V5M5 12l7-7 7 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FloatingConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > SCROLL_TOP_SHOW_AT);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  function scrollToTop() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="mobile-fab pointer-events-none fixed flex flex-col items-end"
      data-curator-fab
    >
      <div
        className={`pointer-events-auto transition-all duration-500 ease-luxury-ease origin-bottom-right mb-3 md:mb-4 ${
          isOpen
            ? "opacity-100 scale-100 visible"
            : "pointer-events-none invisible absolute opacity-0 scale-95"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="bg-luxury-base text-museum-light p-5 sm:p-8 w-[min(20rem,calc(100vw-2rem))] max-h-[min(70dvh,28rem)] overflow-y-auto hidden-scrollbar shadow-2xl border border-luxury-charcoal">
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
              <span className={contactIconClass}>
                <MaxIcon className="h-5 w-5" />
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
              <span className="whitespace-nowrap">{siteConfig.phone}</span>
            </a>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Наверх"
        tabIndex={showScrollTop ? 0 : -1}
        className={`pointer-events-auto relative z-[1] mb-2.5 sm:mb-3 flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border border-accent-brass/70 bg-luxury-base/90 text-accent-gold shadow-lg backdrop-blur-sm transition-all duration-300 ease-luxury-ease touch-manipulation hover:border-accent-gold hover:bg-accent-brass hover:text-luxury-base ${
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <ArrowUpIcon className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Закрыть меню куратора" : "Связаться с куратором"}
        className="pointer-events-auto relative z-[1] cursor-pointer bg-accent-brass text-luxury-base rounded-full min-h-12 h-12 sm:h-14 px-5 sm:px-6 font-sans text-xs tracking-widest uppercase shadow-lg hover:bg-accent-gold transition-colors flex items-center justify-center gap-2 touch-manipulation whitespace-nowrap shrink-0"
      >
        <span>{isOpen ? "Закрыть" : "Куратор"}</span>
      </button>
    </div>,
    document.body,
  );
}
