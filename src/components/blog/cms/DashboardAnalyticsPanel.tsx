"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { friendlyPath, hourlyViewMax } from "@/lib/dashboard/analytics-display";
import type { DashboardOverview } from "@/lib/dashboard/overview";
import { blogAdminAnalyticsPath } from "@/lib/blog/urls";

type DashboardAnalyticsPanelProps = {
  analytics: DashboardOverview["analytics"];
};

export default function DashboardAnalyticsPanel({ analytics }: DashboardAnalyticsPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const periodDays = Number(searchParams.get("days")) || 7;
  const { dayNav, focusDay, viewsTotals } = analytics;
  const hourlyMax = hourlyViewMax(focusDay.hourly);

  const totals = [
    { key: "day", label: "День", value: viewsTotals.day },
    { key: "week", label: "Неделя", value: viewsTotals.week },
    { key: "month", label: "Месяц", value: viewsTotals.month },
    { key: "year", label: "Год", value: viewsTotals.year },
  ] as const;

  function go(date: string) {
    router.push(blogAdminAnalyticsPath(periodDays, date));
  }

  function shift(delta: number) {
    const d = new Date(`${analytics.focusDate}T12:00:00`);
    d.setDate(d.getDate() + delta);
    go(d.toISOString().slice(0, 10));
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="grid grid-cols-4 gap-2">
        {totals.map((t) => (
          <div
            key={t.key}
            className="border border-museum-light/10 bg-luxury-base/30 px-2 py-3 text-center"
          >
            <p className="font-sans text-[9px] tracking-widest uppercase text-museum-light/40 mb-1">
              {t.label}
            </p>
            <p className="font-serif text-xl md:text-2xl text-museum-light tabular-nums">
              {t.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!dayNav.canGoPrev}
          onClick={() => shift(-1)}
          aria-label="Раньше"
          className="size-10 shrink-0 border border-museum-light/20 text-museum-light/60 hover:text-accent-gold disabled:opacity-25"
        >
          ←
        </button>
        <div className="flex flex-1 gap-1 min-w-0">
          {dayNav.days.map((day) => (
            <button
              key={day.date}
              type="button"
              disabled={day.isFuture}
              onClick={() => !day.isFuture && go(day.date)}
              className={`flex-1 min-w-0 py-2.5 px-1 font-sans text-xs border transition-colors ${
                day.isCenter
                  ? "border-accent-gold/50 bg-accent-gold/10 text-museum-light"
                  : "border-museum-light/15 text-museum-light/55 hover:border-museum-light/30"
              } ${day.isFuture ? "opacity-30 cursor-default" : ""}`}
            >
              <span className="block truncate">{day.label}</span>
              <span className="block font-serif text-lg tabular-nums mt-0.5">
                {day.isFuture ? "—" : day.pageViews}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!dayNav.canGoNext}
          onClick={() => shift(1)}
          aria-label="Позже"
          className="size-10 shrink-0 border border-museum-light/20 text-museum-light/60 hover:text-accent-gold disabled:opacity-25"
        >
          →
        </button>
      </div>

      <div>
        <p className="font-serif text-4xl md:text-5xl text-museum-light tabular-nums">
          {focusDay.pageViews}
        </p>
        <p className="font-sans text-sm text-museum-light/45 mt-1">
          просмотров · {focusDay.label} · МСК
        </p>
      </div>

      <div>
        <p className="font-sans text-[10px] tracking-widest uppercase text-museum-light/40 mb-2">
          По часам
        </p>
        <div
          className="overflow-x-auto pb-1 -mx-1 px-1"
          role="img"
          aria-label="Просмотры по часам, 0–23"
        >
          <div className="flex gap-px min-w-[24rem]">
            {focusDay.hourly.map((h) => (
              <div
                key={h.hour}
                title={`${h.label} — ${h.views}`}
                className="flex-1 min-w-[0.85rem] flex flex-col items-center"
              >
                <div className="h-20 w-full flex flex-col justify-end">
                  <div
                    className="w-full bg-accent-gold/70 rounded-t-sm"
                    style={{
                      height: h.views > 0 ? `${(h.views / hourlyMax) * 100}%` : "0",
                      minHeight: h.views > 0 ? 2 : 0,
                    }}
                  />
                </div>
                <span className="font-sans text-[9px] leading-none tabular-nums text-museum-light/40 mt-1">
                  {h.hour}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {focusDay.topPaths.length > 0 ? (
        <div>
          <p className="font-sans text-[10px] tracking-widest uppercase text-museum-light/40 mb-3">
            Страницы
          </p>
          <ul className="space-y-2 list-none p-0 m-0 font-sans text-sm">
            {focusDay.topPaths.slice(0, 6).map((row) => (
              <li key={row.path} className="flex justify-between gap-3">
                <Link href={row.path} className="text-museum-light/80 hover:text-accent-gold truncate">
                  {friendlyPath(row.path)}
                </Link>
                <span className="text-museum-light/40 tabular-nums shrink-0">{row.views}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : focusDay.pageViews === 0 ? (
        <p className="font-sans text-sm text-museum-light/40">Пока нет визитов за этот день.</p>
      ) : null}
    </div>
  );
}
