# Klyro — Task List

**Last updated:** 2026-05-14

Legend: ✅ Done · 🟡 In progress / built · ⬜ Not started · 🔴 Blocked

---

## Immediate (before Phase 2)

- [ ] 🔴 Add `SUPABASE_SERVICE_ROLE_KEY` to `klyro/.env.local`
- [ ] Add `http://localhost:3000/auth/callback` to Supabase → Auth → Redirect URLs
- [ ] Run `pnpm dev` and complete Phase 1 smoke test (see STATUS.md checklist)
- [ ] Add `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` to `.env.local` (Google Cloud Console)
- [ ] Enable Google OAuth in Supabase → Authentication → Providers → Google
- [ ] Test Google OAuth sign-in end-to-end
- [ ] Commit Phase 1 (`git commit -m "feat: Phase 1 — Auth & Onboarding Shell"`)

---

## Phase 2 — Setup Wizard

- [ ] Scaffold wizard shell: modal + sticky header (progress bar) + sticky footer (Back / Continue)
- [ ] Step 1 — Vertical selection: grid of cards from registry, 7 active + 1 disabled "other"
- [ ] Step 2 — Business name + slug (auto-generated, editable, uniqueness check)
- [ ] Step 3 — First branch: name, address, city, timezone picker
- [ ] Step 4 — Services catalog: pre-seeded from vertical, add/edit/remove rows
- [ ] Step 5 — Staff: owner as first staff member (display name, slug)
- [ ] Step 6 — Availability: weekly grid (Mon–Sun, open/close times per day)
- [ ] Step 7 — Messaging channel: WhatsApp number input (primary), email fallback
- [ ] Step 8 — Booking link preview (read-only, shows `/[slug]`)
- [ ] Step 9 — Review & confirm: summary of all steps
- [ ] On confirm: set `businesses.onboarding_completed = true`, redirect to `/dashboard`
- [ ] Persist wizard progress to `localStorage` (survive page refresh mid-wizard)
- [ ] Add `setup` i18n strings (es + en) for all wizard steps
- [ ] Unit test: vertical registry resolves defaults for each of the 7 active verticals
- [ ] Typecheck + lint pass
- [ ] Commit Phase 2

---

## Phase 3 — Public Booking Flow

- [ ] Route: `/[businessSlug]` — business landing (name, branches list)
- [ ] Route: `/[businessSlug]/[branchSlug]` — branch page (staff list, services)
- [ ] Route: `/[businessSlug]/[branchSlug]/[staffSlug]` — booking page (calendar + slot picker)
- [ ] Slot calculation engine: `staff_availability` minus existing `appointments` minus buffer
- [ ] Booking form: client name + WhatsApp number + service picker + slot confirm
- [ ] `POST /api/booking/create` route handler
- [ ] `GET /api/booking/slots` route handler
- [ ] Booking page copy adapts to vertical (`bookingPageHints` from registry)
- [ ] Mobile-first layout (WCAG AA target)
- [ ] Success screen with booking code (`KLY-XXXX`)
- [ ] E2E test: full booking journey for barbershop vertical
- [ ] E2E test: full booking journey for fitness vertical (vertical coverage check)
- [ ] Typecheck + lint pass
- [ ] Commit Phase 3

---

## Phase 4 — Messaging Engine

- [ ] `MessageRouter` abstraction: picks template by `(vertical, language, channel, type)`
- [ ] WhatsApp Cloud API integration (`/lib/messaging/whatsapp.ts`)
- [ ] Email via Resend + React Email templates
- [ ] SMS via Twilio (optional, behind env flag)
- [ ] Webhook handlers: `/api/webhooks/whatsapp`, `/api/webhooks/resend`, `/api/webhooks/twilio`
- [ ] Webhook signature validation for all three providers
- [ ] Supabase Edge Function `dispatch-due-messages` (called by pg_cron every 5 min)
- [ ] Confirmation message fires immediately on booking
- [ ] 24h reminder: scheduled via `messages.scheduled_at`, dispatched by Edge Function
- [ ] Add `WHATSAPP_PHONE_NUMBER_ID` + `WHATSAPP_ACCESS_TOKEN` to env
- [ ] Add `RESEND_API_KEY` to env
- [ ] Unit test: MessageRouter selects correct template for each vertical × channel combination
- [ ] Typecheck + lint pass
- [ ] Commit Phase 4

---

## Phase 5 — Owner Dashboard

- [ ] Dashboard home: today's appointments (count + list), quick stats
- [ ] Agenda view: calendar grid (day / week), appointment cards
- [ ] Clients list: search, total visits, last visit
- [ ] Services management: CRUD for service catalog
- [ ] Team management: invite staff by email, list staff, toggle active
- [ ] Branches management: CRUD for branches, assign staff to branch
- [ ] Links page: copy booking URL, QR code download
- [ ] Settings: business profile, logo upload (Supabase Storage), language/currency
- [ ] Real-time: new booking toast via Supabase Realtime subscription
- [ ] UI copy uses `appointmentNoun` / `staffNoun` from vertical registry
- [ ] Typecheck + lint pass
- [ ] Commit Phase 5

---

## Phase 6 — Staff Dashboard

- [ ] Staff login (accepts invitation link → sets password / OAuth)
- [ ] Staff view: own-day agenda only (RLS enforced)
- [ ] Mark appointment as completed / no-show
- [ ] Verify RLS: staff cannot see other staff's appointments or other businesses
- [ ] Typecheck + lint pass
- [ ] Commit Phase 6

---

## Phase 7 — Polish & QA

- [ ] Responsive audit: all screens on mobile (375px) and tablet (768px)
- [ ] WCAG 2.1 AA: focus rings, color contrast, aria labels on booking pages
- [ ] i18n completeness: all keys present in both `es.json` and `en.json`
- [ ] Empty states: "No tienes citas hoy" with cat mark illustration
- [ ] Error states: network errors, slot taken, booking failed
- [ ] Lighthouse >90 on public booking page (Performance, Accessibility, SEO)
- [ ] Brand consistency pass: violet accent + navy surfaces across all screens
- [ ] Smoke test matrix: 1 barbershop, 1 salon, 1 fitness, 1 carwash — full booking journey each
- [ ] `pnpm audit` — resolve any high/critical vulnerabilities
- [ ] `pnpm outdated` — apply patch + minor updates
- [ ] Internal team uses all 4 fake businesses for one week without blockers
- [ ] Commit Phase 7

---

## Phase 8 — Closed Beta

- [ ] Configure `klyro.app` DNS on Cloudflare
- [ ] Deploy to Vercel (connect repo, set production env vars)
- [ ] Set Supabase Site URL to `https://klyro.app`
- [ ] Add `https://klyro.app/auth/callback` to Supabase Redirect URLs
- [ ] Enable Google OAuth with production credentials
- [ ] Onboard pioneer business #1 (barbershop)
- [ ] Onboard pioneer businesses #2–6 (barbershops)
- [ ] Onboard pioneer businesses #7–10 (salons)
- [ ] Opportunistically onboard 1–2 fitness / spa businesses
- [ ] Day 70 decision gate: retention >60% + 1 non-wedge vertical validated → open self-serve

---

## Ongoing / Maintenance

- [ ] Weekly: `pnpm outdated` + `pnpm audit` (apply patch/minor immediately; major on a branch)
- [ ] Apply Next.js security patches immediately when released
- [ ] Monitor Sentry for new errors after each deploy
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` rotated and out of git history
