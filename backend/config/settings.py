import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BASE_DIR.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-django-secret-change-me")

DEBUG = os.environ.get("DJANGO_DEBUG", "true").lower() in ("1", "true", "yes")

ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get("DJANGO_ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")
    if h.strip()
]

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "django.contrib.staticfiles",
    "corsheaders",
    "api",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "config.urls"

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

LANGUAGE_CODE = "ru-ru"
TIME_ZONE = "Europe/Moscow"
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

STATIC_URL = "static/"

# Blog CMS (same env names as the former Next.js API)
CMS_BLOG_SECRET = os.environ.get("CMS_BLOG_SECRET", "")
CMS_BLOG_USER = os.environ.get("CMS_BLOG_USER", "admin")
CMS_BLOG_PASSWORD = os.environ.get("CMS_BLOG_PASSWORD", "changeme")
CMS_COOKIE_SECURE = os.environ.get("CMS_COOKIE_SECURE", "")
INTERNAL_API_TOKEN = os.environ.get("INTERNAL_API_TOKEN", "") or CMS_BLOG_SECRET

BLOG_SESSION_COOKIE = "blog_session"
BLOG_SESSION_MAX_AGE = 60 * 60 * 24 * 7

BLOG_MEDIA_DIR = REPO_ROOT / "public" / "blog" / "uploads"
BLOG_MEDIA_URL_PREFIX = "/blog/uploads"
BLOG_MEDIA_MAX_BYTES = int(os.environ.get("BLOG_MEDIA_MAX_BYTES", str(10 * 1024 * 1024)))

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://127.0.0.1:3000,http://localhost:3000,http://127.0.0.1:6854,http://localhost:6854",
    ).split(",")
    if o.strip()
]

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
