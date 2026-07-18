"use client";

import { ArrowSquareUpRightIcon } from "@/components/NavContactIcons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { categoryHref, siteConfig } from "@/lib/site";

const menuTransitionMs = 420;

function BurgerIcon({ open, className }: { open: boolean; className?: string }) {
  const bar =
    "absolute inset-x-0 h-[1.5px] -translate-y-1/2 rounded-full bg-current transition-[transform,opacity,top] duration-300 ease-luxury-ease";
  return (
    <span
      className={`relative block h-5 w-4 sm:h-6 sm:w-5 ${className ?? ""}`.trim()}
      aria-hidden="true"
    >
      <span
        className={`${bar} ${open ? "top-1/2 rotate-45" : "top-1/4"}`}
      />
      <span
        className={`${bar} top-1/2 ${
          open ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
        }`}
      />
      <span
        className={`${bar} ${open ? "top-1/2 -rotate-45" : "top-3/4"}`}
      />
    </span>
  );
}

const categoryLinkBase =
  "block min-h-12 py-2.5 pl-3 font-sans text-[10px] leading-snug tracking-wide uppercase transition-colors border-l-2 border-transparent";

export default function HeaderBurgerMenu() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);
  const show = useCallback(() => {
    setMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setOpen(true));
    });
  }, []);

  useEffect(() => {
    document.body.classList.toggle("catalog-nav-open", mounted);
    return () => document.body.classList.remove("catalog-nav-open");
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
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
  }, [mounted, close]);

  useEffect(() => {
    if (!mounted || open) return;
    const timeout = window.setTimeout(() => setMounted(false), menuTransitionMs);
    return () => window.clearTimeout(timeout);
  }, [mounted, open]);

  useEffect(() => {
    const frame = requestAnimationFrame(close);
    return () => cancelAnimationFrame(frame);
  }, [pathname, close]);

  const menuOverlay =
    mounted && typeof document !== "undefined"
      ? createPortal(
          <div
            className="catalog-nav-overlay"
            data-state={open ? "open" : "closed"}
            role="presentation"
          >
            <button
              type="button"
              className="catalog-sidenav-backdrop pointer-events-auto fixed inset-0 cursor-pointer border-0 bg-luxury-base/80 touch-manipulation"
              aria-label="Закрыть меню"
              onClick={close}
            />

            <aside
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Навигация по сайту"
              className="catalog-sidenav-panel pointer-events-auto fixed left-0 flex w-full max-w-[min(100vw,22rem)] flex-col bg-luxury-base max-md:backdrop-blur-none md:bg-luxury-base/95 md:backdrop-blur-md md:supports-[backdrop-filter]:bg-luxury-base/90 pb-[env(safe-area-inset-bottom,0px)]"
            >
              <nav
                className="catalog-sidenav-panel__nav flex-1 overflow-y-auto hidden-scrollbar px-3 py-4 space-y-8"
                aria-label="Навигация по сайту"
              >
                <div>
                  <p className="mb-2 px-3 font-sans text-[10px] tracking-[0.25em] uppercase text-museum-light/45">
                    Каталог
                  </p>
                  <ul>
                    {siteConfig.catalogNavLinks.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={close}
                          className={`${categoryLinkBase} ${
                            pathname === item.href
                              ? "border-accent-gold text-accent-gold"
                              : "text-museum-light/65 hover:text-accent-gold"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/collection"
                        onClick={close}
                        className={`${categoryLinkBase} ${
                          pathname === "/collection"
                            ? "border-accent-gold text-accent-gold"
                            : "text-museum-light/65 hover:text-accent-gold"
                        }`}
                      >
                        Все категории
                      </Link>
                    </li>
                    {siteConfig.categoryLinks.map((item) => {
                    const active = pathname === categoryHref(item.slug);
                    const highlighted = "highlight" in item && item.highlight;

                    return (
                      <li key={item.slug}>
                        <Link
                          href={categoryHref(item.slug)}
                          onClick={close}
                          className={`${categoryLinkBase} ${
                            active
                              ? highlighted
                                ? "border-[#E8A6AB] text-[#F5C7CA]"
                                : "border-accent-gold text-accent-gold"
                              : highlighted
                                ? "text-[#E8A6AB] hover:text-[#F5C7CA]"
                                : "text-museum-light/65 hover:text-accent-gold"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                  </ul>
                </div>
              </nav>

              <div className="border-t border-museum-light/5 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <Link
                  href="/collection"
                  onClick={close}
                  className="inline-flex items-center gap-2 font-sans text-xs tracking-widest uppercase text-accent-gold hover:text-museum-light transition-colors"
                >
                  <span>Смотреть весь каталог</span>
                  <ArrowSquareUpRightIcon className="h-4 w-4 shrink-0" />
                </Link>
              </div>
            </aside>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        className="site-header-burger relative isolate cursor-pointer flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-sm text-museum-light transition-colors hover:text-accent-gold focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 touch-manipulation"
        aria-expanded={open}
        aria-controls={mounted ? panelId : undefined}
        aria-label={open ? "Закрыть каталог" : "Открыть каталог категорий"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (open) close();
          else show();
        }}
      >
        <BurgerIcon open={open} className="pointer-events-none" />
      </button>
      {menuOverlay}
    </>
  );
}
