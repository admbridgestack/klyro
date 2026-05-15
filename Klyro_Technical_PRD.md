# Klyro — Technical Implementation PRD

**Version:** 2.0
**Date:** May 2026
**Status:** Ready for implementation
**Audience:** Claude Code / engineering team building the Klyro app from scratch

> **Versioning policy:** Always install dependencies with `@latest`. The `pnpm-lock.yaml` is committed and is the source of truth for reproducible builds.
>
> **Changelog v2.0:** Design system fully rebuilt from the real Klyro brand assets (cat mascot + wordmark). Colors, logo strategy, and typography are no longer "placeholders" — they are derived directly from `klyro.png` / `klyro_.png`. Brand owner: **BridgeStack Dev**. Everything else (multi-vertical data model, wizard, messaging engine) carries over from v1.2. Reference dependency versions refreshed to the May 2026 stable line (Next.js 16.2.x, React 19.2.x, Node 22 LTS).

---

## 0. How to use this document

This PRD tells you **what to build, in what order, and with what technical decisions**. It focuses on **execution**: stack, schema, auth, API contracts, file structure, environment, deployment, and the **brand design system**.

Build it phase by phase. Don't skip ahead. Each phase has a deliverable and an exit criterion.

---

## 1. Mission

Build **Klyro**, a scheduling platform for any business that books clients by appointment. Owners share a link; clients book; an automatic message (WhatsApp / SMS / Email) confirms instantly. No marketplace, no commission per appointment.

- **Domain:** `klyro.app`
- **Product owner / studio:** BridgeStack Dev
- **Tagline:** *Your business. Your clients. Your brand.*
- **Languages:** Spanish (primary), English (secondary)
- **Mobile-first**, accessible (WCAG 2.1 AA on public booking)
- **Multi-tenant** with strict isolation via Postgres Row-Level Security
- **Brand personality:** friendly, calm, competent. The mascot is a relaxed black cat with a check mark on its chest — the cat is "the assistant who quietly keeps your day in order." Tone is warm but never childish.

### 1.1 Positioning and target market

Klyro serves any service business that:
- Books clients by appointment (not by table/seat/room-night).
- Has 1–50 staff per business.
- Wants their own link, their own clients, and their own brand — not a marketplace.

**Launch wedge (Phase 8 — Closed Beta):** barbershops and beauty salons in Honduras. These are the first verticals we'll validate with because we have direct access to the community and they share the simplest scheduling pattern (1 client × 1 staff × 1 service × 1 time slot).

**Verticals supported by the platform from day 1** (any can be activated by the owner during setup):

| Vertical | Status at launch | Notes |
|---|---|---|
| Barbershop | Active (wedge) | Validated in closed beta |
| Beauty salon | Active (wedge) | Validated in closed beta |
| Fitness / personal training | Active (self-serve) | 1-on-1 sessions, not group classes in MVP |
| Spa & aesthetics | Active (self-serve) | Massage, facials |
| Tattoo & piercing studio | Active (self-serve) | Longer appointments, deposits in v2 |
| Car wash & detailing | Active (self-serve) | Service per vehicle, time slots |
| Pet grooming | Active (self-serve) | Per-pet service catalog |
| Generic / other | Active (fallback) | User defines services freely |

**Explicitly out of scope at launch:**
- Group classes (yoga studios with 20 attendees per session) — needs capacity logic
- Restaurants / table reservations — different mental model (party size, table layout)
- Hotels / room-night booking — different mental model entirely
- Medical / dental appointments — needs HIPAA, insurance, e-prescriptions

These are not "never" — they're "not in v1" because each requires meaningful feature work beyond the core scheduling primitive.

### 1.2 Why multi-vertical from day 1

We validated the core insight in early research: at the data and UI level, **the difference between a barbershop and a spa is just labels, default service durations, and message tone**. Same booking primitive, same staff model, same time-slot grid. Trying to retrofit multi-vertical after launch is painful; building it generic from the start costs ~10% more time and unlocks an order of magnitude more market.

Each vertical brings a configuration profile (suggested services, default durations, message tone, cancellation policy hint) — but no separate codebase, no separate schema.

---

## 2. Tech Stack — Locked

> All installs use `@latest`. Reference versions are the May 2026 stable line, for context only; the lockfile is the source of truth post-install.

### 2.1 Frontend

| Layer | Package | Install command | Reference version (May 2026) |
|---|---|---|---|
| Framework | `next` | `pnpm add next@latest` | 16.2.x |
| UI runtime | `react`, `react-dom` | `pnpm add react@latest react-dom@latest` | 19.2.x |
| Type definitions | `@types/react`, `@types/react-dom`, `@types/node` | `pnpm add -D @types/react@latest @types/react-dom@latest @types/node@latest` | latest |
| Language | `typescript` | `pnpm add -D typescript@latest` | 5.x |
| Styling | `tailwindcss`, `@tailwindcss/postcss`, `postcss` | `pnpm add -D tailwindcss@latest @tailwindcss/postcss@latest postcss@latest` | 4.x |
| Components | **shadcn/ui** | `pnpm dlx shadcn@latest init` | — |
| Forms | `react-hook-form`, `@hookform/resolvers` | `pnpm add react-hook-form@latest @hookform/resolvers@latest` | latest |
| Validation | `zod` | `pnpm add zod@latest` | latest |
| i18n | `next-intl` | `pnpm add next-intl@latest` | latest |
| Client state / mutations | `@tanstack/react-query` | `pnpm add @tanstack/react-query@latest` | latest |
| Icons | `lucide-react` | `pnpm add lucide-react@latest` | latest |
| Animations | `framer-motion` | `pnpm add framer-motion@latest` | latest |
| Dates | `date-fns` | `pnpm add date-fns@latest` | latest |
| Phone | `libphonenumber-js` | `pnpm add libphonenumber-js@latest` | latest |
| Utility classes | `clsx`, `tailwind-merge` | `pnpm add clsx@latest tailwind-merge@latest` | latest |

Fonts: **Inter** loaded via `next/font/google` (matches the wordmark in the brand assets). **JetBrains Mono** for booking codes only.

### 2.2 Backend

| Layer | Package / Service | Install / Setup |
|---|---|---|
| Database | **Supabase Postgres** | Create project at supabase.com |
| Auth | **Supabase Auth** | Native to Supabase, no extra package |
| Client SDK | `@supabase/supabase-js` | `pnpm add @supabase/supabase-js@latest` |
| SSR helpers | `@supabase/ssr` | `pnpm add @supabase/ssr@latest` |
| Type generation | `supabase` CLI | `pnpm add -D supabase@latest` |
| Edge Functions | Supabase Edge Functions | Deno-based, in `supabase/functions/` |
| Realtime | Supabase Realtime | Included |
| Storage | Supabase Storage | Included |
| Scheduled jobs | `pg_cron` | Enabled via SQL |

### 2.3 Messaging

| Channel | Provider | Install / Integration |
|---|---|---|
| WhatsApp | **Meta Cloud API (direct)** | Native `fetch` calls; no SDK needed |
| SMS | **Twilio** | `pnpm add twilio@latest` |
| Email | **Resend** | `pnpm add resend@latest` |
| Email templates | **React Email** | `pnpm add react-email@latest @react-email/components@latest` |

### 2.4 Observability & Ops

| Need | Package | Install |
|---|---|---|
| Errors | `@sentry/nextjs` | `pnpm dlx @sentry/wizard@latest -i nextjs` |
| Product analytics | `posthog-js` | `pnpm add posthog-js@latest` |
| Web vitals | `@vercel/analytics` | `pnpm add @vercel/analytics@latest` |
| Speed insights | `@vercel/speed-insights` | `pnpm add @vercel/speed-insights@latest` |
| Uptime | Better Stack (external) | Free tier |

### 2.5 Testing

| Layer | Install command |
|---|---|
| Unit | `pnpm add -D vitest@latest @vitejs/plugin-react@latest` |
| Component | `pnpm add -D @testing-library/react@latest @testing-library/jest-dom@latest @testing-library/user-event@latest jsdom@latest` |
| E2E | `pnpm add -D @playwright/test@latest` |

### 2.6 Tooling

| Tool | Install |
|---|---|
| Linter | `pnpm add -D eslint@latest eslint-config-next@latest` |
| Formatter | `pnpm add -D prettier@latest prettier-plugin-tailwindcss@latest eslint-config-prettier@latest` |
| Type checking | TypeScript via `tsc --noEmit` |
| Git hooks (optional) | `pnpm add -D husky@latest lint-staged@latest` |

### 2.7 Hosting & Infra

- **Frontend:** Vercel (Hobby → Pro when scaling)
- **DB / Auth / Edge / Storage / Realtime:** Supabase (Free → Pro at ~50 active businesses)
- **Domain & DNS:** Cloudflare (or Vercel DNS)
- **Node version:** Node 22 LTS minimum (Next.js 16 requirement)
- **Package manager:** pnpm latest

### 2.8 Estimated monthly cost in early stage

| Service | Cost |
|---|---|
| Vercel | $0 (Hobby) |
| Supabase | $0 (Free) |
| WhatsApp Cloud API | ~$5–15 |
| Twilio SMS (optional) | ~$10–30 |
| Resend | $0 |
| Sentry / PostHog | $0 |
| Domain | ~$1 |
| **Total** | **$15–50/month** |

---

## 3. Repository Setup

### 3.1 Folder structure

```
klyro/
├── .github/workflows/
│   ├── ci.yml
│   └── deploy-preview.yml
├── public/
│   ├── favicon.ico                  # generated from cat mark
│   ├── icon.svg                     # cat mark, monochrome-safe
│   ├── apple-icon.png               # cat mark on navy bg
│   ├── og-image.png                 # cat + wordmark on navy bg
│   └── brand/
│       ├── klyro-cat.svg            # mascot only
│       ├── klyro-wordmark.svg       # "klyro" wordmark only
│       └── klyro-lockup.svg         # cat + wordmark horizontal lockup
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (marketing)/page.tsx
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   └── callback/route.ts
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   ├── agenda/
│   │   │   │   ├── team/
│   │   │   │   ├── branches/
│   │   │   │   ├── services/
│   │   │   │   ├── settings/
│   │   │   │   └── links/
│   │   │   ├── (booking)/
│   │   │   │   └── [businessSlug]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [branchSlug]/
│   │   │   │           ├── page.tsx
│   │   │   │           └── [staffSlug]/
│   │   │   │               └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/webhooks/
│   │   │   ├── whatsapp/route.ts
│   │   │   ├── twilio/route.ts
│   │   │   └── resend/route.ts
│   │   ├── globals.css              # design tokens live here (§8)
│   │   └── manifest.ts
│   ├── components/
│   │   ├── ui/                      # shadcn/ui primitives
│   │   ├── wizard/                  # Setup wizard steps
│   │   ├── booking/                 # Public booking flow
│   │   ├── dashboard/               # Owner & staff dashboards
│   │   └── shared/
│   │       └── Logo.tsx             # Single source of truth for logo
│   ├── lib/
│   │   ├── supabase/
│   │   ├── messaging/
│   │   ├── booking/
│   │   ├── verticals/               # Vertical profile registry (see §5.4)
│   │   ├── schemas/
│   │   ├── utils/
│   │   └── env.ts
│   ├── i18n/
│   │   ├── locales/
│   │   │   ├── es.json
│   │   │   └── en.json
│   │   └── config.ts
│   ├── middleware.ts
│   └── types/database.ts
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── seed.sql
│   └── config.toml
├── tests/
├── .env.example
├── .gitignore
├── .nvmrc
├── next.config.mjs
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── README.md
```

### 3.2 Package manager: pnpm latest, pinned via `packageManager` field.

### 3.3 Node version: 22 LTS minimum, pinned in `.nvmrc` and `engines`.

---

## 4. Environment Variables

`.env.example` (commit this; never commit `.env.local`):

```bash
# ── App ───────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://klyro.app
NEXT_PUBLIC_APP_NAME=Klyro

# ── Supabase ──────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ── OAuth ─────────────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=

# ── WhatsApp Cloud API (Meta) ─────────────────
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=

# ── Twilio (SMS) ──────────────────────────────
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_MESSAGING_SERVICE_SID=

# ── Resend (Email) ────────────────────────────
RESEND_API_KEY=
RESEND_FROM_EMAIL=hola@klyro.app

# ── Observability ─────────────────────────────
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# ── Encryption ────────────────────────────────
ENCRYPTION_KEY=
```

Validate all env vars at startup with Zod (`src/lib/env.ts`). Fail fast if missing.

---

## 5. Database Schema

### 5.1 Core tables (12 total)

The schema is **vertical-agnostic**. The only vertical-specific field is `businesses.vertical`, which is a free-form text reference to a key in the `verticals` registry (see §5.4). It is NOT a database enum — that decision is intentional, so adding a new vertical never requires a migration.

```sql
-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";
create extension if not exists "pgcrypto";

-- 1. businesses
create table businesses (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  slug            text unique not null,
  vertical        text not null,                       -- references a key in lib/verticals registry
                                                       -- e.g. 'barbershop','salon','fitness','spa','tattoo','carwash','petgrooming','other'
  country         text not null default 'HN',
  default_language text not null default 'es' check (default_language in ('es','en')),
  default_currency text not null default 'HNL',
  logo_url        text,
  onboarding_completed boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 2. branches
create table branches (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid not null references businesses(id) on delete cascade,
  name            text not null,
  slug            text not null,
  address         text,
  city            text,
  country         text not null default 'HN',
  phone           text,
  whatsapp_number text,
  timezone        text not null default 'America/Tegucigalpa',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  unique (business_id, slug)
);

-- 3. users
create table users (
  id              uuid primary key references auth.users(id) on delete cascade,
  business_id     uuid references businesses(id) on delete set null,
  email           text not null,
  phone           text,
  full_name       text,
  avatar_url      text,
  role            text not null check (role in ('owner','staff')),
  provider        text,
  created_at      timestamptz not null default now()
);

-- 4. staff
create table staff (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid not null references businesses(id) on delete cascade,
  user_id         uuid references users(id) on delete set null,
  display_name    text not null,
  slug            text not null,
  avatar_url      text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  unique (business_id, slug)
);

-- 5. staff_branches (N:M)
create table staff_branches (
  id              uuid primary key default uuid_generate_v4(),
  staff_id        uuid not null references staff(id) on delete cascade,
  branch_id       uuid not null references branches(id) on delete cascade,
  unique (staff_id, branch_id)
);

-- 6. services
create table services (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid not null references businesses(id) on delete cascade,
  name            text not null,
  duration_minutes int not null check (duration_minutes > 0),
  price           numeric(10,2) not null,
  currency        text not null default 'HNL',
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- 7. branch_services
create table branch_services (
  id              uuid primary key default uuid_generate_v4(),
  branch_id       uuid not null references branches(id) on delete cascade,
  service_id      uuid not null references services(id) on delete cascade,
  price_override  numeric(10,2),
  unique (branch_id, service_id)
);

-- 8. staff_availability
create table staff_availability (
  id              uuid primary key default uuid_generate_v4(),
  staff_id        uuid not null references staff(id) on delete cascade,
  branch_id       uuid not null references branches(id) on delete cascade,
  day_of_week     int not null check (day_of_week between 0 and 6),
  start_time      time not null,
  end_time        time not null,
  check (start_time < end_time)
);

-- 9. clients
create table clients (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid not null references businesses(id) on delete cascade,
  full_name       text not null,
  email           text,
  phone           text,
  whatsapp_number text,
  preferred_language text default 'es' check (preferred_language in ('es','en')),
  total_visits    int not null default 0,
  total_spent     numeric(12,2) not null default 0,
  created_at      timestamptz not null default now()
);

-- 10. appointments
create table appointments (
  id              uuid primary key default uuid_generate_v4(),
  business_id     uuid not null references businesses(id) on delete cascade,
  branch_id       uuid not null references branches(id) on delete cascade,
  client_id       uuid not null references clients(id),
  staff_id        uuid not null references staff(id),
  service_id      uuid not null references services(id),
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  status          text not null default 'confirmed'
                    check (status in ('pending','confirmed','completed','noshow','cancelled')),
  notes           text,
  created_at      timestamptz not null default now(),
  cancelled_at    timestamptz
);

create index idx_appointments_business_starts on appointments (business_id, starts_at);
create index idx_appointments_staff_starts    on appointments (staff_id, starts_at);
create index idx_appointments_branch_starts   on appointments (branch_id, starts_at);

-- 11. messages
create table messages (
  id              uuid primary key default uuid_generate_v4(),
  appointment_id  uuid references appointments(id) on delete cascade,
  business_id     uuid not null references businesses(id) on delete cascade,
  type            text not null check (type in ('confirmation','reminder_24h','cancellation','reschedule')),
  channel         text not null check (channel in ('whatsapp','sms','email')),
  status          text not null default 'pending'
                    check (status in ('pending','sent','delivered','failed')),
  provider_message_id text,
  scheduled_at    timestamptz,
  sent_at         timestamptz,
  error           text,
  created_at      timestamptz not null default now()
);

create index idx_messages_scheduled on messages (status, scheduled_at)
  where status = 'pending';

-- 12. message_templates
create table message_templates (
  id              uuid primary key default uuid_generate_v4(),
  type            text not null,
  channel         text not null,
  language        text not null check (language in ('es','en')),
  vertical        text not null,                       -- matches key in verticals registry
  content         text not null,
  variables       jsonb not null default '[]',
  is_active       boolean not null default true,
  unique (type, channel, language, vertical)
);
```

### 5.2 Row-Level Security policies

Tenant isolation via `business_id` scoped to `auth.uid()`. Owner sees all of business; staff sees only own appointments. Full SQL in `0002_rls_policies.sql`.

### 5.3 pg_cron jobs

`dispatch-due-messages` runs every 5 minutes — selects `messages` where `status = 'pending'` and `scheduled_at <= now()`, invokes the dispatch Edge Function.

### 5.4 Vertical registry — the multi-vertical heart of the system

The verticals registry lives in code, not in the database. This makes adding a new vertical a code-only change (no migration).

**Location:** `src/lib/verticals/registry.ts`

**Shape:**

```typescript
export type VerticalKey =
  | 'barbershop'
  | 'salon'
  | 'fitness'
  | 'spa'
  | 'tattoo'
  | 'carwash'
  | 'petgrooming'
  | 'other';

export interface VerticalProfile {
  key: VerticalKey;
  displayName: { es: string; en: string };
  icon: string;                          // lucide-react icon name
  emoji?: string;                        // optional emoji fallback for marketing
  status: 'active' | 'preview';          // 'preview' = visible but disabled in wizard
  defaultServices: Array<{
    name: { es: string; en: string };
    durationMinutes: number;
    suggestedPriceRange: [number, number];
  }>;
  defaultBufferMinutes: number;          // gap between appointments
  defaultCancellationHours: number;      // suggested cancellation window
  messagingTone: 'casual' | 'professional' | 'wellness';
  bookingPageHints: {
    serviceNoun: { es: string; en: string };     // "servicio" | "tratamiento" | "sesión"
    appointmentNoun: { es: string; en: string };  // "cita" | "turno" | "reserva"
    staffNoun: { es: string; en: string };        // "barbero" | "estilista" | "entrenador"
  };
}

export const VERTICALS: Record<VerticalKey, VerticalProfile> = {
  barbershop:  { /* corte, barba, combo; tono casual */ },
  salon:       { /* corte, color, manicura; tono casual-warm */ },
  fitness:     { /* sesiones 60min; tono motivacional */ },
  spa:         { /* masaje, facial; tono wellness */ },
  tattoo:      { /* sesiones 2-4h; tono casual */ },
  carwash:     { /* lavado, encerado; tono profesional */ },
  petgrooming: { /* baño, corte por raza; tono cálido */ },
  other:       { /* fallback genérico, sin defaults */ },
};
```

**Why this design:**
- Adding "yoga studio" or "auto repair" later = add one entry to this object. No DB migration, no schema change.
- Templates can be seeded per vertical via `0003_message_templates.sql` referencing these keys.
- Wizard reads from this registry to pre-fill the service catalog and show appropriate copy.
- Booking page reads from this registry to display the right nouns ("Reserva tu sesión" vs "Agenda tu cita").

### 5.5 Message templates per vertical

Seeded for all active verticals × 2 channels (WhatsApp, Email) × 2 languages (es, en) × 3 message types (confirmation, reminder_24h, cancellation). For 7 active verticals = 84 templates total. Generated programmatically in `0003_message_templates.sql`.

Example variations:

| Vertical | ES Confirmation (WhatsApp) |
|---|---|
| Barbershop | "¡Hola {nombre}! Tu corte está confirmado para {fecha} a las {hora} con {staff}. Te esperamos en {dirección}. 💈" |
| Salon | "¡Hola {nombre}! Tu cita de {servicio} está confirmada para {fecha} a las {hora} con {staff}. ✨" |
| Fitness | "¡{nombre}! Tu sesión está confirmada para {fecha} a las {hora} con {staff}. ¡A darle! 💪" |
| Spa | "Hola {nombre}, tu {servicio} está reservado para {fecha} a las {hora}. Te esperamos para tu momento de bienestar. 🌿" |
| Carwash | "Listo {nombre}, tu vehículo tiene cita el {fecha} a las {hora} en {sucursal}. 🚗" |

Same data, different wrapping. The MessageRouter picks the correct template by `(vertical, language, channel, type)`.

---

## 6. Authentication — Single Sign-On

Three providers via Supabase Auth: Magic Link, Google OAuth, Apple Sign-In. Staff invitations by email.

### 6.1 Providers

1. **Magic Link (email)** — default fallback
2. **Google OAuth** — primary for owners
3. **Apple Sign-In** — required for iOS feel + App Store compliance later

### 6.2 Supabase setup checklist

1. Authentication → Providers → enable Email (magic link only)
2. Enable Google with credentials from Google Cloud Console
3. Enable Apple (requires Apple Developer account)
4. Site URL: `https://klyro.app`
5. Redirect URLs: `https://klyro.app/auth/callback` + `http://localhost:3000/auth/callback`

### 6.3 Login UI

Three buttons: Google, Apple, email magic link — all routed through `supabase.auth`. The login screen uses the **dark brand surface** (`--bg-base`) with the cat + wordmark lockup centered above the buttons.

### 6.4 Session handling

`@supabase/ssr` + Next.js middleware. JWT 1h, refresh 30d, httpOnly cookies.

### 6.5 Staff invitations

Owner invites by email → `staff` row created with `user_id = null` → invite email sent → on accept, `user_id` linked.

---

## 7. Build Phases

### Phase 0 — Foundation (Days 1–3)

**Goal:** Repo, CI, Supabase, env, types, vertical registry skeleton, **brand design tokens**.

- [ ] `pnpm create next-app@latest klyro --typescript --tailwind --app --eslint --src-dir`
- [ ] Install all dependencies with `@latest`
- [ ] Pin pnpm via `packageManager` field
- [ ] Configure Tailwind v4 with the **Klyro brand tokens** from §8 using `@theme` in `globals.css`
- [ ] Build `src/components/shared/Logo.tsx` with cat mark + wordmark variants (see §8.2)
- [ ] Install shadcn/ui base primitives
- [ ] Set up Zod-validated env vars
- [ ] Create Supabase project; configure clients
- [ ] Write migrations (12 tables + RLS + templates + pg_cron)
- [ ] Generate Supabase types
- [ ] Scaffold `src/lib/verticals/registry.ts` with all 8 vertical profiles
- [ ] Sentry + PostHog + Vercel Analytics + Speed Insights
- [ ] CI workflow

**Exit criterion:** `pnpm dev` runs, Hello Klyro page reads from Supabase and renders the cat + wordmark lockup with correct brand colors, vertical registry is type-safe and exportable.

### Phase 1 — Auth & Onboarding Shell (Days 4–7)

Landing, login (3 providers), callback, dashboard shell with setup banner, logout.

**Exit criterion:** New user signs in with Google, lands on `/dashboard`, sees setup banner.

### Phase 2 — Setup Wizard (Days 8–14)

12-step wizard. **Step 1 = vertical selection** (reads from registry; pre-loads sensible defaults for everything that follows). Modal-based, sticky header with progress, sticky footer with Back/Continue. No auto-advance. Persists progress to localStorage + DB.

**Implementation note:** the wizard is generic. The selected vertical only injects defaults (services, durations, message tone). The same wizard renders for all verticals.

**Exit criterion:** Owner of any vertical completes wizard end-to-end. DB shows complete, vertical-tagged data.

### Phase 3 — Public Booking Flow (Days 15–21)

Three URL levels (`/[biz]`, `/[biz]/[branch]`, `/[biz]/[branch]/[staff]`). Slot calculation engine. Booking page copy adapts based on `businesses.vertical` (uses `bookingPageHints` from registry).

**Exit criterion:** Test client opens booking link for any vertical, books in <60s, receives confirmation.

### Phase 4 — Messaging Engine (Days 22–28)

MessageRouter abstraction. Templates seeded for all 7 active verticals × 2 channels × 2 languages × 3 types. WhatsApp confirmation + 24h reminder via pg_cron + Edge Function.

**Exit criterion:** Booking triggers correct template based on (vertical, language, channel, type). Reminder fires 24h before.

### Phase 5 — Owner Dashboard (Days 29–35)

Vertical-agnostic dashboard. UI copy uses `appointmentNoun`/`staffNoun` from the registry where appropriate ("Cita" for spa, "Sesión" for fitness, "Turno" for barbershop). Same components, different labels.

**Exit criterion:** Owner can run a full operational day from the dashboard, regardless of vertical.

### Phase 6 — Staff Dashboard (Days 36–38)

Same approach — vertical labels propagate but the UI is the same.

**Exit criterion:** Staff sees own day; RLS verified for tenant isolation.

### Phase 7 — Polish & QA (Days 39–45)

Responsive, WCAG AA, i18n complete, empty/error states, Lighthouse >90. Brand polish pass: confirm the cat mark, violet accent, and navy surfaces are applied consistently across all screens.

**Smoke test matrix:** 1 barbershop, 1 salon, 1 fitness, 1 carwash. Confirm each one feels native, not retrofitted.

**Exit criterion:** Internal team uses Klyro to manage 4 fake businesses (across verticals) for a week without finding blockers.

### Phase 8 — Closed Beta (Days 46–70)

Deploy to `klyro.app`. Onboard 10 pioneer businesses — initially 6 barbershops + 4 salons (the wedge), then opportunistically test the platform with 1–2 fitness trainers or spas if we have access.

Iterate based on real friction.

**Decision gate at Day 70:** if barbershop/salon retention >60% AND we have at least 1 happy customer in a non-launch vertical, open self-serve signup to all verticals.

---

## 8. Design System

The Klyro visual identity is **derived from the brand assets** (`klyro.png` — cat mascot + wordmark on light; `klyro_.png` — cat mark and horizontal lockup on dark). This is no longer placeholder branding. The two source colors sampled directly from the assets are:

- **Klyro Violet** `#6D64FB` — the "k" in the wordmark, the cat's inner ears, and the cat's collar.
- **Klyro Navy / Ink** `#14143A` — the cat's body and the "lyro" portion of the wordmark.

Everything below is built from those two anchors. The app ships **dark-mode-first** (the dark lockup is the hero treatment); a light surface is available for the public booking page where merchants may prefer it.

### 8.1 Color tokens

Defined as CSS custom properties in **one file** (`src/app/globals.css`) and exposed to Tailwind v4 via the `@theme` directive. shadcn/ui consumes these tokens, never raw hex.

**Brand**

| Token | Hex | Usage |
|---|---|---|
| `--klyro-violet` | `#6D64FB` | Primary CTA, links, active states, the "k" accent, focus rings |
| `--klyro-violet-hover` | `#5D56D8` | CTA hover / pressed |
| `--klyro-violet-soft` | `#8A83FC` | Secondary accent, icon tint, progress fill |
| `--klyro-violet-faint` | `#AFAAFD` | Subtle highlights, selected-day ring on calendar |
| `--klyro-navy` | `#14143A` | Brand ink — wordmark on light surfaces, headings on light |

**Dark surfaces (default theme)**

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#0A0A1F` | App background (matches the dark asset background, lifted off pure black) |
| `--bg-surface` | `#111131` | Cards, modals, wizard panel |
| `--bg-elevated` | `#222246` | Hover rows, dropdowns, popovers |
| `--bg-hover` | `#303052` | Active hover state on elevated surfaces |

**Text on dark**

| Token | Hex | Usage |
|---|---|---|
| `--text-primary` | `#FFFFFF` | Headings, primary copy |
| `--text-secondary` | `#BDBDC8` | Body copy, labels |
| `--text-muted` | `#858599` | Helper text, placeholders, timestamps |

**Light surfaces (optional booking-page theme)**

| Token | Hex | Usage |
|---|---|---|
| `--bg-light` | `#FDFDFD` | Light booking-page background (matches the light asset) |
| `--bg-light-surface` | `#FFFFFF` | Cards on light |
| `--text-on-light` | `#14143A` | Body + headings on light (the brand navy) |
| `--text-on-light-muted` | `#5B5B73` | Helper text on light |

**Borders & lines**

| Token | Value | Usage |
|---|---|---|
| `--border-subtle` | `rgba(255,255,255,0.08)` | Card borders, dividers on dark |
| `--border-strong` | `rgba(109,100,251,0.32)` | Violet glow border on focused / selected elements |
| `--border-on-light` | `rgba(20,20,58,0.10)` | Borders on light surfaces |

**Semantic / status**

| Token | Hex | Usage |
|---|---|---|
| `--success` | `#10B981` | Confirmed appointment, success toast |
| `--warning` | `#F59E0B` | Pending appointment, warning toast |
| `--danger` | `#EF4444` | Cancelled / no-show, error toast, destructive actions |
| `--info` | `#6D64FB` | Informational (reuses brand violet) |

**Gradients** (used sparingly — hero, empty states, the mark itself)

| Token | Value | Usage |
|---|---|---|
| `--grad-brand` | `linear-gradient(135deg, #6D64FB 0%, #14143A 100%)` | Hero panels, the cat mark's own fill, marketing CTA blocks |
| `--grad-surface` | `linear-gradient(180deg, #111131 0%, #0A0A1F 100%)` | Subtle background depth on dashboard |

`globals.css` skeleton:

```css
@import "tailwindcss";

@theme {
  /* brand */
  --color-violet:        #6D64FB;
  --color-violet-hover:  #5D56D8;
  --color-violet-soft:   #8A83FC;
  --color-violet-faint:  #AFAAFD;
  --color-navy:          #14143A;

  /* dark surfaces (default) */
  --color-bg-base:       #0A0A1F;
  --color-bg-surface:    #111131;
  --color-bg-elevated:   #222246;
  --color-bg-hover:      #303052;

  /* text on dark */
  --color-text-primary:   #FFFFFF;
  --color-text-secondary: #BDBDC8;
  --color-text-muted:     #858599;

  /* light surfaces (optional) */
  --color-bg-light:         #FDFDFD;
  --color-bg-light-surface: #FFFFFF;
  --color-text-on-light:    #14143A;

  /* status */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger:  #EF4444;

  /* radii & type — see §8.3 / §8.4 */
  --radius-card:   16px;
  --radius-button: 12px;
  --radius-pill:   999px;

  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

Dark mode is the default — no light-mode toggle for the MVP dashboard. The public booking page may opt into the light surface tokens per business preference (post-MVP toggle; ship dark for all in v1).

### 8.2 Logo — the `<Logo />` component

The logo is a **single component** at `src/components/shared/Logo.tsx`. It is the only file in the codebase that renders brand marks. Three variants, all inline SVG so they inherit `currentColor` where appropriate and never depend on a network request:

| Variant | Contents | Where it's used |
|---|---|---|
| `mark` | The cat mascot only (sitting black cat, violet ears + collar, white check mark on chest) | Favicon, app icon, collapsed sidebar, loading spinner, mobile nav |
| `wordmark` | "klyro" lowercase — the "k" in `--klyro-violet`, "lyro" in `--text-primary` on dark / `--klyro-navy` on light | Marketing footer, email signatures, tight horizontal spaces |
| `lockup` | Cat mark + wordmark side by side (the `klyro_.png` horizontal treatment) | Login screen, dashboard top-left, onboarding wizard header, OG image |

```tsx
// src/components/shared/Logo.tsx
type LogoVariant = 'mark' | 'wordmark' | 'lockup';
type LogoTheme = 'dark' | 'light';

interface LogoProps {
  variant?: LogoVariant;   // default 'lockup'
  theme?: LogoTheme;       // default 'dark'
  className?: string;
}
```

**Mark construction notes (so it renders crisp at 16px favicon size):**
- Cat silhouette: rounded, friendly, sitting pose. Body fill uses `--grad-brand` (violet→navy) on dark backgrounds; flat `--klyro-navy` when it must be monochrome (favicon fallback).
- Inner ears + collar: `--klyro-violet`.
- Eyes (closed, content) + nose + the check mark on the chest: `--text-primary` (white).
- The check mark **is the product metaphor** — keep it legible; never let it drop below ~30% of the body height.
- Provide a 1-color fallback path for contexts that can't render the gradient (e.g. `favicon.ico` at 16×16): solid `--klyro-navy` body, white check.

**Wordmark construction notes:**
- Typeface: Inter, weight 800 (extra bold), lowercase, tight tracking (`-0.02em`).
- The "k" is `--klyro-violet`; "lyro" is `--text-primary` (dark theme) or `--klyro-navy` (light theme).
- No period in the wordmark — the brand assets use a clean lowercase "klyro" with the violet "k" as the only accent.

**Asset files** in `public/brand/` (`klyro-cat.svg`, `klyro-wordmark.svg`, `klyro-lockup.svg`) are exports for external use (email, press, OG image). The in-app component is the source of truth; if the two ever diverge, the component wins.

**Favicon / icons:** generate `favicon.ico`, `icon.svg`, and `apple-icon.png` from the `mark` variant. `apple-icon.png` sits the cat mark on a `--bg-base` rounded square.

### 8.3 Typography

- **Font family:** Inter everywhere (loaded once via `next/font/google` in `src/app/[locale]/layout.tsx`). JetBrains Mono is loaded only for booking confirmation codes.
- **Headings:** Inter, `font-bold` (700) or `font-extrabold` (800) for page titles, tight letter-spacing (`-0.02em`).
- **Body:** Inter, `font-normal` (400), 1.5 line-height.
- **Mono:** JetBrains Mono — booking codes only (e.g. `KLY-4F9A`).
- **Type scale (px):** 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48.
- **Default body size:** 16px on mobile, 14px for dense dashboard tables.

### 8.4 Shape, elevation & motion

- **Radii:** cards `16px` (`--radius-card`), buttons & inputs `12px` (`--radius-button`), pills/badges/avatars `999px` (`--radius-pill`). The rounded, soft geometry echoes the mascot's rounded silhouette.
- **Elevation:** dark theme uses surface color steps (`base` → `surface` → `elevated`) rather than heavy shadows. Where a shadow is needed (modals, popovers), use a soft violet-tinted shadow: `0 8px 32px rgba(109,100,251,0.16)`.
- **Focus rings:** always visible — `2px` solid `--klyro-violet` with `2px` offset. Never remove focus outlines.
- **Motion:** framer-motion for wizard step transitions and the realtime "new booking" toast. Keep durations short (150–250ms) and easing gentle (`ease-out`). The brand is calm — no bouncy or playful spring physics on functional UI.
- **The mascot in-product:** the cat mark appears in empty states ("No tienes citas hoy" with a small sitting cat) and the loading state. It is a quiet presence, not a constant one — do not put the cat on every screen.

### 8.5 Component conventions

- shadcn/ui base, customized via `components.json` to consume Klyro tokens.
- Primary button: `--klyro-violet` fill, white text, `--radius-button`, `--klyro-violet-hover` on hover.
- Secondary button: transparent fill, `--border-subtle` border, `--text-primary` text.
- Destructive button: `--danger` fill.
- Inputs: `--bg-surface` fill, `--border-subtle` border, `--klyro-violet` border + ring on focus.
- Status badges map to semantic tokens: confirmed → `--success`, pending → `--warning`, cancelled/noshow → `--danger`.
- Calendar selected slot: `--klyro-violet` fill; available slot: `--bg-elevated`; unavailable: `--bg-surface` at 40% opacity.

### 8.6 Why this can still evolve

The identity is real, but still swappable in ~1 day if needed:
- All colors are CSS variables in **one file** (`globals.css`).
- The logo is **one component** (`Logo.tsx`) + three SVG exports in `public/brand/`.
- Typography is **one line** in the locale layout.
- Nothing in application logic references a hex value or an image path directly.

Pioneer businesses judge Klyro on whether it solves their scheduling problem — but shipping with the real cat-and-wordmark identity from day 1 means the closed beta also gets honest feedback on the brand.

---

## 9. API Contracts

### 9.1 Booking creation

`POST /api/booking/create` — body: `{ businessSlug, branchSlug, staffSlug, serviceId, startsAt, client: { fullName, whatsappNumber } }`. Business vertical is read from DB, not sent in the request. Returns `{ appointmentId, bookingCode, status }`.

### 9.2 Available slots

`GET /api/booking/slots?staffSlug=...&serviceId=...&date=YYYY-MM-DD` — returns `{ slots: [{ startsAt, endsAt }] }` computed from `staff_availability` minus existing `appointments` minus buffer.

### 9.3 Authenticated endpoints

Server Actions + Route Handlers + Supabase with RLS. No custom API layer — RLS is the authorization boundary.

---

## 10. Security

HTTPS-only, RLS on every table, webhook signature validation (Meta `WHATSAPP_APP_SECRET`, Twilio, Resend), rate limiting on public endpoints, no PII in logs or URLs, AES-256-GCM for sensitive at-rest fields, weekly `pnpm outdated` + `pnpm audit`. Apply Next.js security patch releases immediately.

---

## 11. Testing Strategy

- **Unit:** Vitest — slot calculation, vertical registry resolution, MessageRouter template selection.
- **Component:** Testing Library — wizard steps, booking form.
- **E2E:** Playwright — full booking journey.
- **Vertical coverage test:** the E2E suite runs the full booking journey for **at least 2 different verticals** (barbershop + fitness) to catch any accidental hardcoding of vertical-specific copy or behavior.

---

## 12. Deployment

Vercel (frontend) + Supabase (DB/Auth/Edge/Realtime/Storage) + Cloudflare DNS. Migrations via `pnpm dlx supabase@latest db push`. CI runs typecheck + lint + test on every PR. Weekly dependency hygiene after launch.

---

## 13. Definition of Done (MVP)

The MVP is complete when:

1. A new owner can sign up with Google in <30s
2. The owner picks their vertical from a list of 7 active options
3. The owner completes the wizard in <15min
4. The owner copies a booking URL and shares it via WhatsApp
5. A client opens the URL on mobile, picks a slot, books in <60s
6. The client receives a vertical-appropriate WhatsApp confirmation within 5s
7. 24h before the appointment, the client receives a reminder
8. The owner sees the booking appear in real-time
9. Staff members can log in and see only their own day
10. Lighthouse >90 and WCAG AA on booking pages
11. The Klyro brand identity (cat mark, violet/navy palette, Inter wordmark) is applied consistently — login, dashboard, wizard, booking, emails
12. 10 pioneer businesses (barbershops + salons) onboarded and using daily
13. At least 1 business from a non-wedge vertical (fitness, spa, etc.) tested end-to-end internally

---

## 14. Out of Scope (Explicitly)

These belong to v2 or later. Do not build in MVP:

- Online payments (Stripe Connect)
- Loyalty / coupons / discounts
- Client portal with history
- Marketing automation (bulk SMS, email blasts)
- Advanced analytics
- Native mobile apps
- POS integration
- Multi-currency within one business
- **Group classes** (capacity > 1 per slot)
- **Restaurant / table reservations**
- **Hotel / room-night booking**
- **Medical / dental with HIPAA**
- Calendar sync (Google/Apple Calendar)
- Team chat
- Custom domains per business
- White-label
- Light/dark theme toggle on the dashboard (dashboard is dark-only in v1)

---

## 15. Open Questions for the Founder

1. **Pricing model:** flat monthly, per-staff, per-branch, or freemium?
2. **Free trial:** days? Card required upfront?
3. **WhatsApp number strategy:** shared Klyro number, or per-business verified?
4. **Onboarding support:** self-serve only, or concierge for first 10 pioneers?
5. **Data residency:** US-based Supabase, or LATAM region?
6. **Vertical priority:** after barbershop/salon validation, which vertical do we evangelize next — fitness, spa, or carwash? (Affects v2 marketing focus.)
7. **Booking page theme:** ship the public booking page on the dark surface for everyone in v1, or expose the light-surface option to merchants from the start?

---

## 16. Reference Documents

- `Klyro_PRD_v2.docx` — Product Requirements Document
- `PROMPT_CLAUDE_CODE_BOOTSTRAP.md` — Phase 0 bootstrap prompt for Claude Code
- Brand assets: `klyro.png` (light lockup), `klyro_.png` (dark mark + lockup)
- FigJam diagrams (5 total): Arquitectura, ERD, Wizard 1, Wizard 2, Sequence Diagram Multi-Canal

---

**End of Technical PRD v2.0** — Generic by design. Validated by wedge. Branded from day one.
