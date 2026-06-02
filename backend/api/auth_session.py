"""HMAC blog session cookies — compatible with the former Next.js CMS auth."""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any

from django.conf import settings
from django.http import HttpRequest


def _session_secret() -> str:
    secret = settings.CMS_BLOG_SECRET
    if not secret or len(secret) < 16:
        if not settings.DEBUG:
            raise RuntimeError("CMS_BLOG_SECRET must be set (min 16 chars) in production")
        return "dev-only-blog-secret-change-me"
    return secret


def _blog_credentials() -> tuple[str, str]:
    return settings.CMS_BLOG_USER, settings.CMS_BLOG_PASSWORD


def _sign(payload: str) -> str:
    digest = hmac.new(
        _session_secret().encode(),
        payload.encode(),
        hashlib.sha256,
    ).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=").decode()


def _encode_session(user: str, exp: int) -> str:
    session = {"user": user, "exp": exp}
    payload = base64.urlsafe_b64encode(json.dumps(session, separators=(",", ":")).encode()).rstrip(
        b"="
    ).decode()
    return f"{payload}.{_sign(payload)}"


def _decode_session(token: str) -> dict[str, Any] | None:
    parts = token.split(".", 1)
    if len(parts) != 2:
        return None
    payload, signature = parts
    expected = _sign(payload)
    if not hmac.compare_digest(signature, expected):
        return None
    try:
        pad = "=" * (-len(payload) % 4)
        raw = base64.urlsafe_b64decode(payload + pad)
        session = json.loads(raw)
        if not session.get("user") or not isinstance(session.get("exp"), (int, float)):
            return None
        if session["exp"] < time.time():
            return None
        return session
    except (ValueError, json.JSONDecodeError):
        return None


def verify_blog_password(username: str, password: str) -> bool:
    user, pwd = _blog_credentials()
    return hmac.compare_digest(username, user) and hmac.compare_digest(password, pwd)


def create_blog_session_token(username: str) -> str:
    exp = int(time.time()) + settings.BLOG_SESSION_MAX_AGE
    return _encode_session(username, exp)


def get_session_from_request(request: HttpRequest) -> dict[str, Any] | None:
    token = request.COOKIES.get(settings.BLOG_SESSION_COOKIE)
    if not token:
        return None
    return _decode_session(token)


def cookie_secure(request: HttpRequest | None) -> bool:
    flag = settings.CMS_COOKIE_SECURE
    if flag == "true":
        return True
    if flag == "false":
        return False
    if request and request.is_secure():
        return True
    return False


def session_cookie_value(token: str) -> dict[str, Any]:
    return {
        "key": settings.BLOG_SESSION_COOKIE,
        "value": token,
        "max_age": settings.BLOG_SESSION_MAX_AGE,
        "httponly": True,
        "samesite": "Lax",
        "secure": False,
        "path": "/",
    }


def clear_session_cookie() -> dict[str, Any]:
    return {
        "key": settings.BLOG_SESSION_COOKIE,
        "value": "",
        "max_age": 0,
        "httponly": True,
        "samesite": "Lax",
        "secure": False,
        "path": "/",
    }
