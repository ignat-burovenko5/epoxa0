import { getCatalogProduct } from "@/lib/catalog";
import {
  checkoutHref,
  orderHasDiscount,
  orderTotals,
  type Order,
  type OrderLine,
} from "@/lib/order-shared";

export { checkoutHref, orderHasDiscount, orderTotals };
export type { Order, OrderLine };

export function orderFromSlug(slug: string | null | undefined): Order | null {
  if (!slug?.trim()) return null;
  const product = getCatalogProduct(slug.trim());
  if (!product) return null;
  return {
    lines: [
      {
        slug: product.slug,
        title: product.title,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
      },
    ],
  };
}
