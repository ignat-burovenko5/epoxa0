import {
  formatPrice,
  getDiscountPercent,
  hasDiscount,
} from "@/lib/catalog-shared";

type ProductPriceProps = {
  price: number;
  compareAtPrice?: number;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  showDiscountBadge?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: {
    price: "text-[20px] md:text-[22px]",
    compare: "text-sm",
    badge: "text-[10px] px-2 py-0.5",
  },
  md: {
    price: "text-[22px] md:text-[24px]",
    compare: "text-sm md:text-base",
    badge: "text-[10px] px-2.5 py-1",
  },
  lg: {
    price: "text-[28px] md:text-[34px]",
    compare: "text-base md:text-lg",
    badge: "text-xs px-2.5 py-1",
  },
} as const;

export default function ProductPrice({
  price,
  compareAtPrice,
  variant = "dark",
  size = "md",
  showDiscountBadge = true,
  className = "",
}: ProductPriceProps) {
  const discounted = hasDiscount(price, compareAtPrice);
  const discountPercent = getDiscountPercent(price, compareAtPrice);
  const styles = sizeClasses[size];

  const priceColor =
    variant === "light" ? "text-museum-light" : "text-luxury-base";
  const compareColor =
    variant === "light" ? "text-museum-light/45" : "text-luxury-charcoal/45";

  return (
    <div className={`flex flex-wrap items-baseline gap-x-2.5 gap-y-1 ${className}`}>
      <span className={`font-serif ${styles.price} ${priceColor}`}>
        {formatPrice(price)}
      </span>
      {discounted && compareAtPrice ? (
        <>
          <span
            className={`font-sans ${styles.compare} line-through ${compareColor}`}
          >
            {formatPrice(compareAtPrice)}
          </span>
          {showDiscountBadge && discountPercent ? (
            <span
              className={`font-sans uppercase tracking-widest bg-luxury-bordeaux text-museum-light ${styles.badge}`}
            >
              −{discountPercent}%
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
