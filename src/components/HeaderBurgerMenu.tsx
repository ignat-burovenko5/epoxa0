"use client";

import { ArrowSquareUpRightIcon } from "@/components/NavContactIcons";
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

const siteNavLinkBase =
  "block min-h-11 py-2 pl-3 font-sans text-xs tracking-wide transition-colors border-l-2 border-transparent";

const categoryLinkBase =
  "block min-h-12 py-2.5 pl-3 font-sans text-[10px] leading-snug tracking-wide uppercase transition-colors border-l-2 border-transparent";

function navLinkClass(active: boolean) {
  return `${siteNavLinkBase} ${
    active
      ? "border-accent-gold text-accent-gold"
      : "text-museum-light/70 hover:text-museum-light"
  }`;
}

export default function HeaderBurgerMenu() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    document.body.classList.toggle("catalog-nav-open", open);
    return () => document.body.classList.remove("catalog-nav-open");
  }, [open]);

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
          <div className="catalog-nav-overlay" role="presentation">
            <button
              type="button"
              className="catalog-sidenav-backdrop pointer-events-auto fixed inset-0 cursor-pointer border-0 bg-luxury-base/80 backdrop-blur-[2px] touch-manipulation"
              aria-label="Закрыть меню"
              onClick={close}
            />

            <aside
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Навигация по сайту"
              className="catalog-sidenav-panel pointer-events-auto fixed left-0 flex w-full max-w-[min(100vw,22rem)] flex-col border-r border-museum-light/10 bg-luxury-base shadow-2xl pb-[env(safe-area-inset-bottom,0px)]"
            >
              <nav
                className="catalog-sidenav-panel__nav flex-1 overflow-y-auto hidden-scrollbar px-3 py-4 space-y-8"
                aria-label="Навигация по сайту"
              >
                <div>
                  <p className="mb-2 px-3 font-sans text-[10px] tracking-[0.25em] uppercase text-museum-light/45">
                    Сайт
                  </p>
                  <ul>
                    <li>
                      <Link href="/" onClick={close} className={navLinkClass(pathname === "/")}>
                        Главная
                      </Link>
                    </li>
                    {siteConfig.navLinks.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={close}
                          className={navLinkClass(pathname === item.href)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

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
                </div>
              </nav>

              <div className="border-t border-museum-light/10 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
        className="site-header-burger relative isolate cursor-pointer flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-sm text-museum-light transition-colors hover:text-accent-gold focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 touch-manipulation"
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
