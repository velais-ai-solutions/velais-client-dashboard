# Velais Client Dashboard

A full-stack sprint management dashboard that connects to Azure DevOps and displays work items across Kanban, table, and analytics views. Features a branded loading experience and animated login page.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, TanStack React Query, Recharts, GSAP
- **Backend:** Hono, WorkOS (auth), Azure DevOps API
- **Runtime:** Bun
- **Deployment:** Vercel (edge functions)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- A [WorkOS](https://workos.com/) account with AuthKit configured
- An Azure DevOps organization with a Personal Access Token (PAT)

### Setup

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd velais-client-dashboard
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Create a `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

4. Fill in the required environment variables:

   | Variable | Description |
   |---|---|
   | `WORKOS_API_KEY` | WorkOS API key (server-side) |
   | `WORKOS_CLIENT_ID` | WorkOS client ID (server-side) |
   | `VITE_WORKOS_CLIENT_ID` | WorkOS client ID (client-side) |
   | `AZURE_DEVOPS_ORG` | Azure DevOps organization name |
   | `AZURE_DEVOPS_PAT` | Azure DevOps Personal Access Token |

5. Start the development servers:

   ```bash
   bun run dev
   ```

   This starts the Vite client on `http://localhost:5173` and the Hono API server on `http://localhost:3001`.

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Run client + server concurrently |
| `bun run dev:client` | Vite dev server only |
| `bun run dev:server` | Hono backend only (with watch) |
| `bun run build` | Type-check and build for production |
| `bun run preview` | Preview the production build |
| `bun run lint` | Lint with Biome |
| `bun run format` | Auto-format with Biome |

## Project Structure

```
src/                  React client
  components/
    ui/               shadcn-style primitives (card, chart, Avatar, Badge, Skeleton, etc.)
    kanban/           Kanban board (Board, Column, Card)
    table/            Table view with filters (StoriesTable, Filters)
    analytics/        Charts (StateBreakdown, AssigneeBreakdown) — code-split via React lazy()
    layout/           Shell (sticky header, project name, sign-out) and SprintHeader
    team/             Team member display (MemberCard)
    Loader.tsx        Branded full-screen loading overlay with animated SVG logo
    LoginPage.tsx     Branded login page with GSAP entrance animations
  hooks/
    useStories.ts     React Query wrapper for stories
    useSummary.ts     React Query wrapper for sprint summary
    useCascadeAnimation.ts  GSAP page-entry cascade animation hook
  lib/
    gsap.ts           GSAP singleton: registers CustomEase, exports gsap + useGSAP
    logo.ts           Shared SVG viewBox and path constants for the Velais logo
    api.ts            API client with Bearer token injection
    query-client.ts   React Query client (10-min stale time, 30-min GC time)
    constants.ts      STATE_COLORS, PRIORITY_COLORS, STATE_ORDER
    utils.ts          cn() helper (clsx + twMerge)
    chart-colors.ts   Recharts color palette

server/               Hono backend
  dev.ts              Dev entry point — validates required env vars, starts Bun server
  app.ts              Hono app: health routes, auth + cache middleware, route registration
  middleware/
    auth.ts           WorkOS JWT verification; extracts tenant + userId from claims
    cache.ts          In-memory cache (10-min TTL, ETag, two-pass LRU at 500 entries)
  routes/             stories, summary, iterations endpoints
  services/
    azure-devops.ts   Azure DevOps WIQL client (30s timeout, 200-item batch, WIQL escaping)
    transform.ts      Work item → ClientStory transformation; buildSummary; buildIterationInfo
  tenants.ts          Org ID → Azure DevOps project/team/slug mapping

shared/               Types and utilities shared between client and server
  types/index.ts      ClientStory, SprintSummary, StoryState, Priority, TeamMember, IterationInfo
  utils.ts            getInitials() — derives avatar initials from a display name

api/                  Vercel edge function catch-all
```

## Application Flow

The app renders in three sequential phases on every load:

1. **Loader** — Full-screen branded overlay shown while WorkOS auth resolves. Displays an animated SVG logo with a diagonal fill progress bar and a shimmer sweep. Cycles status messages and fades out once auth is ready.
2. **Login page** — Shown if no authenticated user is found. GSAP timeline animates the logo, wordmark, divider, subtitle, sign-in button, and footer into view in sequence.
3. **Dashboard** — The authenticated shell. A cascade animation slides the header in from above and staggers the title, analytics section, view toggle, and work items into view.

Within the dashboard, the Kanban and Table views are toggled using React 19's `Activity` component, which keeps both views mounted but marks the inactive one as hidden. View transitions are wrapped in `startTransition` to keep the UI responsive. Analytics charts are loaded lazily via `React.lazy()` with `Suspense` fallbacks.

## Architecture

### Authentication

Users authenticate via WorkOS AuthKit. The backend verifies JWT tokens on every API request (except `/api/health` routes) and extracts the organization ID to determine the tenant context. Requests missing a valid token receive a 401; tokens from unknown organizations receive a 403.

### Multi-Tenancy

Each organization ID maps to an Azure DevOps project, team, and slug via `server/tenants.ts`. Cache keys are scoped per tenant to prevent data leaks. The resolved project name from `SprintSummary` is displayed in the dashboard header.

### Caching

The backend uses an in-memory cache with a 10-minute TTL. On a cache hit the server returns either a `304 Not Modified` (when the client sends a matching `If-None-Match` ETag) or the cached JSON with `ETag` and `Cache-Control: private, max-age=600` headers. When the cache exceeds 500 entries it first evicts expired entries; if still over the limit it removes the single oldest entry. The client layer uses React Query with a matching 10-minute stale time and a 30-minute garbage collection window.

### Backend Reliability

The Azure DevOps service client enforces a 30-second `AbortController` timeout on every fetch, escapes user-controlled values before WIQL string interpolation, and fetches work item details in batches of 200 (the Azure API hard limit). Structured `[route]` prefixed log lines are emitted for all significant operations and errors. A global `app.onError` handler prevents unhandled exceptions from leaking stack traces to clients.

### State and Priority Mapping

Azure DevOps work item states are normalized to `StoryState`:

| Azure State | StoryState |
|---|---|
| New, To Do | Planned |
| Active, In Progress | In Progress |
| Resolved, QA, In Review | In Review |
| Closed, Done, Completed | Completed |
| Blocked | Blocked |

Priorities map as: 1 → Critical, 2 → High, 3 → Medium, 4 → Low; unset → Unset.

### Animations

GSAP (`gsap` + `@gsap/react`) drives all motion. The `CustomEase` plugin is registered globally via `src/lib/gsap.ts` with a `"snappy"` preset. Elements that participate in page-entry animations are marked with `data-gsap="<role>"` attributes and targeted by `useCascadeAnimation`. The `[data-gsap]` CSS selector applies `will-change: transform, opacity` for compositing layer promotion. The login page uses a separate `data-login="<role>"` attribute system.

### Typography

- **Headings (`font-heading`):** Onsite Extended (self-hosted WOFF2/WOFF)
- **Body and mono (`font-body`, `font-mono`):** Host Grotesk (Google Fonts CDN)

### API Endpoints

| Endpoint | Auth required | Description |
|---|---|---|
| `GET /api/health` | No | Health check |
| `GET /api/health/azure` | No | Azure DevOps connectivity check |
| `GET /api/stories` | Yes | Fetch User Stories for the current sprint |
| `GET /api/summary` | Yes | Fetch sprint summary with state/assignee/team breakdowns |
| `GET /api/iterations` | Yes | Fetch current iteration info (dates, days remaining) |

## Deployment

Deployed on Vercel. The `vercel.json` rewrites `/api/*` to the Hono edge function and all other routes to the SPA.

## License

Private
