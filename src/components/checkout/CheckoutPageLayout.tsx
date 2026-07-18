import type { ReactNode } from "react";
import Link from "next/link";
import FloatingConcierge from "@/components/FloatingConcierge";
import TrustStrip from "@/components/TrustStrip";

type CheckoutPageLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  sidebar: ReactNode;
  productHref?: string;
  productTitle?: string;
};

export default function CheckoutPageLayout({
  title,
  subtitle,
  children,
  sidebar,
  productHref,
  productTitle,
}: CheckoutPageLayoutProps) {
  return (
    <main className="bg-museum-light text-luxury-charcoal min-h-screen pb-[max(6rem,calc(4rem+env(safe-area-inset-bottom)))] lg:pb-16 -mt-[var(--site-header-offset)] pt-[var(--site-header-offset)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <nav className="mb-6 font-sans text-[10px] uppercase tracking-[0.14em] text-luxury-charcoal/45">
          <Link href="/" className="hover:text-accent-brass transition-colors">
            Главная
          </Link>
          <span className="mx-2 opacity-40">/</span>
          {productHref && productTitle ? (
            <>
              <Link
                href={productHref}
                className="hover:text-accent-brass transition-colors"
              >
                {productTitle}
              </Link>
              <span className="mx-2 opacity-40">/</span>
            </>
          ) : null}
          <span className="text-luxury-charcoal/70">{title}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem] gap-10 lg:gap-14 items-start">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-2">
              {title}
            </h1>
            {subtitle ? (
              <p className="font-sans text-sm text-luxury-charcoal/60 mb-6 max-w-xl">
                {subtitle}
              </p>
            ) : null}
            <p className="mb-8 max-w-2xl border border-accent-brass/25 bg-accent-brass/8 px-4 py-3 font-sans text-xs leading-relaxed text-luxury-charcoal/65">
              Резерв на 24 часа после отправки заявки. Куратор ответит в WhatsApp
              за несколько минут.
            </p>
            {children}
          </div>
          <aside className="lg:sticky lg:top-[calc(var(--site-header-offset)+1rem)] space-y-6">
            <div className="border border-luxury-charcoal/10 bg-museum-warm/40 p-5 md:p-6">
              {sidebar}
            </div>
            <TrustStrip variant="light" />
          </aside>
        </div>
      </div>
      <FloatingConcierge />
    </main>
  );
}
