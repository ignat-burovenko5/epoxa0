import { formatPrice } from "@/lib/catalog";
import { buyInquiryMessage, whatsappUrl } from "@/lib/site";

type ProductBuyButtonProps = {
  productName: string;
  price: number;
  className?: string;
};

export default function ProductBuyButton({
  productName,
  price,
  className = "",
}: ProductBuyButtonProps) {
  const priceLabel = formatPrice(price);
  const buyHref = whatsappUrl(buyInquiryMessage(productName, priceLabel));

  return (
    <a
      href={buyHref}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-buy-primary flex w-full min-h-11 items-center justify-center px-4 py-2.5 font-sans text-xs font-semibold uppercase text-museum-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-luxury-bordeaux touch-manipulation sm:text-sm ${className}`}
    >
      <span className="relative z-[1]">Купить</span>
    </a>
  );
}
