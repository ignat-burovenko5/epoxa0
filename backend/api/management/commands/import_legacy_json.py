"""Import data/blog/store.json, data/analytics/store.json, data/shop/leads.json into SQLite."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_datetime

from api.defaults import DEFAULT_BLOG_SETTINGS
from api.models import AnalyticsState, BlogPost, BlogSettingsRow, ShopLead


class Command(BaseCommand):
    help = "Import legacy JSON data files into the Django database"

    def handle(self, *args, **options):
        root = settings.REPO_ROOT
        self._import_blog(root / "data" / "blog" / "store.json")
        self._import_analytics(root / "data" / "analytics" / "store.json")
        self._import_leads(root / "data" / "shop" / "leads.json")
        self.stdout.write(self.style.SUCCESS("Legacy JSON import complete."))

    def _import_blog(self, path: Path) -> None:
        if not path.is_file():
            self.stdout.write(f"Skip blog (missing): {path}")
            return
        data = json.loads(path.read_text(encoding="utf-8"))
        settings_data = {**DEFAULT_BLOG_SETTINGS, **(data.get("settings") or {})}
        BlogSettingsRow.objects.update_or_create(id=1, defaults={"data": settings_data})
        BlogPost.objects.all().delete()
        for raw in data.get("posts") or []:
            BlogPost.objects.create(
                uid=raw["uid"],
                slug=raw.get("slug", ""),
                title=raw.get("title", ""),
                excerpt=raw.get("excerpt", ""),
                body=raw.get("body", ""),
                body_format=raw.get("bodyFormat", "plain"),
                date=raw.get("date", ""),
                published_at=self._dt(raw.get("publishedAt")),
                updated_at=self._dt(raw.get("updatedAt")),
                created_at=self._dt(raw.get("createdAt")),
                status=raw.get("status", "draft"),
                author=raw.get("author", ""),
                cover_image=raw.get("coverImage"),
                tags=raw.get("tags") or [],
                seo=raw.get("seo") or {},
                display=raw.get("display") or {},
                featured=bool(raw.get("featured")),
                sort_order=raw.get("sortOrder"),
            )
        self.stdout.write(f"Imported {len(data.get('posts') or [])} blog posts")

    def _import_analytics(self, path: Path) -> None:
        if not path.is_file():
            self.stdout.write(f"Skip analytics (missing): {path}")
            return
        data = json.loads(path.read_text(encoding="utf-8"))
        AnalyticsState.objects.update_or_create(
            id=1,
            defaults={
                "daily": data.get("daily") or {},
                "recent": data.get("recent") or [],
            },
        )
        self.stdout.write("Imported analytics store")

    def _import_leads(self, path: Path) -> None:
        if not path.is_file():
            self.stdout.write(f"Skip leads (missing): {path}")
            return
        data = json.loads(path.read_text(encoding="utf-8"))
        ShopLead.objects.all().delete()
        for raw in data.get("leads") or []:
            ShopLead.objects.create(
                id=raw["id"],
                at=self._dt(raw["at"]) or datetime.now(),
                name=raw.get("name", ""),
                phone=raw.get("phone", ""),
                email=raw.get("email", ""),
                city=raw.get("city", ""),
                delivery=raw.get("delivery", ""),
                payment=raw.get("payment", ""),
                subtotal=float(raw.get("subtotal") or 0),
                item_count=int(raw.get("itemCount") or len(raw.get("lines") or [])),
                lines=raw.get("lines") or [],
                white_glove=raw.get("whiteGlove"),
                video_call=raw.get("videoCall"),
                comment=raw.get("comment", ""),
            )
        self.stdout.write(f"Imported {len(data.get('leads') or [])} shop leads")

    @staticmethod
    def _dt(value: str | None):
        if not value:
            return None
        return parse_datetime(value.replace("Z", "+00:00"))
