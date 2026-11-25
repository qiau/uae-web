# Migration notes — `uae-frontend` (Next.js) → `uae-web` (Vite + React 19)

Status: **Phase 0 (audit) complete.** No application code ported yet.

Source: `../uae-frontend` (read-only, Next.js 16.4 / React 19.3 / Tailwind v4)
Target: `uae-web` (Vite 8 / React 19 / TypeScript / Tailwind v4)

---

## 1. Route inventory

### Pages

| URL | Source file(s) | Layout group | Title (`metadata`) | Notes |
| --- | --- | --- | --- | --- |
| `/` | `app/(app)/page.tsx`, `dashboard-view.tsx` | `(app)` | `Dashboard` | Server page, all data client-side |
| `/services` | `app/(app)/services/page.tsx`, `catalog-view.tsx` | `(app)` | `Service catalog` | |
| `/requests` | `app/(app)/requests/page.tsx`, `my-requests-view.tsx` | `(app)` | `My requests` | Pagination via `?page=` |
| `/requests/new` | `app/(app)/requests/new/page.tsx`, `new-request-view.tsx` | `(app)` | `New request` | `?service=` preselects a service |
| `/requests/[requestId]` | `app/(app)/requests/[requestId]/page.tsx`, `request-detail-view.tsx` | `(app)` | `Request` | `?created=1` success notice; `await params` |
| `/approvals` | `app/(app)/approvals/page.tsx`, `approvals-view.tsx` | `(app)` | `Approvals` | `?id=` selects an approval |
| `/jobs` | `app/(app)/jobs/page.tsx`, `jobs-view.tsx` | `(app)` | `Automation jobs` | `?id=` selects a job |
| `/login` | `app/(auth)/login/page.tsx`, `login-form.tsx`, `flow-field.tsx` | `(auth)` | `Sign in` | `?reason=` message, `?next=` safe redirect |

Root layout (`app/layout.tsx`): `lang="en"`, app name `Rheo`, title template `%s | Rheo`, default title `Rheo`, description "Request IT services, track approvals, and monitor automation in one place."

Route groups:
- `(app)` — `layout.tsx` renders `Suspense > SessionGate > AppShell`.
- `(auth)` — no group layout; root layout only.

Missing route files in the source: **no `error.tsx`, no `loading.tsx`, no `not-found.tsx`** anywhere. Next.js defaults apply for unmatched URLs and uncaught errors.

### Non-page route handlers

| Route | Purpose |
| --- | --- |
| `POST /api/session/login` | CSRF check, validates body, calls backend `/api/v1/auth/login`, sets `rheo_rt` + `rheo_user` HttpOnly cookies, returns access token |
| `POST /api/session/refresh` | Reads refresh cookie, calls backend `/api/v1/auth/refresh`, rotates cookies |
| `POST /api/session/logout` | Calls backend logout with refresh token, clears cookies |
| `GET|POST /api/v1/[...path]` | Same-origin pass-through to `RHEO_API_URL` |

Middleware `src/proxy.ts` (Next.js 16 "proxy" = middleware): if the `rheo_rt` cookie is absent, redirect every non-`login`/`api`/static path to `/login`, preserving `next`.

---

## 2. Feature inventory

| Feature | Pages / surfaces | Backing |
| --- | --- | --- |
| Auth / session | `/login`, `SessionGate`, user menu | Real backend login/refresh/logout via Next route handlers; access token in memory, refresh token in HttpOnly cookie |
| App shell | Every `(app)` page | Sidebar (collapsible + mobile sheet), top bar, command palette (Ctrl/Cmd+K), notifications menu, theme toggle, user menu |
| Dashboard | `/` | Requests: real `GET /requests` (max 100). Needs-action, jobs, activity: sample data |
| Service catalog | `/services` | Real `GET /services`; client-side search + category filter |
| Requests | `/requests`, `/requests/new`, `/requests/:requestId` | Real `POST /requests`, `GET /requests`, `GET /requests/:id` |
| Approvals | `/approvals` | Sample data only; approve/reject confirmations, no persistence |
| Automation jobs | `/jobs` | Sample data only; run/cancel confirmations mutate local state only |
| Notifications | Top bar menu | Sample data |
| Theme | Login + shell | `next-themes`, class strategy, default system |
| Sample-data labelling | Any mock surface | `SampleDataBadge` tooltip + explanations |

---

## 3. Component inventory

### App-specific components (source)

`components/page-header.tsx` (`PageHeader`, `Panel`), `states.tsx` (`EmptyState`, `PermissionDenied`, `QueryError`, `TableSkeleton`), `sample-data.tsx` (`SampleDataBadge`), `copy-button.tsx`, `rheo-logo.tsx` (`RheoMark`, `RheoWordmark`), `status/status.tsx` (`StatusBadge`, `requestStatusInfo`, `jobStatusInfo`, `approvalStatusInfo`, `toneText`), `jobs/job-table.tsx`, `requests/request-table.tsx`, `requests/request-pipeline.tsx`, `requests/request-timeline.tsx`, `theme/theme-toggle.tsx`, and shell: `app-shell.tsx`, `session-gate.tsx`, `sidebar-nav.tsx`, `nav.ts`, `command-palette.tsx`, `notifications-menu.tsx`, `user-menu.tsx`.

Login-only: `flow-field.tsx` (canvas flow background, ~30 fps, pauses when hidden, static under reduced motion, accelerate on sign-in).

### shadcn/UI components used by the source

`alert-dialog`, `button`, `dialog`, `dropdown-menu`, `input`, `label`, `sheet`, `skeleton`, `table`, `textarea`, `tooltip`.

`badge.tsx` and `separator.tsx` exist in the source but are **not imported anywhere** (all badges are local `StatusBadge` / `SampleDataBadge`). They are therefore not required for parity.

---

## 4. Data inventory

### API endpoints (`src/lib/api/endpoints.ts`)

| Function | Request | Used by |
| --- | --- | --- |
| `listServices({limit, offset})` | `GET /api/v1/services` | catalog, new-request form |
| `getService(id)` | `GET /api/v1/services/{id}` | not used by any page (available helper) |
| `listRequests({limit, offset})` | `GET /api/v1/requests` | dashboard (limit 100), my requests (limit 20) |
| `getRequest(id)` | `GET /api/v1/requests/{id}` | request detail |
| `createRequest(body)` | `POST /api/v1/requests` with `{service_id, request_data}` | new request |

### Query configuration

`src/lib/queries.ts`: keys `["services", params]`, `["service", id]`, `["requests", params]`, `["request", id]`; `useRequests` uses `placeholderData: keepPreviousData`; creation seeds `["request", id]` and invalidates `["requests"]`.

`Providers`: `staleTime: 30_000`, `refetchOnWindowFocus: false`, retry disabled for 4xx (`ApiError.status`), max 2 retries otherwise, mutations never retried.

### Auth / session

- Access token in memory only; expiry margin 30 s; concurrent refreshes deduplicated.
- `POST /api/session/*` guarded by custom header `x-rheo-session: 1` plus same origin.
- Cookies: `rheo_rt` (refresh, HttpOnly, SameSite=Strict, Secure in production), `rheo_user`.
- `useSyncExternalStore` session snapshot: `unknown | authenticated | signed_out | expired`.
- `SessionGate`: refreshes on `unknown`; on failure redirects to `/login?reason=unavailable`; on signed-out/expired clears the Query cache and redirects with `next` (+ `reason=expired`).
- `ApiError` (status, code, details, `validationIssues`), `describeError`, `networkError`, `toApiError`.

### Env

- `RHEO_API_URL` (server-only, default `http://127.0.0.1:8000`).
- `NODE_ENV` for cookie `secure`.

### Middleware

`src/proxy.ts` optimistic cookie check described in section 1.

---

## 5. Styling inventory

- **Tailwind v4, CSS-first** (`@import "tailwindcss"`, `@import "tw-animate-css"`, `@import "shadcn/tailwind.css"`, `@custom-variant dark`). No `tailwind.config.js`.
- Tokens in `src/app/globals.css`: light/dark sets for background, foreground, card, popover, primary, secondary, muted, accent, destructive, warning, border, input, ring, overlay, flow; semantic status colors (`pending`, `approved`, `rejected`, `running`, `succeeded`, `failed`, `cancelled` with `-bg` tints); chart and sidebar tokens; tiered radii (sm 4, md/lg 6, xl/2xl 10, 3xl 12, 4xl pill).
- Base layer: `border-border`, `outline-ring/50`, `font-sans`, `bg-background text-foreground`, global `:focus-visible` outline, `.tabular` numeric variant, reduced-motion override.
- **Fonts:** IBM Plex Sans (`--font-plex-sans`) and IBM Plex Mono (`--font-plex-mono`) loaded with `next/font/google`; sans for all UI, mono for IDs/types/logs. **The target must use Plus Jakarta Sans per `AGENTS.md`; IBM Plex Mono is not installed, so `--font-mono` falls back to the system mono stack.**
- **Dark mode:** `next-themes`, `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange`; login and shell both expose a Light/Dark/Match system menu; the shell icon swaps via `dark:` classes.
- **Static assets:** only `src/app/icon.svg` (favicon, teal rounded square with flow lines). No `public/` directory in the source.

---

## 6. Dependencies used by the source but not installed in `uae-web`

| Dependency | Used for | Fallback |
| --- | --- | --- |
| `next` | App Router, metadata, fonts, links, navigation, route handlers, middleware | Removed entirely (Vite/React/React Router equivalents) |
| `next-themes` | Theme persistence and system preference | **Local theme provider** (context + `localStorage` + `matchMedia` + pre-paint inline script in `index.html`) |
| `@tailwindcss/turbopack` | Next/Turbopack CSS loader | `@tailwindcss/vite` (already installed) |
| IBM Plex Sans / Mono (`next/font/google`) | Fonts | Plus Jakarta Sans (required); system mono stack |

Everything else (`@base-ui/react`, `@tanstack/react-query`, `class-variance-authority`, `cn`, `lucide-react`, `tw-animate-css`) is already installed at compatible versions.

Missing shadcn components in `src/components/ui/`: `badge`, `separator` — **unused by the source**, so no local replacement is needed.

---

## 7. Gaps and risks

1. **Server session routes cannot be ported.** Next.js route handlers own the HttpOnly refresh cookie and CSRF header. A browser-only SPA cannot set HttpOnly cookies or hold the refresh token safely.
   *Proposed fallback (needs confirmation):* call `POST /api/v1/auth/login|refresh|logout` directly through `api-client`, keep the access token in memory and persist the refresh token in `localStorage` so a reload can restore the session. This changes token storage (XSS exposure) and is recorded as a deviation. Alternative: require a same-origin BFF/proxy that implements the existing `/api/session/*` contract, leaving this app's code identical to the source in that regard.
2. **No backend CORS.** The backend has no `CORSMiddleware`, so the browser cannot call it cross-origin.
   *Proposed fallback (needs confirmation):* call same-origin `/api/v1/*` and add a Vite dev proxy (`/api` → `VITE_API_BASE_URL`). Production then needs the same reverse-proxy rule. This is a small `vite.config.ts` change, which `AGENTS.md` allows only when unavoidable.
3. **`middleware.ts` guard.** Replaced by the existing `SessionGate` (client-side) plus a `/login` route. Because a SPA cannot read an HttpOnly cookie before paint, the redirect happens after a session refresh attempt; the source's "Opening Rheo" state covers this gap.
4. **Metadata.** Per-page `<title>` elements rendered by React 19 replace `metadata`. Root title template `%s | Rheo` is reproduced per page.
5. **Missing error / not-found pages in the source.** Next.js defaults apply.
   *Proposed fallback:* a catch-all route with the standard "404" wording and a route `errorElement` with neutral recovery copy. Copy is **a guess** because the source defines none; flagged for approval.
6. **Font deviation is mandated by `AGENTS.md`** (Plus Jakarta Sans) while the source uses IBM Plex Sans/Mono. Typography will not be pixel-identical; the type scale, weights, spacing, and mono usage are preserved. The source's `font-mono` contexts will use the platform mono font.
7. **`Suspense` wrappers** around `useSearchParams` consumers are unnecessary in React Router (search params are synchronous). Route-level code splitting keeps the same loading behavior.
8. **Deep links / refresh.** A Vite SPA needs an SPA fallback rewrite in production. Not code; flagged for deployment.
9. **`useSyncExternalStore` server snapshot** is not needed client-side; one store module still exposes the same snapshot shape.
10. **Query key `["service", id]` helper** (`useService`) is unused in the source; it will be omitted to avoid dead code. Query invalidation still targets `["services"]` only where the source did.

### Deliberate source-derived UI adjustments

The source modified three existing shadcn components to use the `--overlay` token (`bg-overlay` instead of `bg-black/10`) for dialog, alert-dialog, and sheet backdrops. The target's copies are stock. To preserve visual parity, those three class strings will be aligned to the source (`bg-overlay`), and this note records the reason. No other `components/ui` file changes are planned.

---

## 8. Environment check for `uae-web` (baseline)

`npm run build` and the existing template pass at audit time. Import resolution:

| File | Import | Status |
| --- | --- | --- |
| `src/lib/utils.ts` | `cn` package (`0.5.2`) | resolves |
| `src/components/ui/*` | `@base-ui/react/*` (`1.9.0`), `cn`, `class-variance-authority`, `lucide-react` | resolves |
| `src/index.css` | `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`, `@fontsource-variable/geist` | resolves |
| `src/main.tsx` | `react`, `react-dom/client` | resolves |

No unresolved imports. Notes:
- `src/lib/utils.ts` re-exports `cn` from the `cn` package. This is the existing shadcn baseline; application code will import `@/lib/utils` only.
- `index.css` currently imports Geist and sets `--font-sans` to Geist. It will be replaced with Plus Jakarta Sans and the source tokens.
- Starter template files (`src/App.tsx`, `src/assets/*`, `public/icons.svg`) are unused after the port and will be removed.

---

## 9. Final target structure

```
src/
├── main.tsx                      # Plus Jakarta Sans + index.css, <App />
├── index.css                     # ported Rheo Flow tokens + base styles
├── app/
│   ├── app.tsx                   # Providers > AuthProvider > RouterProvider
│   ├── providers.tsx             # theme, QueryClient, TooltipProvider
│   ├── router.tsx                # lazy page routes, guard layouts, catch-all
│   ├── route-error.tsx
│   └── route-loading.tsx
├── pages/
│   ├── dashboard/dashboard-page.tsx
│   ├── services/services-page.tsx
│   ├── requests/{requests-page,new-request-page,request-detail-page}.tsx
│   ├── approvals/approvals-page.tsx
│   ├── jobs/jobs-page.tsx
│   ├── login/login-page.tsx
│   └── not-found/not-found-page.tsx
├── features/
│   ├── auth/                     # AuthProvider, login form, flow field
│   ├── dashboard/                # needs-action, pipeline/recent, jobs, activity, sample activity
│   ├── services/                 # catalog query + table + filters
│   ├── requests/                 # queries/mutation, table/pipeline/timeline, new-request hook+form, detail panels
│   ├── approvals/                # sample data, queue, decision panel, hook
│   ├── jobs/                     # sample data, job table/detail, hook
│   └── notifications/            # sample notifications
├── components/
│   ├── ui/                       # existing shadcn + split button-variants
│   ├── layout/                   # app-shell, layouts, session-gate, sidebar, palette, menus
│   ├── common/                   # panel, states, badges, copy button, logo
│   └── theme/                    # local theme provider, context, toggle
├── hooks/use-session.ts
├── lib/
│   ├── api-client.ts
│   ├── api-errors.ts
│   ├── auth-session.ts
│   ├── query-client.ts
│   ├── format.ts
│   └── utils.ts
├── config/env.ts
├── types/api.ts
public/
└── icon.svg                      # copied from source app/icon.svg (same URL)
```

### Route table

```
/login                        LoginPage                     (public)
/                             AppLayout > DashboardPage     (SessionGate + shell)
/services                     AppLayout > ServicesPage
/requests                     AppLayout > RequestsPage
/requests/new                 AppLayout > NewRequestPage
/requests/:requestId          AppLayout > RequestDetailPage
/approvals                    AppLayout > ApprovalsPage
/jobs                         AppLayout > JobsPage
*                             SessionLayout > NotFoundPage  (guarded, no shell)
errorElement                  RouteError
```

---

## 10. Route-by-route parity checklist

Verified with headless Chrome 158 against a temporary mock backend (no repository files were added for this).

- [x] `/` — page header, sample-data tooltips, needs-action rows, stage counts (partial-count copy), recent requests table, recent jobs, recent activity, links
- [x] `/services` — total count, search, category filters, no-match empty state + clear action, request links, truncation notice
- [x] `/requests` — table, relative/absolute timestamps, pagination summary, previous/next disabled states, empty and invalid-page states
- [x] `/requests/new` — `?service=` preselect, validation messages and focus, optional details/specs, 64 KB guard, backend error mapping, success redirect to `?created=1`
- [x] `/requests/:id` — skeleton, not-found state, created notice, timeline variants, request-data rendering, copy ID, missing-history notice
- [x] `/approvals` — pending/decided filter counts, selection highlight, reject-without-comment validation + focus, approve/reject confirm dialogs, local decision notice
- [x] `/jobs` — selection, status/type/log rendering, run/cancel confirmation copy, local state transitions, notice
- [x] `/login` — reason messages (`expired`, `signed_out`, `unavailable`), field validation and focus, password visibility, API error mapping, safe `next` redirect, flow background + reduced-motion path
- [x] 404 — neutral copy, guarded, no shell; route error boundary for render failures
- [x] Responsive — 1440px and true 390px viewport (CDP emulation). No page-level horizontal overflow; wide tables scroll inside their panel.
- [x] Light and dark themes — both rendered with the ported tokens; theme menu switches and persists.
- [x] Keyboard — skip link, Ctrl/Cmd+K palette (open, filter, arrow/enter), dialog escape, visible focus ring, form error focus.

---

## 12. Verification results

Run on 2026-11-25:

- `npm run lint` — **passes**, no errors or warnings.
- `npm run build` (`tsc -b && vite build`) — **passes**.
- Leftover search — no `next/*` imports, `"use client"`/`"use server"` directives, `process.env`, `NEXT_PUBLIC_*`, `any`, or `console.*` in `src/`.
- Dependency files — no install/add/remove/upgrade commands were run and neither `package.json` nor `package-lock.json` was edited during this task. `git status` shows **pre-existing** uncommitted changes to those files from the starter/setup state, not from this migration.
- `../uae-frontend` — `git status` clean; nothing was modified.
- Runtime smoke tests (temporary mock backend on `127.0.0.1:8000`, Vite proxy):
  - all 8 pages render with mock data in light and dark themes;
  - command palette opens by click and Ctrl+K, filters results, and keyboard focus is in the search input;
  - job cancel confirmation opens with the expected copy;
  - new-request validation focuses the summary field, and a successful create navigates to `/requests/<id>?created=1` with the success notice;
  - service search shows the no-match state;
  - reject-without-comment focuses the textarea and shows the reason error;
  - unauthenticated `/requests?page=2` redirects to `/login?next=%2Frequests%3Fpage%3D2&reason=unavailable`;
  - unknown URL renders the guarded 404.

---

## 13. Final deviations and fallbacks

| Area | Deviation / fallback | Why |
| --- | --- | --- |
| Font | Plus Jakarta Sans instead of IBM Plex Sans; system mono stack instead of IBM Plex Mono | Required by `AGENTS.md`; IBM Plex fonts are not installed and cannot be added |
| Theme | Local `ThemeProvider` instead of `next-themes` | Package not installed; behavior matches (`theme` key, class strategy, system default, pre-paint script, no transition flash) |
| Session | Direct `/api/v1/auth/*` calls with `credentials: "include"`; no `/api/session/*` routes | Server routes cannot exist in a static SPA. Requires the backend cookie changes listed in section 11 |
| Username | Non-secret display hint in `localStorage` (`rheo.username`) | The source read an HttpOnly `rheo_user` cookie; the agreed response has no username. Backend change listed in section 11 |
| Auth guard | `AuthProvider` + `SessionGate` instead of `middleware.ts` | SPA cannot read HttpOnly cookies before the app loads; the optimistic redirect now happens after the silent refresh attempt |
| 404 / error | Neutral copy defined in the target | Source had no `not-found.tsx`/`error.tsx`; approved wording |
| Unused helpers | Source `getService`/`useService` endpoints omitted | No page used them; avoids dead code |
| `Suspense` | Removed around `useSearchParams` consumers | React Router search params are synchronous; lazy routes provide code splitting |
| `components/ui/button.tsx` | `buttonVariants` moved to `button-variants.ts` | `react-refresh/only-export-components` lint rule. No visual change; app imports updated |
| `components/ui/*` | Overlay classes aligned to the source (`bg-overlay`), `cn` imported via `@/lib/utils`, `"use client"` directives removed | Source parity and the repository's import/directive rules. No style values changed otherwise |
| Tooling | `vite.config.ts` gains a `/api` dev proxy and uses `import.meta.dirname` | Required for the CORS-less backend; approved. No other config changed |
| Assets | `public/icon.svg` copied from `src/app/icon.svg` | Same URL (`/icon.svg`) and favicon artwork |
| Deployment | SPA fallback + `/api` reverse proxy required | Outside this repository; nginx example in `README.md` |

Open items requiring the backend or deployment owner:

1. Implement the cookie contract in section 11 (login/refresh/logout) and remove `refresh_token` from response bodies.
2. Return `username` from login **and** refresh, or add `GET /api/v1/me`, so the shell can show the account after a silent refresh without the local hint.
3. Production nginx: serve `index.html` for unknown paths and proxy `/api` to FastAPI; HTTPS is required for `Secure` cookies.

---

## 11. Decisions confirmed by the owner (Phase 0 review)

1. **Auth:** direct calls to `/api/v1/auth/*` through a same-origin proxy. Access token in memory only. Refresh token stays in an `HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth` cookie set by the backend. All requests use `credentials: "include"`. One shared in-flight refresh on 401, then retry; refresh failure clears auth and sends the user to `/login`. Silent refresh on app load. No `localStorage`/`sessionStorage` token fallback.
2. **Vite dev proxy:** approved. `/api` is proxied to the FastAPI backend in development; production nginx serves the SPA and proxies `/api`.
3. **404 / error copy:** neutral wording approved.
4. **Font:** Plus Jakarta Sans per `AGENTS.md`; system mono stack for technical data.

### Backend changes required by the chosen auth contract

The backend currently returns `refresh_token` in the response body for login/refresh and requires it in the request body for refresh/logout (`app/routers/auth.py`, `app/schemas/auth.py`). The frontend is written against the agreed cookie contract, so the following backend work is required for sign-in to function. These are **not implemented here** (`uae-backend` is read-only for this task):

1. `POST /api/v1/auth/login`
   - Keep `{access_token, expires_in}` in the response body (the current `TokenResponse` also exposes `refresh_token`; that field must be removed from the response).
   - Set `refresh_token` as `HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth` with `Max-Age=refresh_token_expires_in`.
   - Continue creating the user + base `requester` role on first successful login.
2. `POST /api/v1/auth/refresh`
   - Take no request body; read the refresh token from the cookie instead.
   - Rotate the refresh token and set the new cookie with the same attributes.
   - Return `{access_token, expires_in}`.
3. `POST /api/v1/auth/logout`
   - Take no request body; read the cookie, revoke that refresh-token family, and expire the cookie (`Max-Age=0`, same path/attributes).
   - Keep returning `204`.
4. All auth cookie responses need the frontend origin in the CORS/CSRF policy **only if** a separate origin is ever used. With the agreed same-origin proxy, `SameSite=Lax` is sufficient and no CORS change is needed.
5. To restore the username after a silent refresh (the source read it from a `rheo_user` cookie), either return `username` in the login **and** refresh bodies, or add `GET /api/v1/me`. Until then the UI persists the username as a non-secret display hint in `localStorage` (`rheo.username`); it is never used for authorization.

### Other confirmed deviations

- Typography uses Plus Jakarta Sans instead of IBM Plex Sans/Mono.
- `next-themes` is replaced by a local theme provider that follows the same `theme` key, `class` attribute, and system default.
- The catch-all and route-error pages use minimal neutral copy because the source defines none.
- `vite.config.ts` gains a development `/api` proxy and uses `import.meta.dirname`. These are the only tooling changes.
