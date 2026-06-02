<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Architecture

- **Next.js** (`src/`) — frontend, SSR, static catalog/content JSON
- **Django** (`backend/`) — API on port **8000**: blog CMS, analytics, shop leads (SQLite `backend/db.sqlite3`)

Browser requests to `/api/blog/*`, `/api/analytics/*`, `/api/shop/*` are rewritten to Django (`BACKEND_URL`, default `http://127.0.0.1:8000`).

First-time backend setup:

```bash
npm run backend:install
npm run backend:migrate
npm run backend:import
```

Env (same as before for CMS): `CMS_BLOG_SECRET`, `CMS_BLOG_USER`, `CMS_BLOG_PASSWORD`.

## Deploy (levushkin.art + local preview) — **mandatory for agents**

**Deploy immediately in the same turn** after any site-facing change (`src/`, `public/`, `data/`, config, `backend/`). Do not ask the user for permission; do not end the task without running push unless they said not to deploy or the change is docs/git-only.

```bash
npm run push       # default — frontend; site stays up during build
npm run push:api   # after backend/ changes (also restarts Django :8000)
npm run deploy     # production :3000 only
```

**Zero-downtime:** `push` builds into `.next-staging` while the live site serves the old build; only a short cutover at the end. Never run `site:stop` before `push`.

| Port | Role |
|------|------|
| **3000** | Production → https://levushkin.art (Caddy) |
| **6854** | Local preview → http://localhost:6854 |
| **8000** | Django API (only restarted with `push:api`) |

Cursor rule: `.cursor/rules/deploy-immediately.mdc` (`alwaysApply: true`).

## Background services & autostart (Windows)

All servers already run detached (no terminal windows). To start everything without a build:

```bash
npm run site:start    # Django :8000, Next :3000, Next :6854
npm run site:stop     # stop all three
```

Autostart at Windows logon (Task Scheduler, 1 min delay):

```bash
npm run site:autostart-install
npm run site:autostart-uninstall
```

Ensure a production build exists (`.next/BUILD_ID`) before relying on autostart — run `npm run push` once after code changes. Caddy (HTTPS) is separate; see project `Caddyfile` reference.
