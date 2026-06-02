import json
from typing import Any

from django.http import HttpRequest, JsonResponse


def json_response(data: Any, status: int = 200) -> JsonResponse:
    return JsonResponse(data, status=status, json_dumps_params={"ensure_ascii": False})


def json_error(message: str, status: int = 400) -> JsonResponse:
    return json_response({"error": message}, status=status)


def parse_json(request: HttpRequest) -> dict[str, Any] | None:
    try:
        body = request.body.decode() or "{}"
        return json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


def unauthorized() -> JsonResponse:
    return json_response({"error": "Unauthorized"}, status=401)
