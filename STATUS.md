# Klyro — Build Status

**Last updated:** 2026-05-14
**Active phase:** Phase 1 built, pending smoke test

---

## Phase Progress

| Phase | Name | Status | Notes |
|-------|------|--------|-------|
| 0 | Foundation | ✅ Done | All 12 tables, RLS, types, brand, CI |
| 1 | Auth & Onboarding Shell | 🟡 Built — needs smoke test | Magic link + OAuth shell + dashboard |
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
- `<Logo />` component (mark / wordmark / lockup) — inline SVG
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
- CI workflow (typecheck + lint + test on every PR)
- Supabase agent skills installed

**Pending (manual):**
- Add `SUPABASE_SERVICE_ROLE_KEY` to `klyro/.env.local`

---

## Phase 1 — Auth & Onboarding Shell 🟡

**Built:**
- DB trigger `0005_auth_trigger.sql` — auto-creates `public.users` row on signup (applied to Supabase)
- `src/middleware.ts` — combined next-intl locale routing + Supabase session refresh + auth protection
- `src/app/[locale]/(auth)/callback/route.ts` — handles OAuth code exchange + magic link token verification
- `src/lib/actions/auth.ts` — server actions: Google OAuth, Apple OAuth, magic link, sign out
- `src/app/[locale]/(auth)/login/page.tsx` — login page with all 3 providers
- `src/components/dashboard/Sidebar.tsx` — responsive sidebar (desktop fixed, mobile Sheet drawer)
- `src/app/[locale]/(dashboard)/layout.tsx` — protected layout, redirects unauth to `/login`
- `src/app/[locale]/(dashboard)/dashboard/page.tsx` — dashboard with setup banner
- i18n strings updated (es + en): auth, dashboard, nav

**Smoke test checklist (run before marking done):**
- [ ] `pnpm dev` starts without errors
- [ ] `http://localhost:3000/es/login` renders login page with brand
- [ ] Magic link email sends and redirects to `/es/dashboard`
- [ ] Dashboard shows setup banner
- [ ] Sidebar nav renders; logout works
- [ ] Visiting `/es/dashboard` logged out → redirects to `/es/login`

**Manual setup needed:**
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to `klyro/.env.local`
- [ ] Add `http://localhost:3000/auth/callback` to Supabase → Auth → Redirect URLs
- [ ] Add `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` when ready to test Google OAuth

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

---

## Key Files Quick Reference

| What | Where |
|------|-------|
| Design tokens | `src/app/globals.css` |
| Logo component | `src/components/shared/Logo.tsx` |
| Vertical registry | `src/lib/verticals/registry.ts` |
| Env validation | `src/lib/env.ts` |
| Supabase clients | `src/lib/supabase/` |
| Auth actions | `src/lib/actions/auth.ts` |
| Middleware | `src/middleware.ts` |
| DB migrations | `supabase/migrations/` |
| i18n strings | `src/i18n/locales/` |
| CI workflow | `.github/workflows/ci.yml` |
