# Django API (siteaudit backend)

Runs on **http://127.0.0.1:8000** by default. Next.js rewrites `/api/blog/*`, `/api/analytics/*`, and `/api/shop/*` here.

## Setup

```bash
pip install -r backend/requirements.txt
cd backend
python manage.py migrate
python manage.py import_legacy_json
```

## Environment

| Variable | Purpose |
|----------|---------|
| `CMS_BLOG_SECRET` | HMAC session signing (min 16 chars in production) |
| `CMS_BLOG_USER` / `CMS_BLOG_PASSWORD` | CMS login |
| `CMS_COOKIE_SECURE` | `true` / `false` for session cookie |
| `DJANGO_SECRET_KEY` | Django secret |
| `DJANGO_DEBUG` | `true` for dev |
| `CORS_ALLOWED_ORIGINS` | Next dev/prod origins |

## Production

`npm run push` and `npm run deploy` use a staging build (site stays up during compile). Django restarts only when you run `PUSH_BACKEND=1 npm run push`.

For a production WSGI server, use gunicorn:

```bash
cd backend
gunicorn config.wsgi:application -b 127.0.0.1:8000
```
