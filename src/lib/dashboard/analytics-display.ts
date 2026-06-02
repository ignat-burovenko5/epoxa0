import type { AnalyticsDailyPoint } from "@/lib/dashboard/overview";

const PATH_TITLES: Record<string, string> = {
  "/": "Главная",
  "/collection": "Каталог",
  "/cart": "Корзина",
  "/checkout": "Оформление заказа",
  "/blog": "Блог",
};

export function friendlyPath(path: string): string {
  const normalized = path?.trim() || "/";
  if (PATH_TITLES[normalized]) return PATH_TITLES[normalized];
  if (normalized.startsWith("/collection/")) {
    const slug = decodeURIComponent(normalized.slice("/collection/".length));
    return `Каталог: ${slug.replace(/-/g, " ")}`;
  }
  if (normalized.startsWith("/blog/")) {
    return `Блог: ${normalized.slice("/blog/".length)}`;
  }
  return normalized;
}

export function formatAnalyticsDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatPeriodRange(from: string, to: string): string {
  const fmt = (key: string) => {
    const [y, m, d] = key.split("-");
    if (!d) return key;
    return `${d}.${m}.${y?.slice(2) ?? ""}`;
  };
  if (from === to) return fmt(from);
  return `${fmt(from)} — ${fmt(to)}`;
}

export function pct(part: number, whole: number): string {
  if (whole <= 0 || part <= 0) return "0%";
  return `${Math.round((part / whole) * 1000) / 10}%`;
}

export type FunnelStep = {
  key: string;
  label: string;
  description: string;
  value: number;
  rateLabel?: string;
};

export function buildFunnelSteps(metrics: {
  pageViews: number;
  cartAdds: number;
  cartViews: number;
  checkoutStarts: number;
  checkoutSubmits: number;
}): FunnelStep[] {
  const { pageViews, cartAdds, cartViews, checkoutStarts, checkoutSubmits } = metrics;
  return [
    {
      key: "pageViews",
      label: "Просмотры страниц",
      description: "Сколько раз посетители открывали страницы сайта",
      value: pageViews,
    },
    {
      key: "cartAdds",
      label: "Добавили в корзину",
      description: "Нажали «в корзину» на карточке товара",
      value: cartAdds,
      rateLabel: pct(cartAdds, pageViews),
    },
    {
      key: "cartViews",
      label: "Открыли корзину",
      description: "Перешли на страницу корзины",
      value: cartViews,
      rateLabel: pct(cartViews, pageViews),
    },
    {
      key: "checkoutStarts",
      label: "Начали оформление",
      description: "Открыли форму заказа",
      value: checkoutStarts,
      rateLabel: pct(checkoutStarts, pageViews),
    },
    {
      key: "checkoutSubmits",
      label: "Заявки в WhatsApp",
      description: "Отправили заявку из оформления",
      value: checkoutSubmits,
      rateLabel: pct(checkoutSubmits, pageViews),
    },
  ];
}

export function dailyPageViewMax(series: AnalyticsDailyPoint[]): number {
  return Math.max(1, ...series.map((d) => d.pageViews));
}

export function hourlyViewMax(
  series: { views: number }[],
): number {
  return Math.max(1, ...series.map((h) => h.views));
}

export const EVENT_LABELS: Record<string, string> = {
  page_view: "Просмотр страницы",
  cart_add: "В корзину",
  cart_view: "Корзина",
  checkout_start: "Оформление",
  checkout_submit: "Заявка в WhatsApp",
};
