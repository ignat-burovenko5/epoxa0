/**
 * Pure order helpers and types — safe to import from client components.
 * Keep this module free of `node:fs` and any server-only I/O.
 */
import { getDiscountPercent } from "@/lib/catalog-shared";

export type OrderLine = {
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number;
};

export type Order = {
  lines: OrderLine[];
};

export function checkoutHref(slug: string) {
  return `/checkout?slug=${encodeURIComponent(slug)}`;
}

export function orderTotals(order: Order) {
  const subtotal = order.lines.reduce((sum, line) => sum + line.price, 0);
  const referenceTotal = order.lines.reduce(
    (sum, line) =>
      sum +
      (line.compareAtPrice && line.compareAtPrice > line.price
        ? line.compareAtPrice
        : line.price),
    0,
  );
  const savings = Math.max(0, referenceTotal - subtotal);
  const itemCount = order.lines.length;

  return { subtotal, referenceTotal, savings, itemCount };
}

export function orderHasDiscount(order: Order) {
  return order.lines.some((line) =>
    getDiscountPercent(line.price, line.compareAtPrice),
  );
}
