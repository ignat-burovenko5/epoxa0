import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Оформление заказа — купить антикварную мебель",
  description:
    "Оформление заявки на покупку антикварной мебели. Без регистрации: куратор подтвердит наличие, сумму с доставкой и оплату.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
