import { siteConfig, yandexMapsUrl } from "@/lib/site";

export type SalonContactField = {
  label: string;
  value: string;
  href?: string;
  external?: boolean;
};

/** Canonical salon contact rows (footer, legal, info pages). */
export const salonContactFields: readonly SalonContactField[] = [
  {
    label: "Email",
    value: siteConfig.salonEmail,
    href: siteConfig.salonEmailHref,
  },
  {
    label: "Телефон",
    value: siteConfig.phone,
    href: siteConfig.phoneHref,
  },
  {
    label: "Шоурум",
    value: siteConfig.addressLine,
    href: yandexMapsUrl(),
    external: true,
  },
  {
    label: "Часы работы",
    value: siteConfig.workingHours,
  },
];
