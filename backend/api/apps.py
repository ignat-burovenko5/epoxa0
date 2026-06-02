from django.apps import AppConfig
from django.conf import settings
from django.core.checks import Error, register


@register()
def production_security_checks(app_configs, **kwargs):
    if settings.DEBUG:
        return []
    errors = []
    if settings.SECRET_KEY.startswith("dev-only"):
        errors.append(Error("Set DJANGO_SECRET_KEY in production", id="api.E001"))
    if not settings.CMS_BLOG_SECRET or len(settings.CMS_BLOG_SECRET) < 16:
        errors.append(Error("Set CMS_BLOG_SECRET (min 16 chars) in production", id="api.E002"))
    if settings.CMS_BLOG_PASSWORD in ("changeme", "admin", "password"):
        errors.append(Error("Set a strong CMS_BLOG_PASSWORD in production", id="api.E003"))
    if not settings.INTERNAL_API_TOKEN:
        errors.append(Error("Set INTERNAL_API_TOKEN or CMS_BLOG_SECRET in production", id="api.E004"))
    return errors


class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"
