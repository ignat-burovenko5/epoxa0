export const OVERVIEW_PERIOD_OPTIONS = [7, 14, 30] as const;

export type OverviewPeriodDays = (typeof OVERVIEW_PERIOD_OPTIONS)[number];

export function parseOverviewPeriodDays(raw: string | null | undefined): OverviewPeriodDays {
  const n = Number(raw);
  if (n === 14 || n === 30) return n;
  return 7;
}

export function overviewPeriodLabel(days: number): string {
  if (days === 1) return "за 1 день";
  if (days >= 2 && days <= 4) return `за ${days} дня`;
  return `за ${days} дней`;
}
