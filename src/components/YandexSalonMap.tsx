"use client";

import { ArrowSquareUpRightIcon, LocationIcon } from "@/components/NavContactIcons";
import {
  siteConfig,
  yandexMapsEmbedSrc,
  yandexMapsUrl,
} from "@/lib/site";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

type YandexSalonMapProps = {
  className?: string;
  /** dark — info/legal pages; light — checkout and product */
  variant?: "dark" | "light";
  compact?: boolean;
  showAddress?: boolean;
  heading?: string;
};

const linkClass = {
  dark: "text-accent-gold hover:text-museum-light",
  light: "text-accent-brass hover:text-luxury-charcoal",
} as const;

const borderClass = {
  dark: "border-museum-light/12 bg-museum-light/[0.02]",
  light: "border-luxury-charcoal/12 bg-museum-warm/40",
} as const;

const textClass = {
  dark: "text-museum-light/75",
  light: "text-luxury-charcoal/70",
} as const;

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M9 4H5v4M15 4h4v4M9 20H5v-4M15 20h4v-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MapFrame({
  title,
  className,
  zoom = 16,
}: {
  title: string;
  className?: string;
  zoom?: number;
}) {
  return (
    <iframe
      title={title}
      src={yandexMapsEmbedSrc(zoom)}
      className={className}
      loading="lazy"
      allow="geolocation"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

export default function YandexSalonMap({
  className = "",
  variant = "dark",
  compact = false,
  showAddress = true,
  heading,
}: YandexSalonMapProps) {
  const mapsUrl = yandexMapsUrl();
  const dialogId = useId();
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mapTitle = `Карта: салон «${siteConfig.name}»`;

  const open = useCallback(() => setExpanded(true), []);
  const close = useCallback(() => setExpanded(false), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded, close]);

  const lightbox =
    mounted && expanded
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 md:p-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogId}
          >
            <button
              type="button"
              className="absolute inset-0 cursor-pointer border-0 bg-luxury-base/75 backdrop-blur-sm"
              aria-label="Закрыть карту"
              onClick={close}
            />
            <div
              className={`relative z-[1] flex w-full max-w-5xl flex-col overflow-hidden rounded-sm border shadow-2xl ${borderClass[variant]} ${
                variant === "dark" ? "bg-luxury-base" : "bg-museum-light"
              }`}
            >
              <div className="flex items-center justify-between gap-3 border-b border-current/10 px-4 py-3 sm:px-5">
                <p
                  id={dialogId}
                  className={`min-w-0 font-serif text-lg sm:text-xl ${
                    variant === "dark" ? "text-museum-light" : "text-luxury-base"
                  }`}
                >
                  Салон «{siteConfig.name}»
                </p>
                <button
                  type="button"
                  onClick={close}
                  className={`shrink-0 font-sans text-[11px] tracking-[0.14em] uppercase min-h-10 px-3 transition-colors ${linkClass[variant]}`}
                >
                  Закрыть
                </button>
              </div>
              <MapFrame
                title={mapTitle}
                zoom={17}
                className="block h-[min(78dvh,36rem)] w-full border-0 bg-museum-warm"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-current/10 px-4 py-3 sm:px-5">
                <p
                  className={`max-w-xl font-sans text-xs sm:text-sm leading-relaxed ${textClass[variant]}`}
                >
                  {siteConfig.addressLine}
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 font-sans text-[11px] tracking-[0.14em] uppercase transition-colors ${linkClass[variant]}`}
                >
                  <span>Яндекс Карты</span>
                  <ArrowSquareUpRightIcon className="h-4 w-4 shrink-0" />
                </a>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <section
      className={`not-prose ${className}`.trim()}
      aria-label="Карта проезда к салону"
    >
      {heading ? (
        <p
          className={`mb-3 font-sans text-[10px] uppercase tracking-[0.2em] ${
            variant === "dark" ? "text-accent-gold/85" : "text-luxury-charcoal/50"
          }`}
        >
          {heading}
        </p>
      ) : null}

      <div
        className={`relative overflow-hidden rounded-sm border ${borderClass[variant]}`}
      >
        <MapFrame
          title={mapTitle}
          className={`block w-full border-0 ${
            compact
              ? "h-[min(280px,50vh)]"
              : "h-[min(400px,60vh)] md:h-[min(440px,65vh)]"
          }`}
        />

        <button
          type="button"
          onClick={open}
          className={`absolute bottom-3 right-3 z-[1] inline-flex min-h-10 items-center gap-2 rounded-sm border px-3 font-sans text-[10px] tracking-[0.14em] uppercase shadow-lg backdrop-blur-md transition-colors touch-manipulation ${
            variant === "dark"
              ? "border-museum-light/20 bg-luxury-base/85 text-accent-gold hover:bg-luxury-base hover:text-museum-light"
              : "border-luxury-charcoal/15 bg-museum-light/90 text-accent-brass hover:bg-museum-light hover:text-luxury-charcoal"
          }`}
        >
          <ExpandIcon className="h-3.5 w-3.5 shrink-0" />
          <span>Увеличить</span>
        </button>
      </div>

      {showAddress ? (
        <p
          className={`mt-4 flex items-start gap-2 font-sans text-sm leading-relaxed ${textClass[variant]}`}
        >
          <LocationIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-brass" />
          <span>{siteConfig.addressLine}</span>
        </p>
      ) : null}
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 min-h-11 py-2 font-sans text-xs tracking-widest uppercase transition-colors ${linkClass[variant]}`}
        >
          <span>Открыть в Яндекс Картах</span>
          <ArrowSquareUpRightIcon className="h-4 w-4 shrink-0" />
        </a>
      </p>
      {lightbox}
    </section>
  );
}
