import { formatPrice } from "@/lib/catalog";
import {
  buyInquiryMessage,
  inquiryMessage,
  siteConfig,
  telegramUrl,
  whatsappUrl,
} from "@/lib/site";

type ProductPurchaseCtasProps = {
  productName: string;
  price: number;
  variant?: "inline" | "sticky";
  className?: string;
};

const secondaryLinkClass =
  "inline-flex min-h-11 items-center justify-center border border-luxury-charcoal/15 bg-museum-light px-2 py-2.5 font-sans text-[10px] sm:text-xs tracking-[0.1em] uppercase text-luxury-charcoal/80 transition-colors hover:border-luxury-charcoal/30 hover:bg-museum-warm hover:text-luxury-base focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent-gold/70 touch-manipulation";

export default function ProductPurchaseCtas({
  productName,
  price,
  variant = "inline",
  className = "",
}: ProductPurchaseCtasProps) {
  const priceLabel = formatPrice(price);
  const buyHref = whatsappUrl(buyInquiryMessage(productName, priceLabel));
  const inquiryHref = whatsappUrl(inquiryMessage(productName));
  const telegramHref = telegramUrl(inquiryMessage(productName));
  const isSticky = variant === "sticky";

  return (
    <div className={className}>
      <a
        href={buyHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn-buy-primary group relative flex w-full flex-col items-center justify-center gap-0.5 px-5 text-museum-light transition-[transform,box-shadow,background-color] duration-300 ease-luxury-ease hover:bg-[#5c2428] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxury-bordeaux touch-manipulation ${
          isSticky ? "min-h-14 py-3.5" : "min-h-[3.75rem] py-4 md:min-h-[4rem] md:py-5"
        }`}
      >
        <span className="flex items-center gap-2 font-sans text-sm sm:text-base font-semibold tracking-[0.16em] uppercase">
          Купить
          <span
            aria-hidden="true"
            className="text-base transition-transform duration-300 group-hover:translate-x-0.5"
          >
            ⟶
          </span>
        </span>
        <span className="font-sans text-[11px] sm:text-xs font-normal tracking-wide text-museum-light/85">
          {priceLabel}
        </span>
      </a>

      {!isSticky ? (
        <p className="mt-2 text-center font-sans text-[10px] tracking-wide text-luxury-charcoal/50">
          Ответ куратора в WhatsApp за несколько минут
        </p>
      ) : null}

      <div
        className={`grid grid-cols-3 gap-2 ${isSticky ? "mt-2 border-t border-luxury-charcoal/10 pt-2" : "mt-3"}`}
        role="group"
        aria-label="Другие способы связи"
      >
        <a
          href={inquiryHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Написать в WhatsApp"
          className={secondaryLinkClass}
        >
          WhatsApp
        </a>
        <a
          href={telegramHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Написать в Telegram"
          className={secondaryLinkClass}
        >
          Telegram
        </a>
        <a
          href={siteConfig.phoneHref}
          aria-label="Позвонить куратору"
          className={secondaryLinkClass}
        >
          {isSticky ? "Звонок" : "Позвонить"}
        </a>
      </div>
    </div>
  );
}
