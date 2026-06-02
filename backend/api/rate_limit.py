"""Simple in-memory rate limiter (per IP + route key)."""

from __future__ import annotations

import time
from collections import defaultdict
from threading import Lock

from django.http import HttpRequest

from api.http import json_response

_lock = Lock()
_buckets: dict[str, list[float]] = defaultdict(list)


def _client_ip(request: HttpRequest) -> str:
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "unknown")


def check_rate_limit(
    request: HttpRequest,
    *,
    key: str,
    max_requests: int,
    window_seconds: int,
):
    """Return None if allowed, else a 429 JsonResponse."""
    bucket_key = f"{key}:{_client_ip(request)}"
    now = time.time()
    cutoff = now - window_seconds

    with _lock:
        hits = [t for t in _buckets[bucket_key] if t > cutoff]
        if len(hits) >= max_requests:
            return json_response({"error": "Too many requests"}, status=429)
        hits.append(now)
        _buckets[bucket_key] = hits
    return None
