from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from api.models import ShopLead

MAX_LEADS = 200


def lead_to_dict(lead: ShopLead) -> dict[str, Any]:
    out: dict[str, Any] = {
        "id": lead.id,
        "at": lead.at.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
        "name": lead.name,
        "phone": lead.phone,
        "city": lead.city,
        "delivery": lead.delivery,
        "payment": lead.payment,
        "subtotal": lead.subtotal,
        "itemCount": lead.item_count,
        "lines": lead.lines or [],
    }
    if lead.email:
        out["email"] = lead.email
    if lead.white_glove is not None:
        out["whiteGlove"] = lead.white_glove
    if lead.video_call is not None:
        out["videoCall"] = lead.video_call
    if lead.comment:
        out["comment"] = lead.comment
    return out


def append_lead(data: dict[str, Any]) -> dict[str, Any]:
    lines = data.get("lines") or []
    if not isinstance(lines, list):
        raise ValueError("Invalid order lines")
    if len(lines) > 20:
        raise ValueError("Too many items in order")
    sanitized_lines: list[dict[str, Any]] = []
    for line in lines:
        if not isinstance(line, dict):
            raise ValueError("Invalid order line")
        title = str(line.get("title") or line.get("name") or "").strip()[:200]
        if not title:
            raise ValueError("Each order line needs a title")
        try:
            qty = max(1, min(99, int(line.get("qty") or 1)))
        except (TypeError, ValueError):
            qty = 1
        try:
            price = max(0, float(line.get("price") or 0))
        except (TypeError, ValueError):
            price = 0
        sanitized_lines.append(
            {
                "title": title,
                "qty": qty,
                "price": price,
            }
        )
    name = str(data["name"]).strip()[:120]
    phone = str(data["phone"]).strip()[:40]
    if not name or not phone:
        raise ValueError("Name and phone required")
    email = (data.get("email") or "").strip()[:120]
    lead = ShopLead(
        id=str(uuid.uuid4()),
        at=datetime.now(timezone.utc),
        name=name,
        phone=phone,
        email=email,
        city=str(data.get("city") or "")[:120],
        delivery=str(data.get("delivery") or "")[:120],
        payment=str(data.get("payment") or "")[:120],
        subtotal=max(0, float(data.get("subtotal") or 0)),
        item_count=len(sanitized_lines),
        lines=sanitized_lines,
    )
    lead.save()
    # Trim old leads
    ids = list(ShopLead.objects.order_by("-at").values_list("id", flat=True)[MAX_LEADS:])
    if ids:
        ShopLead.objects.exclude(id__in=ids).delete()
    return lead_to_dict(lead)


def get_recent_leads(limit: int = 12) -> list[dict[str, Any]]:
    return [lead_to_dict(l) for l in ShopLead.objects.all()[:limit]]


def read_leads_store() -> dict[str, Any]:
    leads = [lead_to_dict(l) for l in ShopLead.objects.all()[:MAX_LEADS]]
    updated = leads[0]["at"] if leads else datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    return {"version": 1, "leads": leads, "updatedAt": updated}


def leads_in_last_days(leads: list[dict[str, Any]], days: int) -> int:
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    count = 0
    for lead in leads:
        at = datetime.fromisoformat(lead["at"].replace("Z", "+00:00"))
        if at >= cutoff:
            count += 1
    return count
