# Klyro

Klyro is a scheduling platform for any appointment-based business — barbershops, salons, spas, fitness trainers, pet groomers, tattoo studios, car washes, and more. Owners share a link; clients book; automatic WhatsApp/email confirmation fires instantly. No marketplace, no commission per appointment. Your business. Your clients. Your brand.

A product of **BridgeStack Dev**.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js (latest) — App Router, React Server Components |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first, `@theme` tokens in `globals.css`) |
| Components | shadcn/ui (base-nova style, wired to Klyro tokens) |
| Database | Supabase Postgres + Row-Level Security |
| Auth | Supabase Auth (Google, Apple, Magic Link) |
| Messaging | Meta WhatsApp Cloud API · Twilio SMS · Resend Email |
| i18n | next-intl (es default, en secondary) |
| Analytics | PostHog · Vercel Analytics · Speed Insights · Sentry |
| Testing | Vitest (unit) · Testing Library (component) · Playwright (E2E) |

All dependencies installed with `@latest`. Reproducibility is guaranteed by `pnpm-lock.yaml`.

---

## Prerequisites

- **Node.js 22 LTS** or higher (`node -v` → use `nvm install 22` or Volta if needed)
- **pnpm 11+** (`npm i -g pnpm` or `corepack enable`)
- A **Supabase** project (free tier works for dev)

---

## Setup

```bash
# 1. Clone
git clone https://github.com/your-org/klyro.git
cd klyro

# 2. Install
pnpm install

# 3. Environment
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# and SUPABASE_SERVICE_ROLE_KEY at minimum.

# 4. Run migrations
# Open your Supabase project > SQL Editor, then run each file in order:
#   supabase/migrations/0001_init.sql
#   supabase/migrations/0002_rls_policies.sql
#   supabase/migrations/0003_message_templates.sql
#   supabase/migrations/0004_pg_cron_reminders.sql
# — OR via CLI if you have it set up:
pnpm dlx supabase@latest db push

# 5. (Optional) Generate fresh TypeScript types from Supabase
pnpm dlx supabase@latest gen types typescript --project-id <your-project-id> > src/types/database.ts

# 6. Start dev server
pnpm dev
# → http://localhost:3000 (redirects to /es by default)
```

---

## Available scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Start dev server at localhost:3000 |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm typecheck` | TypeScript type check (`tsc --noEmit`) |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit/component tests |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:e2e` | Playwright E2E tests |

---

## Brand & design system

**Design tokens** live in one file: `src/app/globals.css` — the `@theme` block defines the full Klyro palette (Violet `#6D64FB` + Navy `#14143A` and all derived tokens). Never hardcode hex values in components; always use `var(--color-*)` or Tailwind utility classes.

**The logo** is a single component: `src/components/shared/Logo.tsx`. It exports three variants (`mark`, `wordmark`, `lockup`) and two themes (`dark`, `light`). Use this component everywhere — never reference brand SVGs or images directly in application code. Static SVG exports for email/press are in `public/brand/`.

---

## Vertical registry

The multi-vertical engine lives in `src/lib/verticals/registry.ts`. Each vertical profile defines default services, message tone, and booking-page nouns. Adding a new vertical = adding one entry to this file. No DB migration needed (`businesses.vertical` is free-form text, not a Postgres enum).

---

## Keeping dependencies up to date

```bash
# See what's outdated
pnpm outdated

# Apply patch + minor updates
pnpm up

# Apply major version upgrades (review breaking changes first!)
pnpm up --latest

# Audit for security issues
pnpm audit
```

Next.js receives frequent security patches — apply patch upgrades immediately.

---

## Further reading

- **Full technical spec:** `Klyro_Technical_PRD.md`
- **Bootstrap prompt:** `PROMPT_CLAUDE_CODE_BOOTSTRAP.md`
- Supabase docs: https://supabase.com/docs
- next-intl docs: https://next-intl.dev
- shadcn/ui docs: https://ui.shadcn.com
