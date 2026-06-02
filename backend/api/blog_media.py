"""Save blog CMS uploads under `public/blog/uploads/` (served by Next.js)."""

from __future__ import annotations

import mimetypes
import secrets
from pathlib import Path

from django.conf import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

def upload_dir() -> Path:
    path = Path(settings.BLOG_MEDIA_DIR)
    path.mkdir(parents=True, exist_ok=True)
    return path


def _ext_from_name(name: str) -> str:
    ext = Path(name).suffix.lower()
    return ext if ext in ALLOWED_EXTENSIONS else ""


def _sniff_ext(header: bytes) -> str | None:
    if header.startswith(b"\xff\xd8\xff"):
        return ".jpg"
    if header.startswith(b"\x89PNG\r\n\x1a\n"):
        return ".png"
    if header[:6] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    if len(header) >= 12 and header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return ".webp"
    return None


def save_blog_image(uploaded_file) -> dict[str, str]:
    """Validate and store an uploaded image; return public URL path."""
    max_bytes = settings.BLOG_MEDIA_MAX_BYTES
    size = uploaded_file.size or 0
    if size <= 0:
        raise ValueError("Пустой файл")
    if size > max_bytes:
        raise ValueError(f"Файл слишком большой (макс. {max_bytes // (1024 * 1024)} МБ)")

    header = uploaded_file.read(16)
    uploaded_file.seek(0)

    ext = _sniff_ext(header) or _ext_from_name(uploaded_file.name)
    if not ext:
        raise ValueError("Допустимы только JPEG, PNG, WebP и GIF")

    content_type = (uploaded_file.content_type or "").split(";")[0].strip().lower()
    if content_type and content_type not in ALLOWED_CONTENT_TYPES:
        guessed, _ = mimetypes.guess_type(f"file{ext}")
        if guessed and guessed not in ALLOWED_CONTENT_TYPES:
            raise ValueError("Недопустимый тип файла")

    name = f"{secrets.token_urlsafe(12)}{ext}"
    dest = upload_dir() / name
    with dest.open("wb") as out:
        for chunk in uploaded_file.chunks():
            out.write(chunk)

    url = f"{settings.BLOG_MEDIA_URL_PREFIX}/{name}"
    return {"url": url, "filename": name}
