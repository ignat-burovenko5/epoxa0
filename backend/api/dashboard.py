from __future__ import annotations

from api import analytics_service, blog_service, shop_service


def get_dashboard_overview(period_days: int = 7, focus_date: str | None = None) -> dict:
    analytics_store = analytics_service.read_store()
    focus = analytics_service.parse_focus_date(focus_date)
    blog_page = blog_service.get_blog_list_page(0, 500, include_drafts=True)
    leads_store = shop_service.read_leads_store()
    recent_leads = shop_service.get_recent_leads(15)

    range_totals = analytics_service.sum_daily_range(analytics_store, period_days)
    funnel_base = range_totals.get("pageViews") or 1
    checkout_submits = range_totals.get("checkoutSubmits", 0)
    conversion_rate = (
        round((checkout_submits / funnel_base) * 1000) / 10 if checkout_submits > 0 else 0
    )

    published = sum(1 for p in blog_page["items"] if p.get("status") == "published")
    drafts = blog_page["total"] - published

    return {
        "analytics": {
            "periodDays": period_days,
            "from": range_totals["from"],
            "to": range_totals["to"],
            "pageViews": range_totals.get("pageViews", 0),
            "cartAdds": range_totals.get("cartAdds", 0),
            "cartViews": range_totals.get("cartViews", 0),
            "checkoutStarts": range_totals.get("checkoutStarts", 0),
            "checkoutSubmits": checkout_submits,
            "conversionRate": conversion_rate,
            "topPaths": analytics_service.top_paths_from_daily(range_totals),
            "uniquePages": len(range_totals.get("topPaths") or {}),
            "dailySeries": analytics_service.daily_series_for_range(
                analytics_store, period_days
            ),
            "recentEvents": analytics_service.recent_events_for_period(
                analytics_store, period_days, 15
            ),
            "focusDate": focus.isoformat(),
            "dayNav": analytics_service.day_navigation(analytics_store, focus),
            "focusDay": analytics_service.day_detail(analytics_store, focus),
            "viewsTotals": analytics_service.page_views_totals(analytics_store),
        },
        "blog": {
            "totalPosts": blog_page["total"],
            "published": published,
            "drafts": drafts,
        },
        "shop": {
            "leadsTotal": len(leads_store.get("leads") or []),
            "leadsLast7d": shop_service.leads_in_last_days(leads_store.get("leads") or [], 7),
            "recentLeads": recent_leads[:8],
        },
    }
