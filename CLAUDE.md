# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Velais Client Dashboard — a full-stack sprint management app that fetches Azure DevOps work items and displays them in an interactive dashboard (Kanban, table, and analytics views). Uses WorkOS for authentication and Hono for the backend API.

## Commands

```bash
bun install                    # Install dependencies
bun run dev                    # Run client (:5173) + server (:3001) concurrently
bun run dev:client             # Vite dev server only
bun run dev:server             # Hono backend only (bun --watch)
bun run build                  # tsc --noEmit && vite build
bun run lint                   # biome check .
bun run format                 # biome check --fix .
```

## Architecture

**Tech stack:** React 19 + TypeScript + Vite + Tailwind CSS 4 + TanStack React Query + GSAP | Hono backend | Bun runtime

### Directory Layout

- `src/` — React client app
  - `components/ui/` — shadcn-style primitives (card, chart, Avatar, Badge, Skeleton, input, select, tooltip, scroll-area, table)
  - `components/kanban/` — Kanban board (Board → Column → Card)
  - `components/table/` — Table view with filters (StoriesTable, Filters)
  - `components/analytics/` — Recharts charts (StateBreakdown, AssigneeBreakdown); loaded lazily via `React.lazy()`
  - `components/layout/` — Shell wrapper (sticky header, project name, sign-out button, cascade animation) and SprintHeader
  - `components/team/` — Team member display; `MemberCard` renders name, initials avatar, story count, and points progress
  - `components/Loader.tsx` — Branded full-screen loading overlay; animated SVG logo with diagonal fill progress + shimmer sweep; shown while WorkOS auth resolves
  - `components/LoginPage.tsx` — Branded login page; GSAP timeline animates logo, wordmark, divider, subtitle, button, and footer in sequence
  - `hooks/` — `useStories`, `useSummary` (React Query wrappers), `useCascadeAnimation` (GSAP page-entry hook)
  - `lib/gsap.ts` — GSAP singleton: registers `CustomEase`, defines `"snappy"` ease preset, re-exports `gsap` and `useGSAP`
  - `lib/logo.ts` — Shared `LOGO_PATH` and `LOGO_VIEWBOX` SVG constants used by Loader and LoginPage
  - `lib/api.ts` — API client; injects Bearer token via `setGetAccessToken`; redirects to `/` on 401
  - `lib/query-client.ts` — React Query client config: 10-min stale time, 30-min GC time, no refetch on focus, 2 retries
  - `lib/constants.ts` — `STATE_COLORS`, `PRIORITY_COLORS`, `STATE_ORDER` (typed against shared types)
  - `lib/utils.ts` — `cn()` helper (clsx + twMerge)
  - `lib/chart-colors.ts` — Recharts color palette
- `server/` — Hono backend
  - `dev.ts` — Development entry point; validates required env vars at startup, then dynamically imports `app.ts`; runs on `PORT` env var or 3001
  - `app.ts` — Hono app root; registers logger, health routes, `authMiddleware`, `cacheMiddleware()`, and sub-routers; global error handler
  - `middleware/auth.ts` — WorkOS JWT verification via JWKS; health routes bypass auth; sets `tenant` and `userId` on Hono context; returns 403 for unknown orgs
  - `middleware/cache.ts` — In-memory GET cache; 10-min TTL, ETag + `If-None-Match` support, `Cache-Control: private, max-age=600`; two-pass LRU eviction (expire → oldest single entry) at 500 entries; cache key is `{tenantSlug}:{pathname}:{search}`
  - `routes/stories.ts` — Fetches current iteration → WIQL → work item details → transforms; returns `ClientStory[]`
  - `routes/summary.ts` — Same fetch chain as stories; calls `buildSummary`; returns `SprintSummary`
  - `routes/iterations.ts` — Fetches current iteration only; calls `buildIterationInfo`; returns `IterationInfo`
  - `services/azure-devops.ts` — Azure DevOps WIQL client; 30s `AbortController` timeout per request; WIQL injection escaping via `wiqlEscape()`; 200-item batch limit for work item details; structured `[azure]` log lines on error
  - `services/transform.ts` — `transformWorkItem()` (AzureWorkItem → ClientStory), `buildSummary()` (stories + iteration metadata → SprintSummary including `teamMembers`), `buildIterationInfo()` (iteration → IterationInfo)
  - `tenants.ts` — `TenantConfig` (`slug`, `project`, `team`); `tenantMap` (orgId → config); `resolveTenant(orgId)`
- `shared/` — Types and utilities shared between client and server
  - `types/index.ts` — `ClientStory`, `SprintSummary`, `StoryState`, `Priority`, `AssigneeSummary`, `TeamMember`, `IterationInfo`
  - `utils.ts` — `getInitials(name)` — splits display name and returns up to 2 uppercase initials
- `api/[[...route]].ts` — Vercel edge function catch-all (proxies to Hono app)

### Application Render Phases

`App.tsx` renders in three sequential phases:

1. **`<Loader>`** — shown while `authLoading` is true; calls `onComplete` after its exit animation, which sets `showLoader = false`
2. **`<LoginPage>`** — shown when `!user`; calls `onSignIn` → WorkOS `signIn()`
3. **`<AuthenticatedShell>`** — fetches `summary`, passes `summary?.projectName` to `Shell`; header displays project name with fallback "Client Dashboard"

### Data Flow

```
React hooks (useStories/useSummary)
  → React Query (10-min stale time, 30-min GC)
    → /api/* endpoints
      → Auth middleware (WorkOS JWT, sets tenant + userId)
        → Cache middleware (hit → 304 or cached JSON with ETag)
          → Azure DevOps API (WIQL queries, 30s timeout, 200-item batches)
            → Transform service (normalize states/priorities, build summaries)
```

### State and Priority Mapping

`STATE_MAP` in `transform.ts` normalizes Azure DevOps states to `StoryState`:

| Azure State | StoryState |
|---|---|
| New, To Do | Planned |
| Active, In Progress | In Progress |
| Resolved, QA, In Review | In Review |
| Closed, Done, Completed | Completed |
| Blocked | Blocked |

`PRIORITY_MAP`: 1 → Critical, 2 → High, 3 → Medium, 4 → Low; absent/null → Unset.

Unknown Azure states default to `"Planned"`.

### Multi-Tenancy

Org ID from JWT maps to `TenantConfig` in `server/tenants.ts` (`slug`, `project`, `team`). Cache keys are `{slug}:{pathname}:{search}` to prevent cross-tenant data leaks.

### React 19 Patterns

- **`Activity`** — Both Kanban and Table views are rendered inside `<Activity mode="visible"|"hidden">`. This keeps both views mounted, preserving state and avoiding remount cost on switch.
- **`startTransition`** — View toggle calls `startTransition(() => setView(newView))` to deprioritize the re-render and keep the UI responsive.
- **`React.lazy()` + `Suspense`** — Analytics components (`StateBreakdown`, `AssigneeBreakdown`) are code-split. Each is wrapped in `<Suspense fallback={<Skeleton />}>`.

### GSAP Animation Patterns

- **Import GSAP exclusively from `@/lib/gsap.ts`** — never import directly from `gsap` or `@gsap/react` in components.
- **`useCascadeAnimation(enabled: boolean)`** — returns a `containerRef`; when `enabled`, runs a GSAP timeline targeting `[data-gsap="<role>"]` elements within scope. Roles: `header`, `title`, `subtitle`, `stat-cell`, `section-label`, `card`.
- **Attribute convention:** mark animated elements with `data-gsap="<role>"` on the DOM element itself.
- **CSS:** `[data-gsap] { will-change: transform, opacity }` is set globally in `index.css` for compositing layer promotion.
- **LoginPage:** uses `data-login="<role>"` attributes (logo, wordmark, divider, subtitle, button, footer) and starts elements as `invisible` (Tailwind), relying on GSAP `autoAlpha` to reveal them.

### Typography

- **`font-heading`:** Onsite Extended — self-hosted WOFF2/WOFF in `src/fonts/`
- **`font-body` / `font-mono`:** Host Grotesk — loaded from Google Fonts CDN in `index.css`

### Path Aliases

- `@/*` → `./src/*`
- `@shared/*` → `./shared/*`

### Key Patterns

- **Formatting:** Biome with 2-space indent, double quotes
- **Styling:** Tailwind utilities + `cn()` helper (clsx + twMerge)
- **shadcn UI:** New York style, configured via `components.json`
- **API auth:** Bearer token in Authorization header, verified via WorkOS on every request (health routes exempt)
- **Error flow:** API 401 → `window.location.href = "/"` on client; Azure errors → 502; unknown org → 403
- **Table filtering:** client-side, computed via `useMemo`; supports state, assignee, and free-text search across title + tags; sorting by state, assignee, or priority
- **Shared utilities:** Always import `getInitials` from `@shared/utils` — it is used by both `transform.ts` (server) and any client component that needs initials

### Environment Variables

See `.env.example`. Required: `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `VITE_WORKOS_CLIENT_ID`, `AZURE_DEVOPS_ORG`, `AZURE_DEVOPS_PAT`. The dev server (`server/dev.ts`) validates these at startup and exits with a clear message if any are missing.

### Deployment

Vercel — `vercel.json` rewrites `/api/*` to the Hono edge function and `/*` to the Vite-built frontend.
