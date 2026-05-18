# Klyro — Build Status

**Last updated:** 2026-05-15
**Active phase:** Phase 1 complete — Phase 2 next

---

## Phase Progress

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 0 | Foundation | ✅ Done | All 12 tables, RLS, types, brand, CI |
| 1 | Auth & Onboarding Shell | ✅ Done | Magic link confirmed working end-to-end |
| 2 | Setup Wizard | ⬜ Not started | 12-step wizard, vertical selection |
| 3 | Public Booking Flow | ⬜ Not started | `/[biz]/[branch]/[staff]` |
| 4 | Messaging Engine | ⬜ Not started | WhatsApp + email templates |
| 5 | Owner Dashboard | ⬜ Not started | Full operational view |
| 6 | Staff Dashboard | ⬜ Not started | RLS-scoped own-day view |
| 7 | Polish & QA | ⬜ Not started | WCAG AA, Lighthouse >90, brand pass |
| 8 | Closed Beta | ⬜ Not started | 10 pioneer businesses, klyro.app |

---

## Phase 0 — Foundation ✅

**Exit criteria met:**
- Next.js 16 + Tailwind v4 + TypeScript strict — 0 errors
- Klyro brand tokens (violet `#6D64FB` / navy `#14143A`) in `globals.css`
- `<Logo />` component — production PNG lockup (`public/klyro_logo_w.png`) + SVG placeholders for mark/wordmark
- shadcn/ui primitives wired to Klyro tokens
- Supabase project connected (`ouexfehqxpgewzgytjgc`)
- 12-table schema applied with full RLS policies
- 84 message templates seeded (7 verticals × 2 channels × 2 langs × 3 types)
- pg_cron job for reminder dispatch (every 5 min)
- Vertical registry — all 8 profiles typed and exported
- Zod-validated env vars (client + server split)
- next-intl i18n — Spanish default, English secondary
- Favicon + app icons from cat mark
- Sentry + PostHog + Vercel Analytics wired (no-op in dev)
- CI workflow (typecheck + lint + test on every PR) — pnpm build approvals committed
- Supabase agent skills installed
- `next-best-practices` + `ui-ux-pro-max` skills installed

---

## Phase 1 — Auth & Onboarding Shell ✅

**Smoke test results:**
- [x] `pnpm dev` starts without errors
- [x] `http://localhost:3000/es/login` renders login page with brand
- [x] Magic link email sends and redirects to `/es/dashboard` — confirmed working
- [x] Dashboard shows setup banner
- [x] Visiting `/es/dashboard` logged out → redirects to `/es/login`
- [ ] Google OAuth — blocked pending credentials (see below)

**Bugs fixed during smoke test:**
- Auth trigger used `app_metadata` (wrong); corrected to `raw_app_meta_data` — fix applied to live DB + migration file
- Callback URL was `/auth/callback`; route lives at `/{locale}/callback` (route group `(auth)` is URL-invisible) — fixed in `auth.ts`
- Root layout missing `<html>`/`<body>` tags required by Next.js 16 — moved to `app/layout.tsx` using `getLocale()`
- Callback route now handles Supabase `?error=` redirects (expired/invalid links) gracefully
- Dev server OOM crash under Node 24 (not LTS) — heap capped at 4 GB; use `nvm use 22`
- CI: pnpm version conflict between workflow `version: 11` and `packageManager` field — removed explicit version
- CI: `ERR_PNPM_IGNORED_BUILDS` — ran `pnpm approve-builds --all`, committed `pnpm-workspace.yaml`

**Manual setup completed:**
- [x] `http://localhost:3000/callback` added to Supabase → Auth → Redirect URLs
- [x] `SUPABASE_SERVICE_ROLE_KEY` added to `klyro/.env.local`
- [x] Custom SMTP (Resend) configured in Supabase → Auth → SMTP Settings *(required to avoid free-tier rate limits)*
- [x] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` configured for Google OAuth

---

## Phase 2 — Setup Wizard (next up)

**Goal:** Owner completes a 12-step wizard and DB shows a fully configured business.

Key steps:
1. Vertical selection (reads from registry, pre-loads defaults)
2. Business name + slug
3. Branch info (name, address, timezone)
4. Services catalog (pre-seeded from vertical defaults, editable)
5. Staff (at least one — the owner)
6. Availability (weekly schedule per staff)
7. Messaging channel (WhatsApp number, SMS, or email)
8. Booking link preview
9. Confirmation → sets `onboarding_completed = true`

---

## Stack Reference

| Layer | Package | Version pinned in lockfile |
|-------|---------|---------------------------|
| Framework | Next.js | 16.2.x |
| UI runtime | React | 19.2.x |
| Styling | Tailwind CSS | v4 |
| Components | shadcn/ui (base-ui) | latest at install |
| DB / Auth | Supabase | `ouexfehqxpgewzgytjgc` |
| i18n | next-intl | latest at install |
| Forms | react-hook-form + zod | latest at install |
| Node (required) | Node.js | 22 LTS (`nvm use 22`) |

---

## Key Files Quick Reference

| What | Where |
|------|-------|
| Design tokens | `src/app/globals.css` |
| Logo component | `src/components/shared/Logo.tsx` |
| Logo asset | `public/klyro_logo_w.png` |
| Vertical registry | `src/lib/verticals/registry.ts` |
| Env validation | `src/lib/env.ts` |
| Supabase clients | `src/lib/supabase/` |
| Auth actions | `src/lib/actions/auth.ts` |
| Auth callback | `src/app/[locale]/(auth)/callback/route.ts` |
| Middleware | `src/middleware.ts` |
| DB migrations | `supabase/migrations/` |
| i18n strings | `src/i18n/locales/` |
| CI workflow | `.github/workflows/ci.yml` |
