import Link from "next/link";
import ProductPrice from "@/components/ProductPrice";
import { formatPrice } from "@/lib/catalog-shared";
import { orderHasDiscount, orderTotals, type Order } from "@/lib/order-shared";

type OrderSummaryProps = {
  order: Order;
  compact?: boolean;
};

export default function OrderSummary({ order, compact = false }: OrderSummaryProps) {
  const { subtotal, savings, itemCount } = orderTotals(order);
  const line = order.lines[0];

  return (
    <div>
      {line ? (
        <div className={compact ? "mb-4" : "mb-5"}>
          <Link
            href={`/${line.slug}`}
            className="font-serif text-lg leading-snug text-luxury-charcoal hover:text-luxury-bordeaux transition-colors"
          >
            {line.title}
          </Link>
          <p className="mt-2">
            <ProductPrice
              price={line.price}
              compareAtPrice={line.compareAtPrice}
              size="sm"
            />
          </p>
        </div>
      ) : null}

      <div className={`space-y-2 ${compact ? "text-sm" : ""}`}>
        <div className="flex justify-between font-sans text-luxury-charcoal/70">
          <span>{itemCount === 1 ? "1 позиция" : `${itemCount} позиции`}</span>
          <span className="tabular-nums">{formatPrice(subtotal)}</span>
        </div>
        {savings > 0 ? (
          <div className="flex justify-between font-sans text-emerald-800/90">
            <span>Ваша выгода</span>
            <span className="tabular-nums font-medium">−{formatPrice(savings)}</span>
          </div>
        ) : null}
        <div className="flex justify-between font-sans text-luxury-charcoal/55 text-xs">
          <span>Доставка</span>
          <span>Расчёт после заявки</span>
        </div>
      </div>

      <div
        className={`border-t border-luxury-charcoal/10 ${compact ? "mt-4 pt-4" : "mt-5 pt-5"}`}
      >
        <div className="flex justify-between items-baseline gap-4">
          <span className="font-sans text-xs uppercase tracking-[0.14em] text-luxury-charcoal/60">
            К оплате
          </span>
          <span className="font-serif text-2xl text-luxury-charcoal tabular-nums">
            {formatPrice(subtotal)}
          </span>
        </div>
        <p className="mt-1 font-sans text-[10px] text-luxury-charcoal/45 tracking-wide">
          Итог с доставкой — в ответе куратора
        </p>
      </div>

      {orderHasDiscount(order) ? (
        <p className="mt-3 font-sans text-[10px] uppercase tracking-widest text-luxury-bordeaux/80">
          Акционная цена закрепляется при подтверждении
        </p>
      ) : null}
    </div>
  );
}
