import { formatPrice } from "@/lib/catalog";
import { orderTotals, type Order } from "@/lib/order";
import { siteConfig } from "@/lib/site";

export type DeliveryMethod =
  | "showroom"
  | "moscow"
  | "russia"
  | "international";

export type PaymentPreference =
  | "card"
  | "invoice"
  | "sbp"
  | "discuss";

export const CHECKOUT_DRAFT_KEY = "epoxa-checkout-draft";

export type CheckoutDraft = {
  name: string;
  phone: string;
  email: string;
  agreePrivacy: boolean;
};

export const defaultCheckoutDraft: CheckoutDraft = {
  name: "",
  phone: "",
  email: "",
  agreePrivacy: true,
};

/** @deprecated Legacy leads may still reference these values in the dashboard. */
export const deliveryLabels: Record<DeliveryMethod, string> = {
  showroom: "Самовывоз из шоурума (Одинцово)",
  moscow: "Доставка по Москве и МО",
  russia: "Доставка по России",
  international: "Международная доставка (СНГ / ОАЭ)",
};

/** @deprecated Legacy leads may still reference these values in the dashboard. */
export const paymentLabels: Record<PaymentPreference, string> = {
  card: "Банковская карта / онлайн",
  invoice: "Счёт для юрлица",
  sbp: "СБП / SberPay",
  discuss: "Обсудить с куратором",
};

export function buildCheckoutMessage(order: Order, draft: CheckoutDraft) {
  const { subtotal, savings, itemCount } = orderTotals(order);
  const lines = order.lines
    .map((line, index) => {
      const price = formatPrice(line.price);
      const url = `${siteConfig.url}/${line.slug}`;
      return `${index + 1}. «${line.title}» — ${price}\n   ${url}`;
    })
    .join("\n");

  return [
    `Здравствуйте! Заявка с сайта ${siteConfig.name}.`,
    "",
    `Позиций: ${itemCount}`,
    lines,
    "",
    `Сумма каталога: ${formatPrice(subtotal)}`,
    savings > 0 ? `Экономия по акции: ${formatPrice(savings)}` : null,
    "",
    "— Контакты —",
    `Имя: ${draft.name.trim()}`,
    `Телефон: ${draft.phone.trim()}`,
    draft.email.trim() ? `Email: ${draft.email.trim()}` : null,
    "",
    "Прошу связаться со мной для подтверждения наличия и оформления.",
  ]
    .filter(Boolean)
    .join("\n");
}
