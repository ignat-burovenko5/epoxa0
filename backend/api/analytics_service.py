from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo

from api.models import AnalyticsState

MSK = ZoneInfo("Europe/Moscow")

ANALYTICS_EVENT_TYPES = frozenset(
    {
        "page_view",
        "cart_add",
        "cart_view",
        "checkout_start",
        "checkout_submit",
    }
)

MAX_RECENT = 80


def _empty_daily() -> dict[str, Any]:
    return {
        "pageViews": 0,
        "cartAdds": 0,
        "cartViews": 0,
        "checkoutStarts": 0,
        "checkoutSubmits": 0,
        "topPaths": {},
        "hourlyPageViews": {},
    }


def moscow_today() -> date:
    return datetime.now(MSK).date()


def _parse_iso_datetime(at_iso: str) -> datetime | None:
    if not at_iso:
        return None
    try:
        return datetime.fromisoformat(at_iso.replace("Z", "+00:00"))
    except ValueError:
        return None


def event_moscow_day_hour(at_iso: str) -> tuple[str, int] | None:
    dt = _parse_iso_datetime(at_iso)
    if dt is None:
        return None
    local = dt.astimezone(MSK)
    return local.date().isoformat(), local.hour


def parse_focus_date(raw: str | None) -> date:
    today = moscow_today()
    if not raw:
        return today
    try:
        parsed = date.fromisoformat(raw[:10])
    except ValueError:
        return today
    if parsed > today:
        return today
    return parsed


def _day_label(day: date, today: date) -> str:
    if day == today:
        return "Сегодня"
    if day == today - timedelta(days=1):
        return "Вчера"
    if day == today + timedelta(days=1):
        return "Завтра"
    return day.strftime("%d.%m")


def _get_state() -> AnalyticsState:
    row, _ = AnalyticsState.objects.get_or_create(
        id=1,
        defaults={"daily": {}, "recent": []},
    )
    return row


def read_store() -> dict[str, Any]:
    row = _get_state()
    return {
        "version": 1,
        "daily": row.daily or {},
        "recent": row.recent or [],
        "updatedAt": row.updated_at.isoformat().replace("+00:00", "Z"),
    }


def _bump_daily(daily: dict[str, Any], event: dict[str, Any]) -> dict[str, Any]:
    next_daily = {**daily, "topPaths": dict(daily.get("topPaths") or {})}
    path = event.get("path") or "/"
    etype = event.get("type")

    if etype == "page_view":
        next_daily["pageViews"] = next_daily.get("pageViews", 0) + 1
        next_daily["topPaths"][path] = next_daily["topPaths"].get(path, 0) + 1
        at_iso = event.get("at") or ""
        parts = event_moscow_day_hour(at_iso)
        if parts:
            hour_key = str(parts[1])
            hourly = dict(next_daily.get("hourlyPageViews") or {})
            hourly[hour_key] = hourly.get(hour_key, 0) + 1
            next_daily["hourlyPageViews"] = hourly
    elif etype == "cart_add":
        next_daily["cartAdds"] = next_daily.get("cartAdds", 0) + 1
    elif etype == "cart_view":
        next_daily["cartViews"] = next_daily.get("cartViews", 0) + 1
    elif etype == "checkout_start":
        next_daily["checkoutStarts"] = next_daily.get("checkoutStarts", 0) + 1
    elif etype == "checkout_submit":
        next_daily["checkoutSubmits"] = next_daily.get("checkoutSubmits", 0) + 1

    return next_daily


def record_event(
    event_type: str,
    path: str,
    meta: dict[str, Any] | None = None,
) -> None:
    row = _get_state()
    at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    full = {"type": event_type, "path": path or "/", "at": at, "meta": meta}
    moscow_parts = event_moscow_day_hour(at)
    day = moscow_parts[0] if moscow_parts else at[:10]
    daily_map = dict(row.daily or {})
    daily = daily_map.get(day) or _empty_daily()
    daily_map[day] = _bump_daily(daily, full)
    recent = [full, *(row.recent or [])][:MAX_RECENT]
    row.daily = daily_map
    row.recent = recent
    row.save(update_fields=["daily", "recent", "updated_at"])


def sum_daily_range(store: dict[str, Any], days: int) -> dict[str, Any]:
    totals = _empty_daily()
    keys = sorted((store.get("daily") or {}).keys())[-days:]
    for key in keys:
        d = store["daily"][key]
        totals["pageViews"] += d.get("pageViews", 0)
        totals["cartAdds"] += d.get("cartAdds", 0)
        totals["cartViews"] += d.get("cartViews", 0)
        totals["checkoutStarts"] += d.get("checkoutStarts", 0)
        totals["checkoutSubmits"] += d.get("checkoutSubmits", 0)
        for path, count in (d.get("topPaths") or {}).items():
            totals["topPaths"][path] = totals["topPaths"].get(path, 0) + count
    today = datetime.now(timezone.utc).isoformat()[:10]
    return {
        **totals,
        "from": keys[0] if keys else today,
        "to": keys[-1] if keys else today,
    }


def top_paths_from_daily(daily: dict[str, Any], limit: int = 8) -> list[dict[str, Any]]:
    paths = daily.get("topPaths") or {}
    return [
        {"path": path, "views": views}
        for path, views in sorted(paths.items(), key=lambda x: -x[1])[:limit]
    ]


def daily_series_for_range(store: dict[str, Any], days: int) -> list[dict[str, Any]]:
    """Last N calendar days (UTC), including days with zero activity."""
    daily_map = store.get("daily") or {}
    today = datetime.now(timezone.utc).date()
    span = max(1, min(days, 31))
    series: list[dict[str, Any]] = []
    for offset in range(span - 1, -1, -1):
        day = today - timedelta(days=offset)
        key = day.isoformat()
        row = daily_map.get(key) or _empty_daily()
        series.append(
            {
                "date": key,
                "label": day.strftime("%d.%m"),
                "pageViews": row.get("pageViews", 0),
                "cartAdds": row.get("cartAdds", 0),
                "cartViews": row.get("cartViews", 0),
                "checkoutStarts": row.get("checkoutStarts", 0),
                "checkoutSubmits": row.get("checkoutSubmits", 0),
            }
        )
    return series


def _hourly_counts_for_day(store: dict[str, Any], day_key: str) -> dict[str, int]:
    daily_map = store.get("daily") or {}
    daily = daily_map.get(day_key) or _empty_daily()
    hourly = dict(daily.get("hourlyPageViews") or {})
    if hourly:
        return hourly
    for event in store.get("recent") or []:
        if event.get("type") != "page_view":
            continue
        parts = event_moscow_day_hour(event.get("at") or "")
        if not parts or parts[0] != day_key:
            continue
        hour_key = str(parts[1])
        hourly[hour_key] = hourly.get(hour_key, 0) + 1
    return hourly


def hourly_series_for_day(store: dict[str, Any], day_key: str) -> list[dict[str, Any]]:
    hourly = _hourly_counts_for_day(store, day_key)
    return [
        {
            "hour": hour,
            "label": f"{hour:02d}:00",
            "views": hourly.get(str(hour), 0),
        }
        for hour in range(24)
    ]


def day_detail(store: dict[str, Any], day: date) -> dict[str, Any]:
    today = moscow_today()
    key = day.isoformat()
    daily_map = store.get("daily") or {}
    row = daily_map.get(key) or _empty_daily()
    return {
        "date": key,
        "label": _day_label(day, today),
        "isToday": day == today,
        "isFuture": day > today,
        "pageViews": row.get("pageViews", 0),
        "topPaths": top_paths_from_daily(row, 6),
        "hourly": hourly_series_for_day(store, key),
    }


def day_navigation(store: dict[str, Any], center: date) -> dict[str, Any]:
    today = moscow_today()
    oldest_key = min((store.get("daily") or {}).keys(), default=today.isoformat())
    try:
        oldest = date.fromisoformat(oldest_key)
    except ValueError:
        oldest = today - timedelta(days=365)

    prev_day = center - timedelta(days=1)
    next_day = center + timedelta(days=1)

    def chip(d: date, role: str) -> dict[str, Any]:
        key = d.isoformat()
        row = (store.get("daily") or {}).get(key) or _empty_daily()
        return {
            "date": key,
            "label": _day_label(d, today),
            "role": role,
            "pageViews": row.get("pageViews", 0),
            "isToday": d == today,
            "isFuture": d > today,
            "isCenter": d == center,
        }

    return {
        "centerDate": center.isoformat(),
        "todayDate": today.isoformat(),
        "days": [
            chip(prev_day, "prev"),
            chip(center, "center"),
            chip(next_day, "next"),
        ],
        "canGoPrev": prev_day >= oldest,
        "canGoNext": next_day <= today,
    }


def _page_views_between(store: dict[str, Any], start: date, end: date) -> int:
    daily_map = store.get("daily") or {}
    total = 0
    d = start
    while d <= end:
        row = daily_map.get(d.isoformat()) or _empty_daily()
        total += row.get("pageViews", 0)
        d += timedelta(days=1)
    return total


def page_views_totals(store: dict[str, Any]) -> dict[str, int]:
    """Page views for calendar periods in Moscow time."""
    today = moscow_today()
    week_start = today - timedelta(days=6)
    month_start = today.replace(day=1)
    year_start = today.replace(month=1, day=1)
    daily_map = store.get("daily") or {}
    all_time = sum(
        (row or _empty_daily()).get("pageViews", 0) for row in daily_map.values()
    )
    return {
        "day": _page_views_between(store, today, today),
        "week": _page_views_between(store, week_start, today),
        "month": _page_views_between(store, month_start, today),
        "year": _page_views_between(store, year_start, today),
        "allTime": all_time,
    }


def recent_events_for_period(
    store: dict[str, Any], days: int, limit: int = 15
) -> list[dict[str, Any]]:
    today = datetime.now(timezone.utc).date()
    from_day = (today - timedelta(days=max(1, days) - 1)).isoformat()
    out: list[dict[str, Any]] = []
    for event in store.get("recent") or []:
        at = (event.get("at") or "")[:10]
        if at and at < from_day:
            continue
        out.append(event)
        if len(out) >= limit:
            break
    return out
