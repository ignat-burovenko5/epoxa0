"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type GallerySlide = {
  src: string;
  alt: string;
  priority?: boolean;
};

type ProductImageGalleryProps = {
  slides: readonly GallerySlide[];
};

const mainImageClass =
  "left-0 right-0 top-1/2 mx-auto h-auto w-full max-w-full -translate-y-1/2 max-h-[calc(100dvh-var(--site-header-offset)-6rem)] object-contain transition-[opacity,transform] duration-500 ease-luxury-ease motion-reduce:transition-none";

const arrowButtonClass =
  "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border-2 border-luxury-charcoal/30 bg-museum-light/95 text-luxury-charcoal transition-colors hover:border-accent-brass hover:text-accent-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 touch-manipulation active:bg-museum-warm";

function GalleryArrow({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const label = direction === "prev" ? "Предыдущее фото" : "Следующее фото";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`${arrowButtonClass} ${direction === "prev" ? "left-2 sm:left-4" : "right-2 sm:right-4"}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
        aria-hidden
      >
        {direction === "prev" ? (
          <path d="M15 6l-6 6 6 6" strokeLinecap="square" strokeLinejoin="miter" />
        ) : (
          <path d="M9 6l6 6-6 6" strokeLinecap="square" strokeLinejoin="miter" />
        )}
      </svg>
    </button>
  );
}

export default function ProductImageGallery({ slides }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);
  const hasMultiple = slides.length > 1;

  const goPrev = useCallback(() => {
    setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goNext = useCallback(() => {
    setActiveIndex((index) => (index + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    for (const slide of slides) {
      const img = new window.Image();
      img.src = slide.src;
    }
  }, [slides]);

  useEffect(() => {
    if (!hasMultiple) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasMultiple, goPrev, goNext]);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? 0;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (!hasMultiple) return;
    const endX = event.changedTouches[0]?.clientX ?? 0;
    const delta = touchStartX.current - endX;
    if (Math.abs(delta) < 48) return;
    if (delta > 0) goNext();
    else goPrev();
  };

  return (
    <div className="w-full px-1 sm:px-2 lg:px-3 pt-4 lg:pt-6 pb-4">
      <div
        className="relative w-full min-h-[calc(100dvh-var(--site-header-offset)-7rem)]"
        aria-label="Фотографии предмета"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {hasMultiple ? <GalleryArrow direction="prev" onClick={goPrev} /> : null}

        <div className="relative flex h-full min-h-[inherit] w-full items-center justify-center overflow-hidden px-10 sm:px-12">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <Image
                key={slide.src}
                src={slide.src}
                alt={isActive ? slide.alt : ""}
                aria-hidden={!isActive}
                width={1600}
                height={2000}
                priority={index === 0}
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 70vw"
                draggable={false}
                className={`absolute ${mainImageClass} ${
                  isActive
                    ? "z-[2] opacity-100 scale-100"
                    : "z-[1] pointer-events-none opacity-0 scale-[0.985]"
                }`}
              />
            );
          })}

          {hasMultiple ? (
            <p
              key={activeIndex}
              className="absolute bottom-0 right-0 z-[3] font-sans text-[10px] tabular-nums tracking-widest text-luxury-charcoal/45 animate-[gallery-counter_0.35s_ease-luxury-ease_both] motion-reduce:animate-none"
            >
              {activeIndex + 1} / {slides.length}
            </p>
          ) : null}
        </div>

        {hasMultiple ? <GalleryArrow direction="next" onClick={goNext} /> : null}
      </div>

      {hasMultiple ? (
        <div
          className="mx-auto mt-6 grid max-w-[15rem] grid-cols-3 gap-1.5 sm:max-w-[17rem] sm:gap-2"
          role="tablist"
          aria-label="Выбор фотографии"
        >
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={slide.alt}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={slide.alt}
                onClick={() => setActiveIndex(index)}
                className={`relative h-14 w-full overflow-hidden touch-manipulation transition-opacity duration-300 ease-luxury-ease focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 motion-reduce:transition-none sm:h-16 ${
                  isActive ? "opacity-100" : "opacity-45 hover:opacity-70"
                }`}
              >
                <Image
                  src={slide.src}
                  alt=""
                  fill
                  sizes="80px"
                  loading="eager"
                  className={`object-cover transition-transform duration-500 ease-luxury-ease motion-reduce:transition-none ${
                    isActive ? "scale-100" : "scale-105"
                  }`}
                />
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 origin-center transition-transform duration-300 ease-luxury-ease motion-reduce:transition-none ${
                    isActive ? "scale-x-100 bg-accent-brass" : "scale-x-0 bg-transparent"
                  }`}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
