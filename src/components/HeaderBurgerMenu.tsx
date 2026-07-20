"use client";

import CatalogSortControls from "@/components/CatalogSortControls";
import { ArrowSquareUpRightIcon } from "@/components/NavContactIcons";
import { siteChromeSurfaceClass } from "@/components/site-chrome";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { categoryHref, groupedCategoryLinks, siteConfig } from "@/lib/site";

function navLinkIsActive(
  pathname: string,
  searchParams: URLSearchParams,
  href: string,
) {
  const url = new URL(href, "http://local");
  if (pathname !== url.pathname) return false;
  if (url.searchParams.get("sale")) {
    return (
      searchParams.get("sale") === "1" || searchParams.get("sale") === "true"
    );
  }
  if (pathname === "/collection") {
    return !(
      searchParams.get("sale") === "1" || searchParams.get("sale") === "true"
    );
  }
  return true;
}

/** Keep in sync with drawer CSS duration (0.52s). */
const MENU_MS = 520;

function BurgerIcon({ open, className }: { open: boolean; className?: string }) {
  const bar =
    "absolute left-0 right-0 top-1/2 h-[1.5px] origin-center rounded-full bg-current will-change-transform";
  return (
    <span
      className={`relative block h-3.5 w-[1.125rem] sm:h-4 sm:w-5 ${className ?? ""}`.trim()}
      aria-hidden="true"
    >
      <span
        className={`${bar} transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open
            ? "translate-y-0 rotate-45"
            : "-translate-y-[6px] sm:-translate-y-[7px] rotate-0"
        }`}
      />
      <span
        className={`${bar} transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`${bar} transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open
            ? "translate-y-0 -rotate-45"
            : "translate-y-[6px] sm:translate-y-[7px] rotate-0"
        }`}
      />
    </span>
  );
}

const categoryLinkBase =
  "block min-h-11 rounded-sm py-2.5 pl-3.5 pr-3 font-sans text-[11px] leading-snug tracking-[0.1em] uppercase border-l-2 transition-colors duration-300 select-text";

const groupLabelClass =
  "mb-2 px-1 font-sans text-[10px] tracking-[0.2em] uppercase text-museum-light/40";

export default function HeaderBurgerMenu() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const groups = useMemo(() => groupedCategoryLinks(), []);
  const openTimerRef = useRef<number | null>(null);
  const unmountTimerRef = useRef<number | null>(null);
  const prevPathRef = useRef(pathname);
  /** True after the panel has been open at least once in this mount cycle. */
  const hadOpenRef = useRef(false);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current != null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const clearUnmountTimer = useCallback(() => {
    if (unmountTimerRef.current != null) {
      window.clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = null;
    }
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const show = useCallback(() => {
    clearOpenTimer();
    clearUnmountTimer();
    setMounted(true);
    // Paint closed frame, then open so transform transition runs.
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      setOpen(true);
    }, 24);
  }, [clearOpenTimer, clearUnmountTimer]);

  useEffect(
    () => () => {
      clearOpenTimer();
      clearUnmountTimer();
    },
    [clearOpenTimer, clearUnmountTimer],
  );

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
    if (open) {
      hadOpenRef.current = true;
      clearUnmountTimer();
      return;
    }
    // Only unmount after a real close — never on the initial mounted/closed frame
    // (that used to clear the open timer and kill the sidenav).
    if (!mounted || !hadOpenRef.current) return;

    clearUnmountTimer();
    unmountTimerRef.current = window.setTimeout(() => {
      unmountTimerRef.current = null;
      hadOpenRef.current = false;
      setMounted(false);
    }, MENU_MS);

    return () => clearUnmountTimer();
  }, [mounted, open, clearUnmountTimer]);

  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;
    close();
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
              className="catalog-sidenav-backdrop pointer-events-auto fixed inset-0 cursor-pointer border-0 bg-luxury-base/45 touch-manipulation"
              aria-label="Закрыть меню"
              onClick={close}
            />

            <aside
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Навигация по сайту"
              className={`catalog-sidenav-panel pointer-events-auto fixed left-0 flex w-full max-w-[min(100vw,22rem)] flex-col border-r ${siteChromeSurfaceClass} pb-[env(safe-area-inset-bottom,0px)]`}
            >
              <nav
                className="catalog-sidenav-panel__nav collection-category-scroll flex-1 overflow-y-auto overscroll-y-contain px-5 py-6"
                aria-label="Навигация по сайту"
              >
                <header className="mb-6 px-1">
                  <h2 className="font-serif text-[1.5rem] leading-none tracking-tight text-museum-light select-text">
                    Каталог
                  </h2>
                  <span
                    className="mt-3 block h-px w-11 bg-gradient-to-r from-accent-gold to-accent-gold/0"
                    aria-hidden="true"
                  />
                </header>

                <div className="flex flex-col gap-7">
                  <CatalogSortControls variant="burger" />
                  {groups.map((group, groupIndex) => {
                    const isFeatured = groupIndex === 0;
                    return (
                      <div key={group.label}>
                        <p className={groupLabelClass}>
                          {isFeatured ? "Подборка" : group.label}
                        </p>
                        <ul className="m-0 flex list-none flex-col gap-1 p-0">
                          {isFeatured
                            ? siteConfig.catalogNavLinks.map((item) => {
                                const active = navLinkIsActive(
                                  pathname,
                                  searchParams,
                                  item.href,
                                );
                                return (
                                  <li key={item.href}>
                                    <Link
                                      href={item.href}
                                      onClick={close}
                                      className={`${categoryLinkBase} ${
                                        active
                                          ? "border-accent-gold bg-accent-gold/10 text-accent-gold"
                                          : "border-transparent text-museum-light/60 hover:bg-museum-light/[0.04] hover:text-accent-gold"
                                      }`}
                                    >
                                      {item.label}
                                    </Link>
                                  </li>
                                );
                              })
                            : null}
                          {group.items.map((item) => {
                            const active = pathname === categoryHref(item.slug);
                            const highlighted =
                              "highlight" in item && item.highlight;

                            return (
                              <li key={item.slug}>
                                <Link
                                  href={categoryHref(item.slug)}
                                  onClick={close}
                                  className={`${categoryLinkBase} ${
                                    active
                                      ? highlighted
                                        ? "border-[#E8A6AB] bg-[#E8A6AB]/10 text-[#F5C7CA]"
                                        : "border-accent-gold bg-accent-gold/10 text-accent-gold"
                                      : highlighted
                                        ? "border-transparent text-[#E8A6AB]/80 hover:bg-[#E8A6AB]/[0.06] hover:text-[#F5C7CA]"
                                        : "border-transparent text-museum-light/50 hover:bg-museum-light/[0.04] hover:text-museum-light/85"
                                  }`}
                                >
                                  <span className="line-clamp-2">{item.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
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
        className="site-header-burger relative isolate cursor-pointer flex h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-sm text-museum-light transition-colors duration-300 hover:text-accent-gold focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 touch-manipulation"
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
