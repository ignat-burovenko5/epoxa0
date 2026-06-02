<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Deploy (levushkin.art + local preview)

After every code or asset change that should appear on the site, run:

```bash
npm run push
```

This builds once, then restarts:

- port **3000** — production (Caddy → https://levushkin.art)
- port **6854** — local preview at http://localhost:6854

To deploy only production: `npm run deploy`
