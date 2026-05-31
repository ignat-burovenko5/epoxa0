"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { categoryHref, siteConfig } from "@/lib/site";

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const categoryLinkBase =
  "block min-h-12 py-2.5 pl-3 font-sans text-[10px] leading-snug tracking-wide uppercase transition-colors border-l-2 border-transparent";

export default function HeaderBurgerMenu() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
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
  }, [open, close]);

  useEffect(() => {
    close();
  }, [pathname, close]);

  const menuOverlay =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <button
              type="button"
              className="absolute inset-0 cursor-pointer bg-luxury-base/80 backdrop-blur-[2px]"
              aria-label="Закрыть меню"
              tabIndex={-1}
              onClick={close}
            />

            <aside
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Категории каталога"
              className="relative z-[201] flex h-full w-full max-w-[min(100vw,22rem)] flex-col border-r border-museum-light/10 bg-luxury-base shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 border-b border-museum-light/10 px-5 py-4">
                <div>
                  <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-accent-gold/90">
                    Каталог
                  </p>
                  <p className="font-serif text-lg text-museum-light mt-0.5">Категории</p>
                </div>
                <button
                  type="button"
                  className="cursor-pointer flex h-12 w-12 items-center justify-center text-museum-light/70 transition-colors hover:text-museum-light"
                  aria-label="Закрыть"
                  onClick={close}
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto hidden-scrollbar px-3 py-4">
                <ul>
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
                                ? "border-luxury-bordeaux text-luxury-bordeaux"
                                : "border-accent-gold text-accent-gold"
                              : highlighted
                                ? "text-luxury-bordeaux/85 hover:text-luxury-bordeaux"
                                : "text-museum-light/65 hover:text-accent-gold"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="border-t border-museum-light/10 px-5 py-4">
                <Link
                  href="/collection"
                  onClick={close}
                  className="font-sans text-xs tracking-widest uppercase text-accent-gold hover:text-museum-light transition-colors"
                >
                  Смотреть весь каталог ⟶
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
        className="relative z-[110] isolate cursor-pointer flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-sm text-museum-light transition-colors hover:text-accent-gold focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 touch-manipulation"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? "Закрыть каталог" : "Открыть каталог категорий"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {open ? (
          <CloseIcon className="h-7 w-7 sm:h-8 sm:w-8 pointer-events-none" />
        ) : (
          <MenuIcon className="h-7 w-7 sm:h-8 sm:w-8 pointer-events-none" />
        )}
      </button>
      {menuOverlay}
    </>
  );
}
