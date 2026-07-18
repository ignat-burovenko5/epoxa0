"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PhoneInput from "@/components/PhoneInput";
import {
  buildCheckoutMessage,
  CHECKOUT_DRAFT_KEY,
  defaultCheckoutDraft,
  type CheckoutDraft,
} from "@/lib/checkout";
import { trackEvent } from "@/lib/analytics/track";
import { orderTotals, type Order } from "@/lib/order-shared";
import { formatRuPhone, isValidRuPhone } from "@/lib/phone";
import { siteConfig, whatsappUrl } from "@/lib/site";

const inputClass =
  "cart-field w-full min-h-12 border border-luxury-charcoal/15 bg-museum-light px-4 font-sans text-sm text-luxury-charcoal placeholder:text-luxury-charcoal/35 transition-colors focus:border-accent-brass/60 focus:outline-none focus:ring-1 focus:ring-accent-brass/30";

const labelClass =
  "block font-sans text-[10px] uppercase tracking-[0.14em] text-luxury-charcoal/55 mb-1.5";

function loadDraft(): CheckoutDraft {
  if (typeof window === "undefined") return defaultCheckoutDraft;
  try {
    const raw = localStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (!raw) return defaultCheckoutDraft;
    const parsed = { ...defaultCheckoutDraft, ...JSON.parse(raw) } as CheckoutDraft;
    if (parsed.phone) {
      parsed.phone = formatRuPhone(parsed.phone);
    }
    return parsed;
  } catch {
    return defaultCheckoutDraft;
  }
}

type CheckoutFormProps = {
  order: Order;
  backHref: string;
};

export default function CheckoutForm({ order, backHref }: CheckoutFormProps) {
  const router = useRouter();
  const { subtotal, itemCount } = orderTotals(order);
  const [draft, setDraft] = useState<CheckoutDraft>(defaultCheckoutDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setDraft(loadDraft());
    try {
      if (sessionStorage.getItem("sa-checkout-start")) return;
      sessionStorage.setItem("sa-checkout-start", "1");
    } catch {
      /* ignore */
    }
    trackEvent("checkout_start", { itemCount, slug: order.lines[0]?.slug ?? "" });
  }, [itemCount, order.lines]);

  useEffect(() => {
    try {
      localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [draft]);

  const update = useCallback(
    <K extends keyof CheckoutDraft>(key: K, value: CheckoutDraft[K]) => {
      setDraft((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    },
    [],
  );

  const validate = () => {
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next.name = "Укажите, как к вам обращаться";
    if (!isValidRuPhone(draft.phone)) {
      next.phone = "Укажите номер полностью: +7 (___) ___-__-__";
    }
    if (!draft.agreePrivacy) {
      next.agreePrivacy = "Необходимо согласие с политикой";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    const message = buildCheckoutMessage(order, draft);
    const href = whatsappUrl(message);

    void fetch("/api/shop/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        phone: draft.phone,
        email: draft.email,
        subtotal,
        lines: order.lines.map((line) => ({
          slug: line.slug,
          title: line.title,
          price: line.price,
        })),
      }),
      keepalive: true,
    }).catch(() => {
      /* WhatsApp still opens if API fails */
    });

    trackEvent("checkout_submit", { itemCount, subtotal });
    window.open(href, "_blank", "noopener,noreferrer");
    router.push("/checkout?sent=1");
  };

  return (
    <form
      className="checkout-form"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-50/80 px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.12em] text-emerald-900/80">
        <span className="cart-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
        Без регистрации · куратор свяжется с вами
      </p>

      <div className="space-y-4 animate-[cart-fade-in_0.35s_ease]">
        <div>
          <label htmlFor="checkout-name" className={labelClass}>
            Имя <span className="text-luxury-bordeaux">*</span>
          </label>
          <input
            id="checkout-name"
            className={inputClass}
            autoComplete="name"
            value={draft.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Как к вам обращаться"
          />
          {errors.name ? (
            <p className="mt-1 font-sans text-xs text-luxury-bordeaux">{errors.name}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="checkout-phone" className={labelClass}>
            Телефон / WhatsApp <span className="text-luxury-bordeaux">*</span>
          </label>
          <PhoneInput
            id="checkout-phone"
            className={inputClass}
            value={draft.phone}
            onChange={(phone) => update("phone", phone)}
          />
          {errors.phone ? (
            <p className="mt-1 font-sans text-xs text-luxury-bordeaux">{errors.phone}</p>
          ) : (
            <p className="mt-1 font-sans text-[10px] text-luxury-charcoal/45">
              Для звонка или сообщения в WhatsApp
            </p>
          )}
        </div>
        <div>
          <label htmlFor="checkout-email" className={labelClass}>
            Email
          </label>
          <input
            id="checkout-email"
            type="email"
            className={inputClass}
            autoComplete="email"
            value={draft.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="Для счёта и переписки"
          />
        </div>
      </div>

      <label className="mt-6 flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={draft.agreePrivacy}
          onChange={(e) => update("agreePrivacy", e.target.checked)}
          className="mt-1 h-4 w-4 accent-luxury-bordeaux"
        />
        <span className="font-sans text-xs text-luxury-charcoal/65 leading-relaxed">
          Согласен с{" "}
          <Link
            href="/politika-konfidentsialnosti"
            className="underline hover:text-luxury-bordeaux"
          >
            политикой конфиденциальности
          </Link>{" "}
          и обработкой контактных данных
        </span>
      </label>
      {errors.agreePrivacy ? (
        <p className="mt-1 font-sans text-xs text-luxury-bordeaux">{errors.agreePrivacy}</p>
      ) : null}

      <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
        <Link
          href={backHref}
          className="flex-1 min-h-12 flex items-center justify-center border border-luxury-charcoal/15 font-sans text-xs uppercase tracking-[0.12em] text-luxury-charcoal/70 hover:bg-museum-warm transition-colors"
        >
          К товару
        </Link>
        <button
          type="submit"
          className="btn-buy-primary relative z-0 flex-[2] flex min-h-14 items-center justify-center font-sans text-sm font-semibold uppercase text-museum-light touch-manipulation"
        >
          <span className="relative z-[2] pointer-events-none">Отправить в WhatsApp</span>
        </button>
      </div>

      <p className="mt-4 text-center font-sans text-[10px] text-luxury-charcoal/45 leading-relaxed">
        Нажимая кнопку, вы переходите в WhatsApp с готовой заявкой. Куратор {siteConfig.name}{" "}
        свяжется с вами и уточнит доставку и оплату.
      </p>
    </form>
  );
}
