export const siteConfig = {
  locale: "ru",
  name: "Эпоха",
  logo: "/logo-mark.png",
  descriptor: "Антиквариат",
  tagline: "Антиквариат",
  description:
    "Антикварная мебель на продажу — купить в салоне «Эпоха»: буфеты, комоды, кресла, люстры и предметы интерьера с провенансом. Доставка по России. Шоурум в Московской области.",
  url: "https://levushkin.art",
  phone: "+7 (963) 780-64-30",
  phoneHref: "tel:+79637806430",
  salonEmail: "salon@epoxa.ru",
  salonEmailHref: "mailto:salon@epoxa.ru",
  whatsapp: "79637806430",
  telegram: "epoxa_gallery",
  /** MAX messenger (VK) — share deeplink opens MAX with prefilled text */
  maxShare: "https://max.ru/:share",
  email: "gallery@epoxa.ru",
  address: {
    city: "Одинцово",
    street: "Внуковская ул., 11с22, ТЦ «Акос», пав. 24",
    country: "RU",
  },
  addressLine:
    "Московская область, Одинцовский г.о., Одинцово, Внуковская ул., 11с22, ТЦ «Акос», пав. 24, салон «Эпоха»",
  /** WGS84 — ТЦ «Акос», Внуковская ул., 11 */
  mapCenter: { lat: 55.654955, lon: 37.281899 },
  addressHref: "/adres",
  currency: "RUB",
  areaServed: ["RU", "BY", "KZ", "AE"],
  workingHours:
    "пн–пт 10:00–18:30, сб 10:00–16:30, вс — выходной (осмотр по договорённости)",
  navLinks: [
    { label: "О «Эпохе»", href: "/o-salone" },
    { label: "Новости", href: "/novosti" },
    { label: "Акции", href: "/skidki" },
    { label: "Услуги", href: "/uslugi" },
    { label: "Партнёрам", href: "/sotrudnichestvo" },
    { label: "Статьи", href: "/stati" },
    { label: "Как нас найти", href: "/adres" },
  ],
  catalogNavLinks: [
    { label: "Все товары", href: "/collection" },
    { label: "Акционные товары", href: "/collection?sale=1" },
  ],
  /** Flat catalog — order follows categoryGroups (sorted for nav / CMS). */
  categoryLinks: [
    { slug: "novye-postupleniya", label: "НОВЫЕ ПОСТУПЛЕНИЯ" },
    { slug: "vesennyaya-rasprodazha", label: "ВЕСЕННЯЯ РАСПРОДАЖА", highlight: true },
    { slug: "bufety-gorki", label: "БУФЕТЫ, ГОРКИ" },
    { slug: "shkafy-dressuary", label: "ШКАФЫ, ДРЕССУАРЫ" },
    { slug: "vitriny-nastennye-vitrinki", label: "ВИТРИНЫ, НАСТЕННЫЕ ВИТРИНКИ" },
    { slug: "komody-tryumo-tumby", label: "КОМОДЫ, ТРЮМО, ТУМБЫ" },
    { slug: "veshalki-prihozhie-polki", label: "ВЕШАЛКИ, ПРИХОЖИЕ, ПОЛКИ" },
    { slug: "stoly-obedennye", label: "СТОЛЫ ОБЕДЕННЫЕ" },
    { slug: "stoly-pismennye-byuro", label: "СТОЛЫ ПИСЬМЕННЫЕ, БЮРО" },
    { slug: "stoly-zhurnalnye-konsolnye", label: "СТОЛЫ ЖУРНАЛЬНЫЕ, КОНСОЛЬНЫЕ" },
    { slug: "myagkaya-mebel-lavki", label: "МЯГКАЯ МЕБЕЛЬ, ЛАВКИ" },
    { slug: "stulya-kresla", label: "СТУЛЬЯ, КРЕСЛА" },
    { slug: "krovati", label: "КРОВАТИ" },
    {
      slug: "svetilniki",
      label: "СВЕТИЛЬНИКИ (ТОРШЕРЫ, НАСТОЛЬНЫЕ ЛАМПЫ, БРА)",
    },
    { slug: "antikvarnye-lyustry", label: "АНТИКВАРНЫЕ ЛЮСТРЫ" },
    { slug: "zerkala", label: "ЗЕРКАЛА" },
    {
      slug: "chasy-mekhanicheskie",
      label: "ЧАСЫ МЕХАНИЧЕСКИЕ НАПОЛЬНЫЕ, НАСТЕННЫЕ, КАМИННЫЕ",
    },
    {
      slug: "farfor-keramika",
      label: "ПРЕДМЕТЫ ИНТЕРЬЕРА ИЗ ФАРФОРА, КЕРАМИКИ",
    },
    {
      slug: "chajnye-kofejnye-servizy",
      label: "ЧАЙНЫЕ И КОФЕЙНЫЕ СЕРВИЗЫ, ПОСУДА",
    },
    { slug: "vazy-kuvshiny", label: "ВАЗЫ и КУВШИНЫ" },
    { slug: "statuetki-skulptury", label: "СТАТУЭТКИ, СКУЛЬПТУРЫ" },
    { slug: "kartiny-gobeleny-panno", label: "КАРТИНЫ, ГОБЕЛЕНЫ, ПАННО" },
    {
      slug: "pechi-kaminnye-prinadlezhnosti",
      label: "ПЕЧИ, КАМИННЫЕ ПРИНАДЛЕЖНОСТИ, ЗОЛЬНИКИ",
    },
    { slug: "predmety-interera", label: "ПРЕДМЕТЫ ИНТЕРЬЕРА" },
    { slug: "antikvarnye-podarki", label: "АНТИКВАРНЫЕ ПОДАРКИ" },
  ],
  /**
   * Burger / collection sidenav sections.
   * Slugs must exist in categoryLinks; order here is display order.
   */
  categoryGroups: [
    {
      label: "Подборка",
      slugs: ["novye-postupleniya", "vesennyaya-rasprodazha"],
    },
    {
      label: "Корпусная мебель",
      slugs: [
        "bufety-gorki",
        "shkafy-dressuary",
        "vitriny-nastennye-vitrinki",
        "komody-tryumo-tumby",
        "veshalki-prihozhie-polki",
      ],
    },
    {
      label: "Столы",
      slugs: [
        "stoly-obedennye",
        "stoly-pismennye-byuro",
        "stoly-zhurnalnye-konsolnye",
      ],
    },
    {
      label: "Сиденья",
      slugs: ["myagkaya-mebel-lavki", "stulya-kresla", "krovati"],
    },
    {
      label: "Освещение",
      slugs: ["svetilniki", "antikvarnye-lyustry"],
    },
    {
      label: "Декор и аксессуары",
      slugs: [
        "zerkala",
        "chasy-mekhanicheskie",
        "farfor-keramika",
        "chajnye-kofejnye-servizy",
        "vazy-kuvshiny",
        "statuetki-skulptury",
        "kartiny-gobeleny-panno",
        "pechi-kaminnye-prinadlezhnosti",
        "predmety-interera",
        "antikvarnye-podarki",
      ],
    },
  ],
} as const;

export type CategoryLink = (typeof siteConfig.categoryLinks)[number];

/** Catalog view of all products with compareAtPrice > price. */
export const COLLECTION_SALE_HREF = "/collection?sale=1";

export function categoryHref(slug: string) {
  return `/collection/${slug}`;
}

type CatalogQueryOpts = {
  sale?: boolean;
  sort?: string | null;
  min?: number | null;
  max?: number | null;
};

/** Build /collection or /collection/[slug] with sale + sort + price range. */
export function collectionHref(
  categorySlug?: string | null,
  opts: CatalogQueryOpts = {},
) {
  const path = categorySlug ? categoryHref(categorySlug) : "/collection";
  const params = new URLSearchParams();
  if (opts.sale) params.set("sale", "1");
  if (opts.sort && opts.sort !== "default") params.set("sort", opts.sort);
  if (opts.min != null && opts.min >= 0) params.set("min", String(opts.min));
  if (opts.max != null && opts.max >= 0) params.set("max", String(opts.max));
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function categoryLabel(slug: string) {
  return siteConfig.categoryLinks.find((item) => item.slug === slug)?.label ?? slug;
}

/** Resolve grouped categories for sidenav / burger menus. */
export function groupedCategoryLinks(): { label: string; items: CategoryLink[] }[] {
  const bySlug = new Map(
    siteConfig.categoryLinks.map((item) => [item.slug, item] as const),
  );
  return siteConfig.categoryGroups.map((group) => ({
    label: group.label,
    items: group.slugs
      .map((slug) => bySlug.get(slug))
      .filter((item): item is CategoryLink => Boolean(item)),
  }));
}

export function categorySlugFromLabel(label: string): string | null {
  const normalized = label.trim().toUpperCase();
  const match = siteConfig.categoryLinks.find(
    (item) => item.label.trim().toUpperCase() === normalized,
  );
  return match?.slug ?? null;
}

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${siteConfig.whatsapp}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function telegramUrl(message?: string) {
  const base = `https://t.me/${siteConfig.telegram}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** MAX messenger share link — https://dev.max.ru/help/deeplinks */
export function maxUrl(message?: string) {
  const base = siteConfig.maxShare;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function inquiryMessage(productName: string) {
  return `Здравствуйте! Меня интересует «${productName}». Прошу прислать описание состояния и условия доставки по России.`;
}

export function buyInquiryMessage(productName: string, priceLabel?: string) {
  const pricePart = priceLabel ? ` (${priceLabel})` : "";
  return `Здравствуйте! Хочу купить «${productName}»${pricePart}. Подтвердите, пожалуйста, наличие, итоговую сумму с доставкой и способ оплаты.`;
}

export function tradeInquiryMessage() {
  return "Здравствуйте! Хочу подать заявку в trade‑программу для дизайнеров и архитекторов. Расскажите, пожалуйста, об условиях и следующих шагах.";
}

/** Open salon location in Yandex Maps (app or web). */
export function yandexMapsUrl() {
  const text = encodeURIComponent(siteConfig.addressLine);
  return `https://yandex.ru/maps/?text=${text}&z=17&l=map`;
}

/** Interactive Yandex Maps widget (iframe, no API key). */
export function yandexMapsEmbedSrc(zoom = 16) {
  const { lon, lat } = siteConfig.mapCenter;
  const params = new URLSearchParams({
    ll: `${lon},${lat}`,
    z: String(zoom),
    pt: `${lon},${lat},pm2rdm`,
    l: "map",
    lang: "ru_RU",
  });
  return `https://yandex.ru/map-widget/v1/?${params.toString()}`;
}

/** Static map preview (works without iframe / API key). */
export function yandexStaticMapSrc(width = 650, height = 400) {
  const { lon, lat } = siteConfig.mapCenter;
  const params = new URLSearchParams({
    lang: "ru_RU",
    ll: `${lon},${lat}`,
    size: `${width},${height}`,
    z: "16",
    l: "map",
    pt: `${lon},${lat},pm2rdm`,
  });
  return `https://static-maps.yandex.ru/1.x/?${params.toString()}`;
}

/** Info page that shows the salon map widget. */
export const salonMapSectionIds = ["adres"] as const;
