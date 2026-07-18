from __future__ import annotations

from django.http import HttpRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from api import (
    analytics_service,
    auth_session,
    blog_media,
    blog_service,
    product_service,
    shop_service,
)
from api.http import json_error, json_response, parse_json, unauthorized
from api.internal_auth import require_internal_token
from api.models import BlogPost
from api.rate_limit import check_rate_limit

BLOG_ADMIN_BASE = "/blog/1209u1lkjea"
SKIP_PATH_PREFIXES = ("/api/", "/_next/", f"{BLOG_ADMIN_BASE}/")


def _set_session_cookie(response, request: HttpRequest, token: str):
    opts = auth_session.session_cookie_value(token)
    opts["secure"] = auth_session.cookie_secure(request)
    response.set_cookie(
        opts["key"],
        opts["value"],
        max_age=opts["max_age"],
        httponly=opts["httponly"],
        samesite=opts["samesite"],
        secure=opts["secure"],
        path=opts["path"],
    )


def _clear_session_cookie(response, request: HttpRequest):
    opts = auth_session.clear_session_cookie()
    opts["secure"] = auth_session.cookie_secure(request)
    response.set_cookie(
        opts["key"],
        opts["value"],
        max_age=opts["max_age"],
        httponly=opts["httponly"],
        samesite=opts["samesite"],
        secure=opts["secure"],
        path=opts["path"],
    )


def _require_session(request: HttpRequest):
    session = auth_session.get_session_from_request(request)
    if not session:
        return None
    return session


def _safe_int(value, default: int, *, minimum: int | None = None, maximum: int | None = None) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        parsed = default
    if minimum is not None:
        parsed = max(minimum, parsed)
    if maximum is not None:
        parsed = min(maximum, parsed)
    return parsed


# --- Blog public ---


@csrf_exempt
@require_http_methods(["GET"])
def blog_list(request: HttpRequest):
    offset = _safe_int(request.GET.get("offset", 0), 0, minimum=0)
    store_settings = blog_service.get_settings()
    if not store_settings.get("enabled", True):
        return json_response(
            {"items": [], "total": 0, "offset": 0, "nextOffset": 0, "hasMore": False}
        )
    limit = _safe_int(
        request.GET.get("limit", store_settings.get("pageSize", 9)),
        store_settings.get("pageSize", 9),
        minimum=1,
        maximum=24,
    )
    page = blog_service.get_blog_list_page(offset, limit)
    return json_response(page)


# --- Blog auth ---


@csrf_exempt
@require_http_methods(["POST"])
def blog_auth_login(request: HttpRequest):
    limited = check_rate_limit(request, key="blog_login", max_requests=8, window_seconds=900)
    if limited:
        return limited
    body = parse_json(request)
    if body is None:
        return json_error("Invalid JSON", 400)
    username = (body.get("username") or "").strip()
    password = body.get("password") or ""
    if not username or not password:
        return json_error("Укажите логин и пароль")
    if not auth_session.verify_blog_password(username, password):
        return json_error("Неверный логин или пароль", 401)
    try:
        token = auth_session.create_blog_session_token(username)
    except RuntimeError as err:
        return json_error(str(err), 500)
    response = json_response({"ok": True, "user": username})
    _set_session_cookie(response, request, token)
    return response


@csrf_exempt
@require_http_methods(["POST"])
def blog_auth_logout(request: HttpRequest):
    response = json_response({"ok": True})
    _clear_session_cookie(response, request)
    return response


@csrf_exempt
@require_http_methods(["GET"])
def blog_auth_session(request: HttpRequest):
    session = auth_session.get_session_from_request(request)
    if not session:
        return json_response({"authenticated": False})
    return json_response(
        {
            "authenticated": True,
            "user": session["user"],
            "exp": session["exp"],
        }
    )


# --- Blog admin ---


@csrf_exempt
@require_http_methods(["GET", "POST"])
def blog_admin_posts(request: HttpRequest):
    if not _require_session(request):
        return unauthorized()
    if request.method == "GET":
        offset = _safe_int(request.GET.get("offset", 0), 0, minimum=0)
        limit = _safe_int(request.GET.get("limit", 50), 50, minimum=1, maximum=100)
        page = blog_service.get_blog_list_page(offset, limit, include_drafts=True)
        return json_response(page)
    body = parse_json(request)
    if body is None:
        return json_error("Invalid JSON")
    if not (body.get("title") or "").strip():
        return json_error("Заголовок обязателен")
    post = blog_service.create_post(body)
    return json_response(post, status=201)


@csrf_exempt
@require_http_methods(["GET", "PUT", "DELETE"])
def blog_admin_post_detail(request: HttpRequest, uid: str):
    if not _require_session(request):
        return unauthorized()
    if request.method == "GET":
        post = blog_service.get_post_by_uid(uid)
        if not post:
            return json_error("Запись не найдена", 404)
        return json_response(blog_service.post_to_dict(post))
    if request.method == "PUT":
        body = parse_json(request)
        if body is None:
            return json_error("Invalid JSON")
        post = blog_service.update_post(uid, body)
        if not post:
            return json_error("Запись не найдена", 404)
        return json_response(post)
    if blog_service.delete_post(uid):
        return json_response({"ok": True})
    return json_error("Запись не найдена", 404)


@csrf_exempt
@require_http_methods(["GET", "PUT"])
def blog_admin_settings(request: HttpRequest):
    if not _require_session(request):
        return unauthorized()
    if request.method == "GET":
        return json_response(blog_service.get_settings())
    body = parse_json(request)
    if body is None:
        return json_error("Invalid JSON")
    saved = blog_service.save_settings(body)
    return json_response(saved)


@csrf_exempt
@require_http_methods(["GET"])
def blog_internal_store(request: HttpRequest):
    """Server-to-server: full blog store for Next.js RSC (no drafts filter)."""
    denied = require_internal_token(request)
    if denied:
        return denied
    return json_response(blog_service.read_blog_store())


@csrf_exempt
@require_http_methods(["GET"])
def blog_internal_post(request: HttpRequest, uid: str):
    denied = require_internal_token(request)
    if denied:
        return denied
    post = blog_service.get_post_by_uid(uid)
    if not post:
        return json_error("Not found", 404)
    return json_response(blog_service.post_to_dict(post))


@csrf_exempt
@require_http_methods(["GET"])
def blog_internal_published_post(request: HttpRequest, uid: str):
    denied = require_internal_token(request)
    if denied:
        return denied
    post = blog_service.get_published_post_by_uid(uid)
    if not post:
        return json_error("Not found", 404)
    return json_response(blog_service.post_to_dict(post))


@csrf_exempt
@require_http_methods(["GET"])
def blog_internal_published_uids(request: HttpRequest):
    denied = require_internal_token(request)
    if denied:
        return denied
    uids = list(BlogPost.objects.filter(status="published").values_list("uid", flat=True))
    return json_response({"uids": uids})


@csrf_exempt
@require_http_methods(["POST"])
def blog_admin_upload(request: HttpRequest):
    if not _require_session(request):
        return unauthorized()
    uploaded = request.FILES.get("file")
    if not uploaded:
        return json_error("Выберите файл изображения")
    try:
        result = blog_media.save_blog_image(uploaded)
    except ValueError as err:
        return json_error(str(err))
    return json_response(result, status=201)


@csrf_exempt
@require_http_methods(["GET"])
def blog_admin_overview(request: HttpRequest):
    if not _require_session(request):
        return unauthorized()
    days = _safe_int(request.GET.get("days", 7), 7, minimum=1, maximum=30)
    focus_date = request.GET.get("date") or None
    from api.dashboard import get_dashboard_overview

    return json_response(get_dashboard_overview(days, focus_date))


# --- Analytics ---


@csrf_exempt
@require_http_methods(["POST"])
def analytics_event(request: HttpRequest):
    limited = check_rate_limit(request, key="analytics_event", max_requests=120, window_seconds=60)
    if limited:
        return limited
    body = parse_json(request)
    if body is None:
        return json_error("Invalid JSON", 400)
    event_type = body.get("type") or ""
    if event_type not in analytics_service.ANALYTICS_EVENT_TYPES:
        return json_error("Unknown event type", 400)
    path = (body.get("path") or "/")[:256]
    if any(path.startswith(p) for p in SKIP_PATH_PREFIXES):
        return json_response({"ok": True, "skipped": True})
    analytics_service.record_event(event_type, path, body.get("meta"))
    return json_response({"ok": True})


@csrf_exempt
@require_http_methods(["GET"])
def analytics_internal_store(request: HttpRequest):
    denied = require_internal_token(request)
    if denied:
        return denied
    return json_response(analytics_service.read_store())


# --- Shop ---


@csrf_exempt
@require_http_methods(["POST"])
def shop_lead(request: HttpRequest):
    limited = check_rate_limit(request, key="shop_lead", max_requests=6, window_seconds=3600)
    if limited:
        return limited
    body = parse_json(request)
    if body is None:
        return json_error("Invalid JSON", 400)
    if not (body.get("name") or "").strip() or not (body.get("phone") or "").strip():
        return json_error("Name and phone required", 400)
    lines = body.get("lines") if isinstance(body.get("lines"), list) else []
    if not lines:
        return json_error("No product in order", 400)
    try:
        lead = shop_service.append_lead(
            {
                "name": body["name"].strip(),
                "phone": body["phone"].strip(),
                "email": (body.get("email") or "").strip() or None,
                "subtotal": body.get("subtotal"),
                "lines": lines,
            }
        )
    except ValueError as err:
        return json_error(str(err), 400)
    analytics_service.record_event(
        "checkout_submit",
        "/checkout",
        {"itemCount": len(lines), "subtotal": lead["subtotal"]},
    )
    return json_response({"ok": True, "id": lead["id"]})


@csrf_exempt
@require_http_methods(["GET"])
def shop_internal_leads(request: HttpRequest):
    denied = require_internal_token(request)
    if denied:
        return denied
    limit = _safe_int(request.GET.get("limit", 15), 15, minimum=1, maximum=50)
    return json_response({"leads": shop_service.get_recent_leads(limit)})


@csrf_exempt
@require_http_methods(["GET"])
def shop_internal_leads_store(request: HttpRequest):
    denied = require_internal_token(request)
    if denied:
        return denied
    return json_response(shop_service.read_leads_store())
