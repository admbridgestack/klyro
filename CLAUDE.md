# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the `klyro/` subdirectory:

```bash
cd klyro
pnpm dev           # start dev server (Next.js with Turbopack)
pnpm build         # production build
pnpm typecheck     # tsc --noEmit
pnpm lint          # eslint
pnpm test          # vitest run (unit + component)
pnpm test:watch    # vitest in watch mode
pnpm test:e2e      # playwright e2e tests
```

**Database migrations:**
```bash
pnpm dlx supabase@latest db push   # push local migrations to remote
pnpm dlx supabase@latest gen types typescript --project-id ouexfehqxpgewzgytjgc > src/types/database.ts
```

**Node:** ≥22 LTS. **Package manager:** pnpm (pinned in `packageManager` field). Never use npm or yarn.

## Architecture Overview

### App structure
The Next.js App Router lives in `klyro/src/app/[locale]/` — every route is locale-prefixed (default `es`, secondary `en`). Three route groups:
- `(auth)/` — login, signup, OAuth callback
- `(dashboard)/` — protected owner/staff views (dashboard, agenda, team, branches, services, settings, links)
- `(booking)/[businessSlug]/[branchSlug]/[staffSlug]/` — public booking flow (Phase 3, not yet built)

### Middleware (`src/middleware.ts`)
Runs on every non-static request. Handles three concerns in order:
1. Supabase session refresh (must run before any auth check)
2. Auth guard — unauthenticated requests to dashboard paths redirect to `/[locale]/login`
3. next-intl locale routing

### Multi-tenant isolation
All business data is scoped by `business_id`. Supabase Row-Level Security (RLS) policies in `supabase/migrations/0002_rls_policies.sql` enforce isolation at the DB level — owners see all of their business, staff see only their own appointments. **RLS is the authorization boundary; there is no separate API auth layer.**

### Vertical registry (`src/lib/verticals/registry.ts`)
The core of the multi-vertical system. Eight verticals (`barbershop`, `salon`, `fitness`, `spa`, `tattoo`, `carwash`, `petgrooming`, `other`) are defined as plain TypeScript objects — not DB enums. Adding a new vertical is a code-only change. The registry drives:
- Wizard defaults (services, durations, buffer time)
- Booking page copy (`appointmentNoun`, `staffNoun`, `serviceNoun` per locale)
- Message template selection by `(vertical, language, channel, type)`

### Database (Supabase project: `ouexfehqxpgewzgytjgc`)
12 tables: `businesses`, `branches`, `users`, `staff`, `staff_branches`, `services`, `branch_services`, `staff_availability`, `clients`, `appointments`, `messages`, `message_templates`. Migrations in `supabase/migrations/`. Types generated into `src/types/database.ts`.

`pg_cron` runs `dispatch-due-messages` every 5 minutes — selects pending messages where `scheduled_at <= now()` and invokes the Edge Function.

### Supabase clients
Three clients, each for a different runtime context:
- `src/lib/supabase/client.ts` — browser (singleton)
- `src/lib/supabase/server.ts` — Server Components and Server Actions (creates a new client per call)
- `src/lib/supabase/middleware.ts` — middleware only

### Auth
Three providers via Supabase Auth: Google OAuth (primary), Apple Sign-In, Magic Link (email). `src/lib/actions/auth.ts` contains server actions for each. The OAuth callback route is `src/app/[locale]/(auth)/callback/route.ts`. A DB trigger (`0005_auth_trigger.sql`) auto-creates a `public.users` row on signup.

### i18n
`next-intl` with `src/i18n/config.ts` and `src/i18n/routing.ts`. All UI strings live in `src/i18n/locales/es.json` and `en.json` — never hardcode display text in components.

### Design system
All color tokens are CSS custom properties defined in `src/app/globals.css` via Tailwind v4 `@theme`. **Never reference hex values or raw colors in components** — always use token names (`bg-violet`, `bg-bg-base`, etc.). Two brand anchors: Klyro Violet `#6D64FB` and Klyro Navy `#14143A`. Dark mode is the default for the dashboard; public booking page may use light tokens.

`src/components/shared/Logo.tsx` is the single source of truth for all logo rendering (three variants: `mark`, `wordmark`, `lockup`). Never use `<img>` for the logo.

shadcn/ui primitives are in `src/components/ui/` and are customized to consume Klyro tokens.

### Env vars
Validated at startup by Zod in `src/lib/env.ts`. Adding a new env var requires updating both `.env.example` and `src/lib/env.ts`. Separate client-safe (`NEXT_PUBLIC_*`) and server-only schemas.

## Build phases (current status)

| Phase | Status |
|-------|--------|
| 0 — Foundation | ✅ Done |
| 1 — Auth & Onboarding Shell | 🟡 Built, needs smoke test |
| 2 — Setup Wizard (12-step) | ⬜ Next up |
| 3 — Public Booking Flow | ⬜ |
| 4 — Messaging Engine | ⬜ |
| 5–8 | ⬜ |

See `STATUS.md` for smoke test checklist and detailed phase notes. See `Klyro_Technical_PRD.md` for the full spec.

## Key constraints

- `businesses.vertical` is a plain `text` field referencing keys in the registry — not a DB enum. Never create a migration to make it an enum.
- Message templates are selected by `(type, channel, language, vertical)` — the unique index on `message_templates` enforces this.
- 84 templates seeded (7 active verticals × 2 channels × 2 languages × 3 message types).
- Dashboard is dark-mode only in v1. No light/dark toggle for the dashboard.
- JetBrains Mono is only for booking confirmation codes. Inter everywhere else.
