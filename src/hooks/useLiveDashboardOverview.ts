"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardOverview } from "@/lib/dashboard/overview";
import {
  mergeDashboardOverview,
  type RemoteDashboardOverview,
} from "@/lib/dashboard/merge-overview";

const POLL_MS = 5_000;

type UseLiveDashboardOverviewOptions = {
  periodDays?: number;
  focusDate?: string;
  /** Poll while the analytics panel or hub summary is visible. */
  enabled?: boolean;
};

export function useLiveDashboardOverview(
  initial: DashboardOverview,
  { periodDays = 7, focusDate, enabled = true }: UseLiveDashboardOverviewOptions = {},
) {
  const [overview, setOverview] = useState(initial);
  const etagRef = useRef<string | null>(null);

  useEffect(() => {
    setOverview(initial);
    etagRef.current = null;
  }, [initial]);

  const refresh = useCallback(async () => {
    try {
      const params = new URLSearchParams({ days: String(periodDays) });
      if (focusDate) params.set("date", focusDate);
      const res = await fetch(`/api/blog/admin/overview?${params}`, {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) return;

      const remote = (await res.json()) as RemoteDashboardOverview;
      const next = mergeDashboardOverview(remote);
      const fingerprint = JSON.stringify({
        d: next.analytics.focusDate,
        h: next.analytics.focusDay.pageViews,
        t: next.analytics.viewsTotals,
        e: next.analytics.recentEvents[0]?.at,
      });

      if (fingerprint === etagRef.current) return;
      etagRef.current = fingerprint;
      setOverview(next);
    } catch {
      /* ignore transient network errors */
    }
  }, [periodDays, focusDate]);

  useEffect(() => {
    if (!enabled) return;

    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);

    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled, refresh]);

  return { overview, refresh };
}
