import Image from "next/image";

type PaymentBadgesProps = {
  className?: string;
  variant?: "dark" | "light";
};

const paymentBadges = [
  {
    src: "/payments/pay-sbp.png",
    alt: "СБП — система быстрых платежей",
    width: 1024,
    height: 599,
    maxWidthClass: "max-w-[140px]",
  },
  {
    src: "/payments/pay-sberpay.png",
    alt: "SberPay",
    width: 1024,
    height: 512,
    maxWidthClass: "max-w-[96px]",
  },
  {
    src: "/payments/pay-alfa-pay.png",
    alt: "Alfa Pay",
    width: 427,
    height: 118,
    maxWidthClass: "max-w-[96px]",
  },
  {
    src: "/payments/pay-tinkoff.png",
    alt: "T-Pay",
    width: 1024,
    height: 425,
    maxWidthClass: "max-w-[96px]",
  },
  {
    src: "/payments/pay-yoomoney.png",
    alt: "ЮMoney",
    width: 172,
    height: 130,
    maxWidthClass: "max-w-[64px]",
  },
] as const;

function BankCardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 32"
      width={48}
      height={32}
      role="img"
      aria-label="Банковские карты"
    >
      <rect
        x="1"
        y="1"
        width="46"
        height="30"
        rx="5"
        ry="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect x="1" y="7" width="46" height="6" fill="currentColor" />
      <rect
        x="6"
        y="18"
        width="10"
        height="8"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function PaymentBadges({
  className = "",
  variant = "dark",
}: PaymentBadgesProps) {
  const onLight = variant === "light";
  const cardClass = onLight
    ? "text-luxury-charcoal/75"
    : "text-museum-light/85";
  const imageClass = onLight
    ? "payment-badge-on-light h-7 w-auto object-contain object-center"
    : "h-7 w-auto object-contain object-center";

  return (
    <div
      className={`payment-badges flex flex-wrap items-center gap-3 mt-5 ${onLight ? "payment-badges--light" : ""} ${className}`}
      aria-label="Способы оплаты"
    >
      {paymentBadges.map((badge) => (
        <span
          key={badge.src}
          className={`inline-flex items-center bg-transparent ${badge.maxWidthClass}`}
        >
          <Image
            className={`${imageClass} ${!onLight ? badge.maxWidthClass : ""}`}
            src={badge.src}
            alt={badge.alt}
            width={badge.width}
            height={badge.height}
            sizes="140px"
          />
        </span>
      ))}
      <BankCardIcon className={`h-7 w-auto max-w-[44px] ${cardClass}`} />
    </div>
  );
}
