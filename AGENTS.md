<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Deploy (levushkin.art)

After code or asset changes that should appear on the live site, run:

```bash
npm run deploy
```

This builds the app and restarts the production server on port 3000 (proxied by Caddy to https://levushkin.art).
