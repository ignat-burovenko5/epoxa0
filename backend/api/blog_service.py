from __future__ import annotations

import re
import secrets
from datetime import datetime, timezone
from typing import Any

from django.utils.dateparse import parse_datetime

from api.defaults import DEFAULT_BLOG_SETTINGS
from api.models import BlogPost, BlogSettingsRow


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def format_blog_date(iso: str | None) -> str:
    if not iso:
        return ""
    try:
        dt = parse_datetime(iso.replace("Z", "+00:00"))
        if not dt:
            return ""
        return dt.strftime("%d.%m.%Y")
    except (ValueError, TypeError):
        return ""


def new_uid() -> str:
    return secrets.token_hex(5)[:10]


def slugify_title(title: str) -> str:
    s = title.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE)
    s = re.sub(r"[\s_-]+", "-", s)
    return s.strip("-")[:80]


def _dt_to_iso(dt: datetime | None) -> str | None:
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def post_to_dict(post: BlogPost) -> dict[str, Any]:
    out: dict[str, Any] = {
        "uid": post.uid,
        "slug": post.slug,
        "title": post.title,
        "excerpt": post.excerpt,
        "body": post.body,
        "status": post.status,
    }
    if post.body_format:
        out["bodyFormat"] = post.body_format
    if post.date:
        out["date"] = post.date
    if post.published_at:
        out["publishedAt"] = _dt_to_iso(post.published_at)
    if post.updated_at:
        out["updatedAt"] = _dt_to_iso(post.updated_at)
    if post.created_at:
        out["createdAt"] = _dt_to_iso(post.created_at)
    if post.author:
        out["author"] = post.author
    if post.cover_image:
        out["coverImage"] = post.cover_image
    if post.tags:
        out["tags"] = post.tags
    if post.seo:
        out["seo"] = post.seo
    if post.display:
        out["display"] = post.display
    if post.featured:
        out["featured"] = post.featured
    return out


def post_summary(post: BlogPost) -> dict[str, Any]:
    return {
        "uid": post.uid,
        "slug": post.slug,
        "title": post.title,
        "excerpt": post.excerpt,
        "date": post.date or format_blog_date(_dt_to_iso(post.published_at)),
        "status": post.status,
        "featured": post.featured,
        "coverImage": post.cover_image,
        "tags": post.tags or [],
        "author": post.author,
        "publishedAt": _dt_to_iso(post.published_at),
    }


def get_settings() -> dict[str, Any]:
    row, _ = BlogSettingsRow.objects.get_or_create(id=1, defaults={"data": DEFAULT_BLOG_SETTINGS})
    merged = {**DEFAULT_BLOG_SETTINGS, **(row.data or {})}
    merged["index"] = {**DEFAULT_BLOG_SETTINGS["index"], **(merged.get("index") or {})}
    merged["defaultDisplay"] = {
        **DEFAULT_BLOG_SETTINGS["defaultDisplay"],
        **(merged.get("defaultDisplay") or {}),
    }
    return merged


def save_settings(settings: dict[str, Any]) -> dict[str, Any]:
    row, _ = BlogSettingsRow.objects.get_or_create(id=1, defaults={"data": DEFAULT_BLOG_SETTINGS})
    row.data = settings
    row.save(update_fields=["data", "updated_at"])
    return get_settings()


def read_blog_store() -> dict[str, Any]:
    posts = [post_to_dict(p) for p in BlogPost.objects.all()]
    return {
        "version": 1,
        "posts": posts,
        "settings": get_settings(),
        "updatedAt": iso_now(),
    }


def _parse_display_date(value: str | None) -> datetime | None:
    if not value:
        return None
    m = re.match(r"^(\d{2})\.(\d{2})\.(\d{4})$", value.strip())
    if not m:
        return None
    try:
        return datetime(
            int(m.group(3)),
            int(m.group(2)),
            int(m.group(1)),
            tzinfo=timezone.utc,
        )
    except ValueError:
        return None


def _post_sort_timestamp(post: BlogPost) -> float:
    if post.published_at:
        return post.published_at.timestamp()
    if post.updated_at:
        return post.updated_at.timestamp()
    if post.created_at:
        return post.created_at.timestamp()
    display = _parse_display_date(post.date)
    if display:
        return display.timestamp()
    return 0.0


def _sort_posts(qs):
    return sorted(list(qs), key=_post_sort_timestamp, reverse=True)


def unique_slug(base: str, exclude_uid: str | None = None) -> str:
    slug = base or "post"
    n = 0
    while BlogPost.objects.filter(slug=slug).exclude(uid=exclude_uid or "").exists():
        n += 1
        slug = f"{base}-{n}"
    return slug


def _parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    dt = parse_datetime(value.replace("Z", "+00:00"))
    return dt


def _normalize_seo(data: dict[str, Any], existing: BlogPost | None = None) -> dict[str, Any]:
    """SEO fields are derived from title, excerpt, cover — only noIndex is stored."""
    if "seo" in data:
        seo_in = data.get("seo") or {}
    else:
        seo_in = (existing.seo if existing else {}) or {}
    if seo_in.get("noIndex"):
        return {"noIndex": True}
    return {}


def normalize_input(data: dict[str, Any], existing: BlogPost | None = None) -> BlogPost:
    now = datetime.now(timezone.utc)
    uid = (data.get("uid") or (existing.uid if existing else None) or new_uid())[:32]
    title = (data.get("title") or "").strip()
    base_slug = (
        (data.get("slug") or "").strip()
        or (existing.slug if existing else "")
        or slugify_title(title)
        or uid[:8]
    ).lower()
    slug = unique_slug(base_slug, uid)

    status = data.get("status") or (existing.status if existing else "draft")
    published_at = existing.published_at if existing else None
    if status == "published" and not published_at:
        published_at = now

    created_at = existing.created_at if existing else now
    published_iso = data.get("publishedAt")
    if published_iso:
        published_at = _parse_dt(published_iso) or published_at

    post = BlogPost(
        uid=uid,
        slug=slug,
        title=title,
        excerpt=data.get("excerpt") or "",
        body=data.get("body") or "",
        body_format=data.get("bodyFormat") or (existing.body_format if existing else "plain"),
        date=data.get("date") or format_blog_date(_dt_to_iso(published_at)),
        status=status,
        author=data.get("author") or (existing.author if existing else ""),
        cover_image=data.get("coverImage") if "coverImage" in data else (existing.cover_image if existing else None),
        tags=data.get("tags") if "tags" in data else (existing.tags if existing else []),
        seo=_normalize_seo(data, existing),
        display=data.get("display") if "display" in data else (existing.display if existing else {}),
        featured=bool(data.get("featured", existing.featured if existing else False)),
        sort_order=None,
        published_at=published_at,
        created_at=created_at,
        updated_at=now,
    )
    return post


def get_blog_list_page(
    offset: int,
    limit: int,
    *,
    include_drafts: bool = False,
) -> dict[str, Any]:
    settings = get_settings()
    page_size = limit if limit > 0 else settings.get("pageSize", 9)
    qs = BlogPost.objects.all()
    if not include_drafts:
        qs = qs.filter(status="published")
    posts = _sort_posts(qs)
    items = [post_summary(p) for p in posts[offset : offset + page_size]]
    next_offset = offset + len(items)
    return {
        "items": items,
        "total": len(posts),
        "offset": offset,
        "nextOffset": next_offset,
        "hasMore": next_offset < len(posts),
    }


def get_post_by_uid(uid: str) -> BlogPost | None:
    try:
        return BlogPost.objects.get(uid=uid)
    except BlogPost.DoesNotExist:
        return None


def get_published_post_by_uid(uid: str) -> BlogPost | None:
    post = get_post_by_uid(uid)
    if not post or post.status != "published":
        return None
    return post


def create_post(data: dict[str, Any]) -> dict[str, Any]:
    post = normalize_input(data)
    post.save()
    return post_to_dict(post)


def update_post(uid: str, data: dict[str, Any]) -> dict[str, Any] | None:
    existing = get_post_by_uid(uid)
    if not existing:
        return None
    merged = post_to_dict(existing)
    merged.update(data)
    merged["uid"] = uid
    if data.get("slug", "").strip():
        merged["slug"] = unique_slug(data["slug"].strip().lower(), uid)
    post = normalize_input(merged, existing)
    post.save()
    return post_to_dict(post)


def delete_post(uid: str) -> bool:
    deleted, _ = BlogPost.objects.filter(uid=uid).delete()
    return deleted > 0
