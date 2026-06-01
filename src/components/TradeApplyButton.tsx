import { tradeInquiryMessage, whatsappUrl } from "@/lib/site";

type TradeApplyButtonProps = {
  variant?: "light" | "dark";
  className?: string;
};

const variantClass = {
  light:
    "btn-trade-apply btn-trade-apply--light border border-luxury-base/50 text-luxury-base focus-visible:outline-accent-gold-on-light/80",
  dark:
    "btn-trade-apply btn-trade-apply--dark border border-museum-light/40 text-museum-light focus-visible:outline-accent-gold/70",
} as const;

export default function TradeApplyButton({
  variant = "light",
  className = "",
}: TradeApplyButtonProps) {
  return (
    <a
      href={whatsappUrl(tradeInquiryMessage())}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative isolate inline-flex min-h-12 min-w-[12.5rem] cursor-pointer items-center justify-center overflow-hidden px-8 py-3 font-sans text-xs font-medium tracking-widest uppercase touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variantClass[variant]} ${className}`}
    >
      <span className="btn-trade-apply__label relative z-[2]">Подать заявку</span>
    </a>
  );
}
