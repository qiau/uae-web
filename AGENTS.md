# AGENTS.md — uae-web

This file defines the standing rules for any AI agent working in this repository.
Read it fully before touching any file. When a rule here conflicts with your habits, this file wins.

## 1. Project context

- `uae-web` is a **Vite + React 19 + TypeScript** single-page app.
- It is a **faithful refactor of `uae-frontend`** (a Next.js app located next to this folder, at `../uae-frontend`).
  Goal: identical features, routes, UI, copy, and behavior, ported to a client-side React app.
- `../uae-frontend` is **read-only reference material**. Never edit, move, or delete anything inside it.
- The primary font is **Plus Jakarta Sans** (`@fontsource-variable/plus-jakarta-sans`).

## 2. Hard constraints (never violate)

1. **Do not install, add, remove, or upgrade anything.** No `npm/pnpm/yarn install`, no `npm uninstall`, no editing `package.json` or the lockfile.
2. **Do not run `npx shadcn add`** (or any shadcn CLI command that writes files). Only the shadcn components that already exist in `src/components/ui/` may be used.
3. **Do not edit `../uae-frontend`.**
4. Do not change tooling config (`vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `components.json`) unless a task cannot be done without it. If you must, make the smallest change and explain why in the final report.
5. Do not invent features, copy, endpoints, or data. If something in the source is unclear, record it in `MIGRATION_NOTES.md` and ask instead of guessing.
6. Never leave the repo in a state where `npm run build` or `npm run lint` fails.

If a task seems to require something forbidden (a missing package, a missing shadcn component, a server-only feature), **stop that piece, use the fallback in section 7, and report it**. Do not work around the constraint silently.

## 3. Available stack (use only this)

| Concern                      | Use                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------- |
| UI framework                 | `react`, `react-dom` (React 19)                                               |
| Routing                      | `react-router` (data router APIs)                                             |
| Server state / data fetching | `@tanstack/react-query` (v5)                                                  |
| Styling                      | Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`), `tw-animate-css`        |
| UI primitives                | Existing shadcn components in `src/components/ui/`, built on `@base-ui/react` |
| Variants                     | `class-variance-authority`                                                    |
| Icons                        | `lucide-react`                                                                |
| Fonts                        | `@fontsource-variable/plus-jakarta-sans` (primary)                            |
| Class merging                | the existing `cn` helper in `src/lib/utils.ts`                                |

Do **not** import from the npm package named `cn`. Always use `@/lib/utils`.
`@fontsource-variable/geist` is installed but is **not** the app font; do not use it.

Before using any API you are not 100% sure about (especially `react-router` and `@base-ui/react`), **check the installed version's type definitions in `node_modules`** instead of relying on memory. These are recent major versions and APIs differ from older tutorials.

Everything the source app does with a package that is not listed above must be replaced with native browser APIs or small local code (see section 7).

## 4. Folder structure

Use a feature-based structure. Keep route files thin; put logic in features.

```
src/
├── main.tsx                 # entry: font + css imports, render <App />
├── index.css                # Tailwind v4 entry, theme tokens, base styles
├── app/
│   ├── app.tsx              # <Providers> + <RouterProvider>
│   ├── providers.tsx        # QueryClientProvider, TooltipProvider, etc.
│   └── router.tsx           # route table (lazy-loaded pages)
├── pages/                   # route-level components (thin, compose features)
│   └── <page-name>/
│       └── <page-name>-page.tsx
├── features/                # one folder per business feature
│   └── <feature>/
│       ├── api/             # fetch functions + query/mutation hooks
│       ├── components/      # components used only by this feature
│       ├── hooks/
│       ├── types.ts
│       └── index.ts         # public API of the feature
├── components/
│   ├── ui/                  # shadcn components (do not restyle casually)
│   ├── layout/              # app shell, header, sidebar, footer
│   └── common/              # shared, app-specific building blocks
├── hooks/                   # shared hooks (use-*.ts)
├── lib/
│   ├── utils.ts             # cn helper (shadcn)
│   ├── api-client.ts        # fetch wrapper (base URL, errors, JSON)
│   └── query-client.ts      # QueryClient factory/config
├── config/
│   └── env.ts               # typed access to import.meta.env
├── types/                   # shared types
└── assets/                  # images/svg imported by code
public/                      # static files served as-is (copy from source /public)
```

Rules:

- A feature may import from `components/`, `hooks/`, `lib/`, `types/`, `config/`. **Features must not import from each other's internals**; go through the feature's `index.ts`, or lift shared code up.
- `pages/` compose features and layout. They contain almost no business logic.
- `components/ui/` is for shadcn only. App-specific components go in `components/common/` or inside a feature.

## 5. Code standards

**TypeScript**

- Strict typing. **No `any`**; use `unknown` and narrow. No non-null assertions (`!`) except for the `getElementById("root")` call in `main.tsx`.
- `tsconfig` enables `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`. So:
  - use `import type { ... }` for type-only imports;
  - **no `enum`, no `namespace`, no constructor parameter properties** (use union types / `as const` objects);
  - remove unused variables and params.
- Prefer `type` aliases for props and data shapes; use `interface` only when extension is needed.
- Type API responses explicitly. Validate at the boundary when the source app did.

**React**

- Function components only. Named exports for components, hooks, and utils. Default export only where a lazy-loaded route requires it.
- React 19: pass `ref` as a normal prop (no `forwardRef`). Native `<title>` and `<meta>` rendered inside a component are hoisted to `<head>`; use that for per-page titles.
- Keep components small and single-purpose. Extract a hook when logic exceeds ~30 lines or is reused.
- Do not use `useEffect` for data fetching; use TanStack Query. Do not derive state in effects; compute during render.
- Keys must be stable ids, not array indexes (unless the list is static).
- Respect `react-hooks` and `react-refresh` lint rules. Do not export non-components from a component file (except inside `components/ui/`, which is allowed to).

**Naming**

- Files and folders: `kebab-case` (`user-table.tsx`, `use-debounce.ts`).
- Components and types: `PascalCase`. Functions, variables, hooks: `camelCase`, hooks start with `use`.
- Constants: `SCREAMING_SNAKE_CASE` only for true module-level constants.

**Imports**

- Use the `@/` alias for anything outside the current folder. Relative imports only within the same feature/folder.
- Order: external packages, `@/` imports, relative imports, then CSS. Let the linter/formatter decide when it complains.

**Data fetching (TanStack Query v5)**

- Object-signature API only: `useQuery({ queryKey, queryFn })`.
- Define query keys in one place per feature (a `keys` object) and export typed hooks (`useUsers`, `useCreateUser`).
- Use `isPending` / `isError` / `data` for loading and error UI. Invalidate queries after mutations.
- All HTTP goes through `src/lib/api-client.ts`; no scattered raw `fetch` calls in components.

**Styling**

- Tailwind v4 is configured in CSS (`@theme`, `@import "tailwindcss"`). There is **no `tailwind.config.js`**; do not create one.
- Reuse design tokens (colors, radius, fonts) via CSS variables from `index.css`. Do not hard-code hex colors in components.
- Compose classes with `cn(...)`. Use `cva` for components with variants.
- Set Plus Jakarta Sans as the sans font in `index.css` (`--font-sans`) and import it once in `main.tsx`.
- Mobile-first and responsive; match the source app's breakpoints and behavior.

**shadcn + Base UI**

- Components in `src/components/ui/` are built on `@base-ui/react`, not Radix. Base UI uses the **`render` prop instead of `asChild`**. Read the component source in this repo before using it.
- `Tooltip` requires `TooltipProvider` once near the root (in `app/providers.tsx`).

**Accessibility**

- Semantic HTML first. Every interactive element is keyboard reachable with a visible focus state.
- Inputs have labels; icon-only buttons have `aria-label`; images have meaningful `alt`.

**Env & config**

- `process.env.*` and `NEXT_PUBLIC_*` do not exist here. Use `import.meta.env.VITE_*`, read through `src/config/env.ts`.
- Never put secrets in client code. Document required variables in `.env.example`.

## 6. Next.js → Vite/React mapping

| Next.js (source)                                                              | Replace with (target)                                                                          |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `app/**/page.tsx`, nested folders                                             | Route entries in `src/app/router.tsx`, page components in `src/pages/`                         |
| `layout.tsx`                                                                  | Layout route component with `<Outlet />`                                                       |
| Dynamic segments `[id]`, `[...slug]`                                          | `:id`, `*`                                                                                     |
| Route groups `(group)`                                                        | Pathless layout routes                                                                         |
| `loading.tsx`                                                                 | `<Suspense>` fallback / query `isPending` skeletons                                            |
| `error.tsx`                                                                   | Route `errorElement`                                                                           |
| `not-found.tsx`                                                               | Catch-all `*` route                                                                            |
| `next/link`                                                                   | `Link` / `NavLink` from `react-router`                                                         |
| `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`, `redirect`) | `useNavigate`, `useLocation`, `useSearchParams`, `redirect` / `<Navigate>` from `react-router` |
| `next/image`                                                                  | Plain `<img>` with `width`, `height`, `loading="lazy"`, `alt`                                  |
| `next/font`                                                                   | `@fontsource-variable/plus-jakarta-sans` + `--font-sans`                                       |
| `metadata` / `generateMetadata` / `next/head`                                 | `<title>` and `<meta>` inside the page component                                               |
| `next/dynamic`                                                                | `React.lazy` + `<Suspense>`                                                                    |
| `"use client"` / `"use server"`                                               | Delete the directives                                                                          |
| Server Components, `async` components                                         | Client components + TanStack Query                                                             |
| Server Actions                                                                | Mutations via `useMutation` + `api-client`                                                     |
| `app/api/**/route.ts`                                                         | **Cannot be ported.** See section 7                                                            |
| `middleware.ts`                                                               | Route-level guards (loader that redirects) or a guard component                                |
| `process.env.NEXT_PUBLIC_X`                                                   | `import.meta.env.VITE_X`                                                                       |
| `next.config.*` rewrites/redirects                                            | Router redirects / Vite config only if unavoidable                                             |
| `public/`                                                                     | `public/` (copy as-is; same URLs)                                                              |

Use lazy loading for pages (`lazy` route property or `React.lazy`) so the initial bundle stays small.

## 7. Fallbacks when something is missing

- **Source uses a package that is not installed** (forms/validation libs, toast libs, theme libs, HTTP clients, date libs, charts): implement with native APIs (`fetch`, `FormData`, `Intl`, `Date`, controlled state, a tiny local hook). If a faithful replacement is not reasonable, build the closest simple version and list it in `MIGRATION_NOTES.md`.
- **Source uses a shadcn component that is not in `src/components/ui/`**: build a small local component in `src/components/common/` with Tailwind + `cn`, matching the shadcn look and the project's tokens. List it in `MIGRATION_NOTES.md` so the official component can be added later by the user.
- **Source has server-only logic** (API routes, DB access, secrets, SSR-only behavior): do not reimplement it in the browser. Call the real backend through `api-client` using `VITE_API_BASE_URL` if one exists; otherwise create a typed function that matches the contract and flag it clearly in `MIGRATION_NOTES.md`.
- **A needed import does not resolve** (e.g. `src/lib/utils.ts` imports a package that is not installed): do not install it. Stop, report the exact error and file, and wait.

## 8. Definition of done

A task is done only when all of these are true:

- [ ] `npm run lint` passes with no errors and no new warnings.
- [ ] `npm run build` (runs `tsc -b` then `vite build`) passes.
- [ ] No leftover Next.js imports, `"use client"` directives, or `process.env` usage.
- [ ] Every route from the source exists at the **same URL** and shows the same content and behavior.
- [ ] Loading, empty, and error states match the source.
- [ ] Layout is responsive and matches the source at mobile, tablet, and desktop widths.
- [ ] No unused files, dead code, commented-out blocks, or stray `console.log`.
- [ ] `package.json` and the lockfile are unchanged.
- [ ] `MIGRATION_NOTES.md` is up to date (deviations, fallbacks, open questions).

## 9. How to work

- Work in small, reviewable steps. After each phase, run lint and build and fix issues before continuing.
- Prefer editing existing files over creating near-duplicates.
- Match the source app's behavior first; improve structure and typing without changing behavior.
- Explain non-obvious decisions in short code comments (the _why_, not the _what_).
- When finished, give a concise report: what was ported, what deviates from the source and why, and anything that needs the user's decision.
