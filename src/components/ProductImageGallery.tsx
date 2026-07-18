"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type GallerySlide = {
  src: string;
  alt: string;
  priority?: boolean;
};

type ProductImageGalleryProps = {
  slides: readonly GallerySlide[];
};

/** Keep this image point under the cursor after a zoom step. */
type ZoomAnchor = {
  ratioX: number;
  ratioY: number;
  clientX: number;
  clientY: number;
};

/** Discrete zoom levels (fit → 1st zoom → 2nd zoom). Two zoom-in clicks,
 * then the next click zooms back out. Not shown in UI. */
const ZOOM_LEVELS = 3;
const DEFAULT_ZOOM = 0;

const mainImageClass =
  "left-0 right-0 top-1/2 mx-auto h-auto w-full max-w-full -translate-y-1/2 max-h-[calc(100dvh-var(--site-header-offset)-6rem)] object-contain transition-[opacity,transform] duration-500 ease-luxury-ease motion-reduce:transition-none";

const arrowButtonClass =
  "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border-2 border-luxury-charcoal/30 bg-museum-light/95 text-luxury-charcoal transition-colors hover:border-accent-brass hover:text-accent-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 touch-manipulation active:bg-museum-warm";

const lightboxArrowClass =
  "absolute top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-museum-light/25 bg-luxury-base/70 text-museum-light backdrop-blur-sm transition-colors hover:border-accent-gold/50 hover:text-accent-gold focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 touch-manipulation";

const zoomControlBtnClass =
  "flex h-9 min-w-9 items-center justify-center border border-museum-light/20 px-2 font-sans text-[10px] tracking-[0.14em] uppercase text-museum-light/75 transition-colors hover:border-accent-gold/50 hover:text-accent-gold focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 touch-manipulation disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-museum-light/20 disabled:hover:text-museum-light/75";

function GalleryArrow({
  direction,
  onClick,
  className = arrowButtonClass,
}: {
  direction: "prev" | "next";
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}) {
  const label = direction === "prev" ? "Предыдущее фото" : "Следующее фото";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`${className} ${direction === "prev" ? "left-2 sm:left-4" : "right-2 sm:right-4"}`}
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

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function captureAnchor(
  clientX: number,
  clientY: number,
  imageEl: HTMLElement,
): ZoomAnchor {
  const rect = imageEl.getBoundingClientRect();
  const width = rect.width || 1;
  const height = rect.height || 1;
  return {
    ratioX: clamp01((clientX - rect.left) / width),
    ratioY: clamp01((clientY - rect.top) / height),
    clientX,
    clientY,
  };
}

function captureViewportCenterAnchor(
  stage: HTMLElement,
  imageEl: HTMLElement,
): ZoomAnchor {
  const stageRect = stage.getBoundingClientRect();
  return captureAnchor(
    stageRect.left + stageRect.width / 2,
    stageRect.top + stageRect.height / 2,
    imageEl,
  );
}

function applyZoomAnchor(
  stage: HTMLElement,
  imageEl: HTMLElement,
  anchor: ZoomAnchor,
) {
  const stageRect = stage.getBoundingClientRect();
  const imgRect = imageEl.getBoundingClientRect();
  const pointX =
    stage.scrollLeft +
    (imgRect.left - stageRect.left) +
    anchor.ratioX * imgRect.width;
  const pointY =
    stage.scrollTop +
    (imgRect.top - stageRect.top) +
    anchor.ratioY * imgRect.height;

  stage.scrollLeft = pointX - (anchor.clientX - stageRect.left);
  stage.scrollTop = pointY - (anchor.clientY - stageRect.top);
}

function zoomWidthFor(level: number): string | undefined {
  if (level <= 0) return undefined;
  if (level === 1) return "min(160vw, 1600px)";
  return "min(240vw, 2400px)";
}

export default function ProductImageGallery({ slides }: ProductImageGalleryProps) {
  const lightboxTitleId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const touchStartX = useRef(0);
  const lightboxTouchStartX = useRef(0);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const pendingAnchorRef = useRef<ZoomAnchor | null>(null);
  const hasMultiple = slides.length > 1;
  const activeSlide = slides[activeIndex] ?? slides[0];
  const canZoomOut = zoom > 0;
  const canZoomIn = zoom < ZOOM_LEVELS - 1;
  const zoomedIn = zoom > DEFAULT_ZOOM;
  const zoomWidth = zoomWidthFor(zoom);

  const resetZoom = useCallback(() => {
    pendingAnchorRef.current = null;
    setZoom(DEFAULT_ZOOM);
  }, []);

  const zoomIn = useCallback((anchor?: ZoomAnchor | null) => {
    if (anchor) pendingAnchorRef.current = anchor;
    setZoom((current) => Math.min(current + 1, ZOOM_LEVELS - 1));
  }, []);

  const zoomOut = useCallback((anchor?: ZoomAnchor | null) => {
    if (anchor) pendingAnchorRef.current = anchor;
    setZoom((current) => Math.max(current - 1, 0));
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
    resetZoom();
  }, [slides.length, resetZoom]);

  const goNext = useCallback(() => {
    setActiveIndex((index) => (index + 1) % slides.length);
    resetZoom();
  }, [slides.length, resetZoom]);

  const openLightbox = useCallback(() => {
    resetZoom();
    setLightboxOpen(true);
  }, [resetZoom]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    resetZoom();
  }, [resetZoom]);

  const onImageClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      const imageEl = imageRef.current ?? event.currentTarget;
      const anchor = captureAnchor(event.clientX, event.clientY, imageEl);

      if (canZoomIn) {
        zoomIn(anchor);
      } else {
        resetZoom();
      }
    },
    [canZoomIn, zoomIn, resetZoom],
  );

  const onToolbarZoomIn = useCallback(() => {
    const stage = stageRef.current;
    const imageEl = imageRef.current;
    const anchor =
      stage && imageEl ? captureViewportCenterAnchor(stage, imageEl) : null;
    zoomIn(anchor);
  }, [zoomIn]);

  const onToolbarZoomOut = useCallback(() => {
    const stage = stageRef.current;
    const imageEl = imageRef.current;
    const anchor =
      stage && imageEl ? captureViewportCenterAnchor(stage, imageEl) : null;
    zoomOut(anchor);
  }, [zoomOut]);

  useEffect(() => {
    for (const slide of slides) {
      const img = new window.Image();
      img.src = slide.src;
    }
  }, [slides]);

  useLayoutEffect(() => {
    if (!lightboxOpen) return;

    const stage = stageRef.current;
    const imageEl = imageRef.current;
    if (!stage || !imageEl) return;

    if (zoom === DEFAULT_ZOOM) {
      stage.scrollLeft = 0;
      stage.scrollTop = 0;
      pendingAnchorRef.current = null;
      return;
    }

    const anchor = pendingAnchorRef.current;
    if (!anchor) return;
    pendingAnchorRef.current = null;

    // Layout after width style is applied (no CSS transition on size).
    applyZoomAnchor(stage, imageEl, anchor);
  }, [lightboxOpen, zoom, activeIndex]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        onToolbarZoomIn();
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        onToolbarZoomOut();
      } else if (hasMultiple && event.key === "ArrowLeft" && zoom === DEFAULT_ZOOM) {
        event.preventDefault();
        goPrev();
      } else if (hasMultiple && event.key === "ArrowRight" && zoom === DEFAULT_ZOOM) {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    lightboxOpen,
    hasMultiple,
    zoom,
    closeLightbox,
    goPrev,
    goNext,
    onToolbarZoomIn,
    onToolbarZoomOut,
  ]);

  useEffect(() => {
    if (lightboxOpen || !hasMultiple) return;

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
  }, [lightboxOpen, hasMultiple, goPrev, goNext]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const imageEl = imageRef.current;
      if (!imageEl) return;

      const anchor = captureAnchor(event.clientX, event.clientY, imageEl);
      if (event.deltaY < 0) {
        if (canZoomIn) zoomIn(anchor);
      } else if (canZoomOut) {
        zoomOut(anchor);
      }
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [lightboxOpen, canZoomIn, canZoomOut, zoomIn, zoomOut]);

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

  const onLightboxTouchStart = (event: React.TouchEvent) => {
    lightboxTouchStartX.current = event.touches[0]?.clientX ?? 0;
  };

  const onLightboxTouchEnd = (event: React.TouchEvent) => {
    if (!hasMultiple || zoom !== DEFAULT_ZOOM) return;
    const endX = event.changedTouches[0]?.clientX ?? 0;
    const delta = lightboxTouchStartX.current - endX;
    if (Math.abs(delta) < 48) return;
    if (delta > 0) goNext();
    else goPrev();
  };

  const lightbox =
    lightboxOpen && activeSlide && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-luxury-base/92 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby={lightboxTitleId}
            onClick={closeLightbox}
          >
            <p id={lightboxTitleId} className="sr-only">
              {activeSlide.alt}
            </p>

            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Закрыть"
              className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex h-11 w-11 items-center justify-center border border-museum-light/20 text-museum-light transition-colors hover:border-accent-gold/50 hover:text-accent-gold focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 touch-manipulation"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {hasMultiple && zoom === DEFAULT_ZOOM ? (
              <GalleryArrow
                direction="prev"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className={lightboxArrowClass}
              />
            ) : null}

            <div
              ref={stageRef}
              className="relative h-full w-full overflow-auto overscroll-contain px-4 py-20 sm:px-16"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onLightboxTouchStart}
              onTouchEnd={onLightboxTouchEnd}
            >
              <div
                className={`flex min-h-full min-w-full ${
                  zoomedIn ? "items-start justify-start" : "items-center justify-center"
                }`}
              >
                <button
                  type="button"
                  onClick={onImageClick}
                  aria-label={
                    canZoomIn
                      ? "Увеличить в точке клика"
                      : "Сбросить масштаб"
                  }
                  className={`relative block border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 ${
                    canZoomIn ? "cursor-zoom-in" : "cursor-zoom-out"
                  }`}
                  style={{
                    width: zoomWidth,
                    maxWidth: zoomedIn ? "none" : "min(100%, 1100px)",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- full-res lightbox zoom */}
                  <img
                    ref={imageRef}
                    src={activeSlide.src}
                    alt={activeSlide.alt}
                    draggable={false}
                    className="block h-auto w-full max-w-none select-none object-contain"
                    style={{
                      maxHeight: zoomedIn ? "none" : "min(78dvh, 860px)",
                    }}
                  />
                </button>
              </div>
            </div>

            {hasMultiple && zoom === DEFAULT_ZOOM ? (
              <GalleryArrow
                direction="next"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className={lightboxArrowClass}
              />
            ) : null}

            <div
              className="pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-30 flex w-[min(100%-1.5rem,28rem)] -translate-x-1/2 flex-col items-center gap-2 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              {hasMultiple ? (
                <p className="font-sans text-[10px] tabular-nums tracking-widest text-museum-light/55">
                  {activeIndex + 1} / {slides.length}
                </p>
              ) : null}

              <div
                className="flex items-center justify-center gap-1.5 rounded-sm border border-museum-light/15 bg-luxury-base/80 px-2 py-2 backdrop-blur-sm"
                role="toolbar"
                aria-label="Масштаб изображения"
              >
                <button
                  type="button"
                  className={zoomControlBtnClass}
                  onClick={onToolbarZoomOut}
                  disabled={!canZoomOut}
                  aria-label="Уменьшить"
                >
                  −
                </button>
                <button
                  type="button"
                  className={zoomControlBtnClass}
                  onClick={onToolbarZoomIn}
                  disabled={!canZoomIn}
                  aria-label="Увеличить"
                >
                  +
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

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
              <button
                key={slide.src}
                type="button"
                onClick={openLightbox}
                aria-label={`Открыть фото: ${slide.alt}`}
                tabIndex={isActive ? 0 : -1}
                className={`absolute inset-0 z-[2] m-auto flex h-full w-full max-w-full cursor-zoom-in items-center justify-center border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 ${
                  isActive ? "" : "pointer-events-none"
                }`}
              >
                <Image
                  src={slide.src}
                  alt={isActive ? slide.alt : ""}
                  aria-hidden={!isActive}
                  width={1600}
                  height={2000}
                  priority={index === 0}
                  loading="eager"
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  draggable={false}
                  className={`relative ${mainImageClass} !left-auto !right-auto !top-auto !translate-y-0 ${
                    isActive
                      ? "z-[2] opacity-100 scale-100"
                      : "z-[1] opacity-0 scale-[0.985]"
                  }`}
                />
              </button>
            );
          })}

          {hasMultiple ? (
            <p
              key={activeIndex}
              className="pointer-events-none absolute bottom-0 right-0 z-[3] font-sans text-[10px] tabular-nums tracking-widest text-luxury-charcoal/45 animate-[gallery-counter_0.35s_ease-luxury-ease_both] motion-reduce:animate-none"
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
                onClick={() => {
                  setActiveIndex(index);
                  resetZoom();
                }}
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

      {lightbox}
    </div>
  );
}
