export const siteConfig = {
  locale: "ru",
  name: "Эпоха",
  logo: "/logo-mark.png",
  descriptor: "Антиквариат",
  tagline: "Антиквариат",
  description:
    "Музейные антикварные предметы, винтажная мебель и коллекционные интерьерные объекты. Доставка по России и СНГ. Шоурум в Москве.",
  url: "https://levushkin.art",
  phone: "+7 (963) 780-64-30",
  phoneHref: "tel:+79637806430",
  salonEmail: "salon@epoxa.ru",
  salonEmailHref: "mailto:salon@epoxa.ru",
  whatsapp: "79637806430",
  telegram: "epoxa_gallery",
  email: "gallery@epoxa.ru",
  address: {
    city: "Одинцово",
    street: "Внуковская ул., 11с22, ТЦ «Акос», пав. 24",
    country: "RU",
  },
  addressLine:
    "Московская область, Одинцовский г.о., Одинцово, Внуковская ул., 11с22, ТЦ «Акос», пав. 24",
  addressHref: "/adres",
  currency: "RUB",
  areaServed: ["RU", "BY", "KZ", "AE"],
  workingHours:
    "пн–пт 10:00–18:30, сб 10:00–16:30, вс — выходной (осмотр по договорённости)",
  navLinks: [
    { label: "О салоне", href: "/o-salone" },
    { label: "Новости", href: "/novosti" },
    { label: "Скидки", href: "/skidki" },
    { label: "Доставка и оплата", href: "/dostavka-i-oplata" },
    { label: "Услуги", href: "/uslugi" },
    { label: "Сотрудничество", href: "/sotrudnichestvo" },
    { label: "Статьи", href: "/stati" },
    { label: "Адрес", href: "/adres" },
  ],
  catalogNavLinks: [
    { label: "Все товары", href: "/collection" },
    { label: "Акционные товары", href: "/aktsionnye-tovary" },
  ],
  categoryLinks: [
    { slug: "novye-postupleniya", label: "НОВЫЕ ПОСТУПЛЕНИЯ" },
    { slug: "bufety-gorki", label: "БУФЕТЫ, ГОРКИ" },
    { slug: "shkafy-dressuary", label: "ШКАФЫ, ДРЕССУАРЫ" },
    { slug: "vitriny-nastennye-vitrinki", label: "ВИТРИНЫ, НАСТЕННЫЕ ВИТРИНКИ" },
    { slug: "stoly-obedennye", label: "СТОЛЫ ОБЕДЕННЫЕ" },
    { slug: "stoly-pismennye-byuro", label: "СТОЛЫ ПИСЬМЕННЫЕ, БЮРО" },
    { slug: "stoly-zhurnalnye-konsolnye", label: "СТОЛЫ ЖУРНАЛЬНЫЕ, КОНСОЛЬНЫЕ" },
    { slug: "myagkaya-mebel-lavki", label: "МЯГКАЯ МЕБЕЛЬ, ЛАВКИ" },
    { slug: "stulya-kresla", label: "СТУЛЬЯ, КРЕСЛА" },
    { slug: "komody-tryumo-tumby", label: "КОМОДЫ, ТРЮМО, ТУМБЫ" },
    {
      slug: "svetilniki",
      label: "СВЕТИЛЬНИКИ (ТОРШЕРЫ, НАСТОЛЬНЫЕ ЛАМПЫ, БРА)",
    },
    { slug: "antikvarnye-lyustry", label: "АНТИКВАРНЫЕ ЛЮСТРЫ" },
    { slug: "veshalki-prihozhie-polki", label: "ВЕШАЛКИ, ПРИХОЖИЕ, ПОЛКИ" },
    {
      slug: "chasy-mekhanicheskie",
      label: "ЧАСЫ МЕХАНИЧЕСКИЕ НАПОЛЬНЫЕ, НАСТЕННЫЕ, КАМИННЫЕ",
    },
    { slug: "zerkala", label: "ЗЕРКАЛА" },
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
    { slug: "predmety-interera", label: "ПРЕДМЕТЫ ИНТЕРЬЕРА" },
    { slug: "kartiny-gobeleny-panno", label: "КАРТИНЫ, ГОБЕЛЕНЫ, ПАННО" },
    {
      slug: "pechi-kaminnye-prinadlezhnosti",
      label: "ПЕЧИ, КАМИННЫЕ ПРИНАДЛЕЖНОСТИ, ЗОЛЬНИКИ",
    },
    { slug: "antikvarnye-podarki", label: "АНТИКВАРНЫЕ ПОДАРКИ" },
    { slug: "krovati", label: "КРОВАТИ" },
    { slug: "vesennyaya-rasprodazha", label: "ВЕСЕННЯЯ РАСПРОДАЖА", highlight: true },
  ],
} as const;

export {
  homeSections,
  getHomeSection,
  infoSectionSlugs as homeSectionSlugs,
} from "@/lib/info-sections";

export function categoryHref(slug: string) {
  return `/collection/${slug}`;
}

export function categoryLabel(slug: string) {
  return siteConfig.categoryLinks.find((item) => item.slug === slug)?.label ?? slug;
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
