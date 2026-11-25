# Rheo — `uae-web`

Client-side React port of the Next.js `uae-frontend`. Vite + React 19 + TypeScript + Tailwind CSS v4.

## Run locally

```bash
cp .env.example .env.local
npm run dev
```

The browser always calls the API on its own origin. Vite proxies `/api` to the FastAPI backend
(`VITE_DEV_API_TARGET`, default `http://127.0.0.1:8000`), so the backend does not need CORS.
Sign-in uses the backend cookie contract described in `MIGRATION_NOTES.md`.

## Checks

```bash
npm run lint
npm run build
```

## Production

Serve the static `dist/` build and proxy `/api` to FastAPI at the same origin. Unknown paths must
fall back to `index.html` for client-side routing, and the site must use HTTPS so the refresh
cookie's `Secure` attribute is accepted. Nginx sketch:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    try_files $uri /index.html;
}
```

## Docs

- `AGENTS.md` — repository rules and standards
- `MIGRATION_NOTES.md` — audit, parity checklist, deviations, backend changes
