from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from django.conf import settings

from api.models import CatalogProduct

PRODUCT_STATUSES = ("active", "draft", "archived")
LIVE_CATALOG_PATH = Path(settings.REPO_ROOT) / "data" / "catalog_live.json"
SEED_CATALOG_PATH = Path(settings.REPO_ROOT) / "src" / "data" / "catalog.json"


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _dt_to_iso(dt: datetime | None) -> str | None:
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def slugify_title(title: str) -> str:
    s = title.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE)
    s = re.sub(r"[\s_-]+", "-", s)
    return s.strip("-")[:120] or "product"


def product_to_dict(product: CatalogProduct) -> dict[str, Any]:
    out: dict[str, Any] = {
        "slug": product.slug,
        "title": product.title,
        "era": product.era,
        "category": product.category,
        "description": product.description or [],
        "price": product.price,
        "status": product.status,
        "featured": product.featured,
        "sortOrder": product.sort_order,
        "images": product.images or [],
        "createdAt": _dt_to_iso(product.created_at),
        "updatedAt": _dt_to_iso(product.updated_at),
    }
    if product.compare_at_price is not None:
        out["compareAtPrice"] = product.compare_at_price
    if product.badge:
        out["badge"] = product.badge
    if product.source_url:
        out["sourceUrl"] = product.source_url
    if product.admin_notes:
        out["adminNotes"] = product.admin_notes
    return out


def product_summary(product: CatalogProduct) -> dict[str, Any]:
    images = product.images or []
    return {
        "slug": product.slug,
        "title": product.title,
        "era": product.era,
        "category": product.category,
        "price": product.price,
        "compareAtPrice": product.compare_at_price,
        "status": product.status,
        "featured": product.featured,
        "sortOrder": product.sort_order,
        "image": images[0] if images else None,
        "updatedAt": _dt_to_iso(product.updated_at),
    }


def storefront_dict(product: CatalogProduct) -> dict[str, Any]:
    """Public catalog shape (matches CatalogProduct / catalog.json)."""
    out: dict[str, Any] = {
        "slug": product.slug,
        "title": product.title,
        "era": product.era,
        "category": product.category,
        "description": product.description or [],
        "price": float(product.price),
    }
    if product.compare_at_price is not None:
        out["compareAtPrice"] = float(product.compare_at_price)
    if product.badge:
        out["badge"] = product.badge
    if product.images:
        out["images"] = product.images
    if product.source_url:
        out["sourceUrl"] = product.source_url
    return out


def unique_slug(base: str, *, exclude: str | None = None) -> str:
    slug = slugify_title(base) or "product"
    candidate = slug
    n = 2
    while CatalogProduct.objects.filter(slug=candidate).exclude(slug=exclude or "").exists():
        candidate = f"{slug}-{n}"
        n += 1
    return candidate


def normalize_input(body: dict[str, Any], *, existing: CatalogProduct | None = None) -> dict[str, Any]:
    title = str(body.get("title") or "").strip()
    if not title:
        raise ValueError("Название обязательно")

    slug_raw = str(body.get("slug") or "").strip()
    if slug_raw:
        slug = slugify_title(slug_raw)
    elif existing:
        slug = existing.slug
    else:
        slug = unique_slug(title)

    status = str(body.get("status") or (existing.status if existing else "active")).strip()
    if status not in PRODUCT_STATUSES:
        raise ValueError("Некорректный статус")

    description = body.get("description")
    if isinstance(description, str):
        description = [p.strip() for p in description.split("\n\n") if p.strip()]
    elif isinstance(description, list):
        description = [str(p).strip() for p in description if str(p).strip()]
    else:
        description = existing.description if existing else []

    images = body.get("images")
    if isinstance(images, str):
        images = [line.strip() for line in images.splitlines() if line.strip()]
    elif isinstance(images, list):
        images = [str(x).strip() for x in images if str(x).strip()]
    else:
        images = existing.images if existing else []

    try:
        price = float(body.get("price") if body.get("price") is not None else (existing.price if existing else 0))
    except (TypeError, ValueError) as err:
        raise ValueError("Цена должна быть числом") from err

    compare_raw = body.get("compareAtPrice", body.get("compare_at_price"))
    compare_at_price = None
    if compare_raw not in (None, "", False):
        try:
            compare_at_price = float(compare_raw)
        except (TypeError, ValueError) as err:
            raise ValueError("Старая цена должна быть числом") from err

    sort_order = body.get("sortOrder", body.get("sort_order"))
    if sort_order is None:
        sort_order = existing.sort_order if existing else 0
    try:
        sort_order = int(sort_order)
    except (TypeError, ValueError):
        sort_order = 0

    return {
        "slug": slug if existing is None else (slug if slug == existing.slug else unique_slug(slug, exclude=existing.slug)),
        "title": title,
        "era": str(body.get("era") or (existing.era if existing else "")).strip(),
        "category": str(body.get("category") or (existing.category if existing else "")).strip(),
        "description": description,
        "price": price,
        "compare_at_price": compare_at_price,
        "badge": (str(body.get("badge")).strip() if body.get("badge") else "") or None,
        "images": images,
        "source_url": str(body.get("sourceUrl") or body.get("source_url") or (existing.source_url if existing else "")).strip(),
        "status": status,
        "featured": bool(body.get("featured", existing.featured if existing else False)),
        "sort_order": sort_order,
        "admin_notes": str(body.get("adminNotes") or body.get("admin_notes") or (existing.admin_notes if existing else "")).strip(),
    }


def export_live_catalog() -> int:
    """Write active storefront products to data/catalog_live.json."""
    qs = (
        CatalogProduct.objects.filter(status="active", price__gt=0)
        .order_by("sort_order", "title")
    )
    payload = [storefront_dict(p) for p in qs]
    LIVE_CATALOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LIVE_CATALOG_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return len(payload)


def get_product(slug: str) -> CatalogProduct | None:
    return CatalogProduct.objects.filter(slug=slug).first()


def list_products(
    *,
    status: str | None = None,
    q: str = "",
    offset: int = 0,
    limit: int = 100,
) -> dict[str, Any]:
    qs = CatalogProduct.objects.all()
    if status and status in PRODUCT_STATUSES:
        qs = qs.filter(status=status)
    q = (q or "").strip()
    if q:
        qs = qs.filter(title__icontains=q) | CatalogProduct.objects.filter(
            slug__icontains=q
        )
        if status and status in PRODUCT_STATUSES:
            qs = qs.filter(status=status)
        # rebuild after OR quirk — cleaner:
        from django.db.models import Q

        qs = CatalogProduct.objects.all()
        if status and status in PRODUCT_STATUSES:
            qs = qs.filter(status=status)
        qs = qs.filter(Q(title__icontains=q) | Q(slug__icontains=q) | Q(category__icontains=q))

    total = qs.count()
    items = [product_summary(p) for p in qs[offset : offset + limit]]
    next_offset = offset + len(items)
    counts = {
        "all": CatalogProduct.objects.count(),
        "active": CatalogProduct.objects.filter(status="active").count(),
        "draft": CatalogProduct.objects.filter(status="draft").count(),
        "archived": CatalogProduct.objects.filter(status="archived").count(),
    }
    return {
        "items": items,
        "total": total,
        "offset": offset,
        "nextOffset": next_offset,
        "hasMore": next_offset < total,
        "counts": counts,
    }


def create_product(body: dict[str, Any]) -> dict[str, Any]:
    data = normalize_input(body)
    if CatalogProduct.objects.filter(slug=data["slug"]).exists():
        data["slug"] = unique_slug(data["slug"])
    now = datetime.now(timezone.utc)
    product = CatalogProduct.objects.create(
        **data,
        created_at=now,
        updated_at=now,
    )
    export_live_catalog()
    return product_to_dict(product)


def update_product(slug: str, body: dict[str, Any]) -> dict[str, Any] | None:
    product = get_product(slug)
    if not product:
        return None
    data = normalize_input(body, existing=product)
    new_slug = data.pop("slug")
    for key, value in data.items():
        setattr(product, key, value)
    product.updated_at = datetime.now(timezone.utc)
    if new_slug != product.slug:
        # recreate with new PK if slug changes
        old = product
        CatalogProduct.objects.filter(slug=old.slug).delete()
        product = CatalogProduct.objects.create(
            slug=new_slug,
            title=old.title if "title" not in data else data.get("title", old.title),
            era=data.get("era", old.era),
            category=data.get("category", old.category),
            description=data.get("description", old.description),
            price=data.get("price", old.price),
            compare_at_price=data.get("compare_at_price", old.compare_at_price),
            badge=data.get("badge", old.badge),
            images=data.get("images", old.images),
            source_url=data.get("source_url", old.source_url),
            status=data.get("status", old.status),
            featured=data.get("featured", old.featured),
            sort_order=data.get("sort_order", old.sort_order),
            admin_notes=data.get("admin_notes", old.admin_notes),
            created_at=old.created_at,
            updated_at=datetime.now(timezone.utc),
        )
        # fix: we already set attrs on old before delete — redo cleanly
    else:
        product.save()
    export_live_catalog()
    return product_to_dict(get_product(new_slug) or product)


def set_status(slug: str, status: str) -> dict[str, Any] | None:
    if status not in PRODUCT_STATUSES:
        raise ValueError("Некорректный статус")
    product = get_product(slug)
    if not product:
        return None
    product.status = status
    product.updated_at = datetime.now(timezone.utc)
    product.save(update_fields=["status", "updated_at"])
    export_live_catalog()
    return product_to_dict(product)


def delete_product(slug: str) -> bool:
    deleted, _ = CatalogProduct.objects.filter(slug=slug).delete()
    if deleted:
        export_live_catalog()
    return bool(deleted)


def seed_from_catalog_json(*, force: bool = False) -> dict[str, int]:
    """Import src/data/catalog.json into DB. Skip existing slugs unless force."""
    if not SEED_CATALOG_PATH.exists():
        return {"created": 0, "updated": 0, "skipped": 0}
    raw = json.loads(SEED_CATALOG_PATH.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        return {"created": 0, "updated": 0, "skipped": 0}

    created = updated = skipped = 0
    now = datetime.now(timezone.utc)
    for item in raw:
        if not isinstance(item, dict):
            continue
        slug = str(item.get("slug") or "").strip()
        if not slug:
            skipped += 1
            continue
        existing = get_product(slug)
        payload = {
            "title": item.get("title") or slug,
            "slug": slug,
            "era": item.get("era") or "",
            "category": item.get("category") or "",
            "description": item.get("description") or [],
            "price": item.get("price") or 0,
            "compareAtPrice": item.get("compareAtPrice"),
            "badge": item.get("badge"),
            "images": item.get("images") or [],
            "sourceUrl": item.get("sourceUrl") or "",
            "status": "active" if float(item.get("price") or 0) > 0 else "draft",
            "featured": False,
            "sortOrder": 0,
        }
        if existing and not force:
            skipped += 1
            continue
        if existing and force:
            update_product(slug, payload)
            updated += 1
        else:
            data = normalize_input(payload)
            CatalogProduct.objects.create(**data, created_at=now, updated_at=now)
            created += 1

    export_live_catalog()
    return {"created": created, "updated": updated, "skipped": skipped}


def ensure_seeded() -> None:
    """Auto-seed once when the table is empty."""
    if CatalogProduct.objects.exists():
        return
    seed_from_catalog_json(force=False)
