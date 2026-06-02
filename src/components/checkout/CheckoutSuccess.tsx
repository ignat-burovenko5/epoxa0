"use client";

import Link from "next/link";
import { siteConfig, whatsappUrl } from "@/lib/site";

export default function CheckoutSuccess() {
  return (
    <div className="max-w-lg mx-auto text-center py-16 px-4">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent-brass/40 text-accent-brass text-2xl mb-6">
        ✓
      </div>
      <h1 className="font-serif text-3xl md:text-4xl mb-3">Заявка отправлена</h1>
      <p className="font-sans text-sm text-luxury-charcoal/65 leading-relaxed mb-8">
        Откройте WhatsApp и отправьте сообщение куратору — так мы быстрее
        закрепим резерв. Если окно не открылось, нажмите кнопку ниже.
      </p>
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-buy-primary inline-flex min-h-14 items-center justify-center px-10 font-sans text-sm font-semibold uppercase text-museum-light mb-4"
      >
        <span className="relative z-[1]">Открыть WhatsApp</span>
      </a>
      <p className="font-sans text-[10px] text-luxury-charcoal/45 mb-8">
        {siteConfig.phone} · ответ обычно за 5–15 минут в рабочее время
      </p>
      <Link
        href="/collection"
        className="font-sans text-xs uppercase tracking-[0.14em] text-accent-brass hover:text-luxury-bordeaux transition-colors"
      >
        Вернуться в каталог
      </Link>
    </div>
  );
}
