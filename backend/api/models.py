from django.db import models


class BlogSettingsRow(models.Model):
    """Singleton blog CMS settings (JSON matches frontend BlogSettings)."""

    id = models.PositiveSmallIntegerField(primary_key=True, default=1)
    data = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "blog settings"


class BlogPost(models.Model):
    uid = models.CharField(max_length=32, primary_key=True)
    slug = models.CharField(max_length=220, db_index=True)
    title = models.CharField(max_length=500)
    excerpt = models.TextField(blank=True, default="")
    body = models.TextField(blank=True, default="")
    body_format = models.CharField(max_length=16, blank=True, default="plain")
    date = models.CharField(max_length=32, blank=True, default="")
    published_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, default="draft")
    author = models.CharField(max_length=200, blank=True, default="")
    cover_image = models.JSONField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    seo = models.JSONField(default=dict, blank=True)
    display = models.JSONField(default=dict, blank=True)
    featured = models.BooleanField(default=False)
    sort_order = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ["-published_at", "-updated_at", "-created_at"]


class AnalyticsState(models.Model):
    id = models.PositiveSmallIntegerField(primary_key=True, default=1)
    daily = models.JSONField(default=dict)
    recent = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)


class ShopLead(models.Model):
    id = models.CharField(max_length=64, primary_key=True)
    at = models.DateTimeField()
    name = models.CharField(max_length=300)
    phone = models.CharField(max_length=64)
    email = models.CharField(max_length=300, blank=True, default="")
    city = models.CharField(max_length=200, blank=True, default="")
    delivery = models.CharField(max_length=200, blank=True, default="")
    payment = models.CharField(max_length=200, blank=True, default="")
    subtotal = models.FloatField(default=0)
    item_count = models.PositiveIntegerField(default=0)
    lines = models.JSONField(default=list)
    white_glove = models.BooleanField(null=True, blank=True)
    video_call = models.BooleanField(null=True, blank=True)
    comment = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-at"]
