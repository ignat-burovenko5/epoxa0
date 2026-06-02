import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Корзина — оформить покупку антикварной мебели",
  description:
    "Корзина с выбранными предметами антикварной мебели. Резерв на 24 часа, консультация куратора и доставка по России.",
  path: "/cart",
  noIndex: true,
});

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
