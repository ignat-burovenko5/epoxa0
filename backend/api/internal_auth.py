"""Shared-secret gate for server-only internal API routes."""

from __future__ import annotations

import hmac

from django.conf import settings
from django.http import HttpRequest

from api.http import json_response


def internal_api_token() -> str:
    token = getattr(settings, "INTERNAL_API_TOKEN", "") or settings.CMS_BLOG_SECRET
    if token:
        return token
    if not settings.DEBUG:
        raise RuntimeError("INTERNAL_API_TOKEN or CMS_BLOG_SECRET must be set in production")
    return "dev-only-internal-token-change-me"


def require_internal_token(request: HttpRequest):
    """Return None if authorized, else a 401 JsonResponse."""
    expected = internal_api_token()
    provided = request.headers.get("X-Internal-Token", "")
    if not provided or not hmac.compare_digest(provided, expected):
        return json_response({"error": "Unauthorized"}, status=401)
    return None
