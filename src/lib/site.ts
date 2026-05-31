export const siteConfig = {
  locale: "ru",
  name: "Эпоха",
  logo: "/logo.svg",
  descriptor: "Антиквариат",
  tagline: "Антиквариат",
  description:
    "Музейные антикварные предметы, винтажная мебель и коллекционные интерьерные объекты. Доставка по России и СНГ. Шоурум в Москве.",
  url: "https://levushkin.art",
  phone: "+7 (495) 123-45-67",
  phoneHref: "tel:+74951234567",
  salonEmail: "salon@epoxa.ru",
  salonEmailHref: "mailto:salon@epoxa.ru",
  whatsapp: "79001234567",
  telegram: "epoxa_gallery",
  email: "gallery@epoxa.ru",
  address: {
    city: "Москва",
    street: "ул. Большая Никитская, 12",
    country: "RU",
  },
  addressLine: "Москва, ул. Большая Никитская, 12",
  addressHref: "/adres",
  currency: "RUB",
  areaServed: ["RU", "BY", "KZ", "AE"],
  workingHours: "Ежедневно, 10:00–20:00 (МСК)",
  navLinks: [
    { label: "О салоне", href: "/o-salone" },
    { label: "Услуги", href: "/uslugi" },
    { label: "Новости", href: "/novosti" },
    { label: "Статьи", href: "/stati" },
    { label: "Адрес", href: "/adres" },
    { label: "Доставка и оплата", href: "/dostavka-i-oplata" },
    { label: "Сотрудничество", href: "/sotrudnichestvo" },
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

export const homeSections = [
  {
    id: "o-salone",
    title: "О салоне",
    href: "/o-salone",
    paragraphs: [
      `${siteConfig.name} — антикварная галерея в центре Москвы. Мы собираем музейные предметы с подтверждённым провенансом: мебель, освещение, зеркала, часы и объекты декора.`,
      "Каждый лот сопровождается экспертизой, рекомендациями по размещению в интерьере и бережной доставкой по России и СНГ.",
    ],
  },
  {
    id: "uslugi",
    title: "Услуги",
    href: "/uslugi",
    paragraphs: [
      "Подбор предметов под интерьер, консультации для дизайнеров и архитекторов, помощь с провенансом и оценкой.",
      "Организация осмотра в шоуруме, фотосъёмка для презентаций, рекомендации по реставрации и монтажу.",
    ],
  },
  {
    id: "novosti",
    title: "Новости",
    href: "/novosti",
    paragraphs: [
      "Следите за новыми поступлениями из частных европейских коллекций, участием в аукционах и открытыми днями в шоуруме.",
      "Актуальные анонсы публикуем в Telegram и рассылаем подписчикам trade‑программы.",
    ],
  },
  {
    id: "stati",
    title: "Статьи",
    href: "/stati",
    paragraphs: [
      "Публикуем материалы об антикварной мебели, стилях и эпохах, уходе за патиной и истории отдельных мастерских.",
      "Разборы предметов из нашей коллекции — для коллекционеров и профессионалов интерьера.",
    ],
  },
  {
    id: "adres",
    title: "Адрес",
    href: "/adres",
    paragraphs: [
      `Шоурум: ${siteConfig.address.city}, ${siteConfig.address.street}.`,
      `${siteConfig.workingHours}. Осмотр по предварительной записи — позвоните или напишите куратору.`,
    ],
  },
  {
    id: "dostavka-i-oplata",
    title: "Доставка и оплата",
    href: "/dostavka-i-oplata",
    paragraphs: [
      "Доставка по Москве и области — с белыми перчатками и профессиональной упаковкой. В регионы России и СНГ — проверенные логистические партнёры.",
      "Оплата по счёту, безналичный расчёт для юридических лиц. Резервирование лота — по согласованию с куратором.",
    ],
  },
  {
    id: "sotrudnichestvo",
    title: "Сотрудничество",
    href: "/sotrudnichestvo",
    paragraphs: [
      "Приглашаем дизайнеров, архитекторов и галерей к совместным проектам. Trade‑программа с персональным менеджером и ранним доступом к поступлениям.",
      `Для оптовых закупок и пополнения витрин — индивидуальные условия. Напишите на ${siteConfig.salonEmail} или позвоните в салон.`,
    ],
  },
] as const;

export function getHomeSection(slug: string) {
  return homeSections.find((section) => section.id === slug);
}

export const homeSectionSlugs = homeSections.map((section) => section.id);

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
