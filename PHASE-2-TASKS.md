# Claude Code Prompt — Phase 2: Setup Wizard

**Project:** Klyro
**Phase:** 2 — Setup Wizard
**Prerequisites:** Phase 0 (Foundation) ✅ and Phase 1 (Auth & Onboarding Shell) ✅ complete
**Spec:** `Klyro_Technical_PRD.md` v2.0 — Section 7 (Phase 2) and Section 5 (data model)

---

## 🚀 PROMPT

Paste the block below into Claude Code from the `klyro/` repo root. The Technical PRD must be reachable (same folder or attached).

```
You are continuing the Klyro build. Phases 0 and 1 are complete (see BUILD_STATUS.md). You are now executing Phase 2 — Setup Wizard. The full spec is Klyro_Technical_PRD.md; this prompt is the execution plan.

CRITICAL RULES (carried over from Phase 0):
1. Klyro_Technical_PRD.md is the single source of truth. If something is unclear, ASK before guessing.
2. Build block by block in the order below. Do NOT skip ahead.
3. After each BLOCK, stop and report. Wait for my approval before moving to the next block.
4. Every commit must compile, pass lint, pass typecheck. Single commit per block.
5. Use @latest for any new dependencies you need to add; the lockfile is the source of truth.
6. Apply the Klyro brand tokens and <Logo /> component — never hardcode colors or substitute marks.
7. NEVER touch RLS-protected data without going through the authed Supabase server client + the getOwnerBusinessId() helper (Block A, step 3).

================================================================
PHASE 2 OVERVIEW
================================================================

Goal: a brand-new owner finishes setup in <15 minutes and lands on a working dashboard.

Architecture choices (locked in):
- Wizard state persists in localStorage only — no DB drafts. Everything commits on the final "Finish" step.
- API style: REST under /api/v1/* — clean contracts, reused by the edit-after pages.
- Scope: an MVP wizard (8 steps, exactly 1 branch and 1 staff = the owner) plus edit-after pages for each domain entity (business / branches / services / team).

The wizard is a thin client. It collects data into localStorage, then on Finish the commit orchestrator runs a sequence of REST calls. The edit-after pages call the same REST endpoints with the same zod schemas. One source of truth per entity.

================================================================
DOMAIN ENTITIES AND THEIR REST ENDPOINTS
================================================================

All endpoints under /api/v1/*. JSON in/out. RLS-scoped via the authed Supabase server client.
Soft-delete via is_active=false. No hard DELETE in MVP.

  POST   /api/v1/businesses                        create the business
  GET    /api/v1/businesses/me                     get current owner's business
  PATCH  /api/v1/businesses/me                     update name/vertical/language/currency/channels
  POST   /api/v1/businesses/me/complete-onboarding flip onboarding_completed=true
  GET    /api/v1/businesses/check-slug?slug=x      slug availability (debounced from UI)

  GET    /api/v1/branches                          list business's branches
  POST   /api/v1/branches                          create a branch
  GET    /api/v1/branches/[id]
  PATCH  /api/v1/branches/[id]
  DELETE /api/v1/branches/[id]                     soft-delete

  GET    /api/v1/services                          list business's services
  POST   /api/v1/services                          create a service
  PATCH  /api/v1/services/[id]
  DELETE /api/v1/services/[id]                     soft-delete
  POST   /api/v1/services/bulk                     wizard helper: seed N services at once

  GET    /api/v1/staff                             list business's staff
  POST   /api/v1/staff                             create staff (with optional invite email)
  PATCH  /api/v1/staff/[id]
  DELETE /api/v1/staff/[id]                        soft-delete
  POST   /api/v1/staff/[id]/branches               assign staff to branches (replace set)
  POST   /api/v1/staff/[id]/services               assign which services this staff offers
  POST   /api/v1/staff/[id]/invite                 send/resend invite email (STUB: return 501 in Phase 2; real email in Phase 4)

  GET    /api/v1/staff/[id]/availability           weekly schedule for a staff×branch
  PUT    /api/v1/staff/[id]/availability           replace full weekly schedule
                                                   body: { branch_id, slots: [{day_of_week,start_time,end_time}…] }

  GET    /api/v1/verticals                         list active verticals from the registry
  GET    /api/v1/verticals/[key]/defaults          services + buffer + cancellation hint defaults

The wizard hits a subset of these. The rest power the edit-after pages — same client functions.

================================================================
THE 8 WIZARD STEPS (MVP SCOPE)
================================================================

| # | Step       | Calls on Continue                                    | Calls on Finish                                                                                |
|---|------------|------------------------------------------------------|------------------------------------------------------------------------------------------------|
| 1 | Vertical   | GET /verticals (mount); GET /verticals/[key]/defaults |  —                                                                                             |
| 2 | Business   | GET /businesses/check-slug (debounced)                | POST /businesses                                                                               |
| 3 | Branch     | —                                                     | POST /branches                                                                                 |
| 4 | Services   | —                                                     | POST /services/bulk                                                                            |
| 5 | Staff      | —                                                     | POST /staff per staff + POST /staff/[id]/branches + POST /staff/[id]/services                  |
| 6 | Schedule   | —                                                     | PUT /staff/[id]/availability per staff                                                         |
| 7 | Messaging  | —                                                     | PATCH /businesses/me (channel prefs)                                                           |
| 8 | Review     | —                                                     | runs steps 2–7 in order, then POST /businesses/me/complete-onboarding                          |

A single transaction across REST calls isn't possible. The commit orchestrator runs them sequentially, persists `lastSuccessfulStep` in localStorage, and on failure shows the user what committed and lets them retry from that step. On full success, clear `klyro.wizard.v1` from localStorage and redirect to /setup/done → /dashboard.

================================================================
LOCKED DECISIONS — IMPORTANT
================================================================

- The wizard always creates exactly 1 branch and 1 staff row (the owner). N-branch and team setup happens post-wizard from the edit-after pages. Do NOT add multi-branch UI to the wizard.
- Owner-as-staff: when creating the owner's staff row, default display_name = users.full_name, link user_id, and auto-assign to the single branch + all services.
- Slug: auto-generate from business name on Step 2; user can override. check-slug handles collisions.
- Timezone default: derive from businesses.country (Honduras → America/Tegucigalpa). Dropdown so it's editable.
- Service durations and buffer defaults come from the vertical registry's defaults endpoint.

================================================================
FOLDER STRUCTURE (CREATE EXACTLY THIS)
================================================================

src/
├── app/api/v1/
│   ├── businesses/route.ts                  POST, GET
│   ├── businesses/me/route.ts               GET, PATCH
│   ├── businesses/me/complete-onboarding/route.ts
│   ├── businesses/check-slug/route.ts
│   ├── branches/route.ts                    GET, POST
│   ├── branches/[id]/route.ts               GET, PATCH, DELETE
│   ├── services/route.ts
│   ├── services/[id]/route.ts
│   ├── services/bulk/route.ts
│   ├── staff/route.ts
│   ├── staff/[id]/route.ts
│   ├── staff/[id]/branches/route.ts
│   ├── staff/[id]/services/route.ts
│   ├── staff/[id]/invite/route.ts
│   ├── staff/[id]/availability/route.ts
│   ├── verticals/route.ts
│   └── verticals/[key]/defaults/route.ts
├── app/[locale]/(dashboard)/
│   ├── setup/
│   │   ├── layout.tsx                       wizard chrome: sticky header + footer + brand
│   │   ├── page.tsx                         step 1 (vertical)
│   │   ├── business/page.tsx                step 2
│   │   ├── branch/page.tsx                  step 3
│   │   ├── services/page.tsx                step 4
│   │   ├── staff/page.tsx                   step 5
│   │   ├── schedule/page.tsx                step 6
│   │   ├── messaging/page.tsx               step 7
│   │   ├── review/page.tsx                  step 8 — commit + redirect
│   │   └── done/page.tsx                    success splash → /dashboard
│   └── settings/                            edit-after pages
│       ├── business/page.tsx
│       ├── branches/page.tsx
│       ├── branches/[id]/page.tsx
│       ├── services/page.tsx
│       ├── team/page.tsx
│       └── team/[id]/page.tsx
├── lib/
│   ├── api/                                 typed fetch wrappers for the client
│   │   ├── client.ts                        base fetch + ApiError + JSON handling
│   │   ├── businesses.ts
│   │   ├── branches.ts
│   │   ├── services.ts
│   │   ├── staff.ts
│   │   └── verticals.ts
│   ├── schemas/                             zod schemas — single source of validation truth
│   │   ├── business.ts
│   │   ├── branch.ts
│   │   ├── service.ts
│   │   ├── staff.ts
│   │   └── availability.ts
│   ├── supabase/
│   │   └── owner.ts                         NEW: getOwnerBusinessId(supabase) helper
│   └── wizard/
│       ├── store.ts                         localStorage-backed wizard state (key: klyro.wizard.v1)
│       ├── steps.ts                         step order, completion predicates, next/prev helpers
│       └── commit.ts                        the Finish orchestrator
└── components/wizard/
    ├── WizardShell.tsx                      progress bar + Back/Continue footer
    ├── StepVertical.tsx
    ├── StepBusiness.tsx
    ├── StepBranch.tsx
    ├── StepServices.tsx
    ├── StepStaff.tsx
    ├── StepSchedule.tsx
    ├── StepMessaging.tsx
    └── StepReview.tsx

================================================================
BLOCK A — FOUNDATION (do FIRST; everything depends on this)
================================================================

Goal: shared schemas + the API client + the RLS helper that every route uses.

A1. Create zod schemas in src/lib/schemas/:
    - business.ts  (createBusiness, updateBusiness, checkSlug)
    - branch.ts    (createBranch, updateBranch)
    - service.ts   (createService, updateService, bulkServices)
    - staff.ts     (createStaff, updateStaff, assignBranches, assignServices)
    - availability.ts (replaceAvailability: { branch_id, slots: AvailabilitySlot[] })
    Each schema exports the parsed TypeScript type. Reuse these on routes (server validation) AND in react-hook-form on the client.

A2. Create src/lib/api/client.ts:
    - apiFetch<T>(url, init?) typed wrapper
    - ApiError class (status, code, message, fieldErrors?)
    - Auto-parses JSON, normalizes errors, supports AbortSignal
    - Throws ApiError on non-2xx; returns parsed body on 2xx

A3. Create src/lib/supabase/owner.ts:
    - getOwnerBusinessId(supabase): Promise<string>
    - Reads the authed user, joins to public.users, returns business_id
    - Throws if unauthenticated (use a typed AuthError, mapped to 401 by routes)
    - Throws if user has no business yet (mapped to 404 — only the businesses POST creates one)

A4. Add a tiny error utility src/lib/api/errors.ts:
    - toErrorResponse(error) → NextResponse with status + JSON { code, message, fieldErrors? }
    - Used by every route handler in BLOCK B

EXIT CRITERION FOR BLOCK A:
  - pnpm typecheck passes
  - All schemas import cleanly and infer correct types
  - getOwnerBusinessId compiles and is unit-tested with vitest (mock supabase client)
  - Single commit: "feat(phase-2): block A — schemas, api client, owner helper"

STOP and report. Wait for my approval.

================================================================
BLOCK B — REST ENDPOINTS (build BEFORE any wizard UI)
================================================================

Every route handler follows this pattern:
  1. Get authed supabase server client
  2. Call getOwnerBusinessId (skip only on POST /businesses)
  3. Parse body with the zod schema from BLOCK A
  4. Run the supabase query (RLS-scoped)
  5. Return JSON or toErrorResponse on failure

B1. verticals routes (read-only — reads from src/lib/verticals/registry.ts):
    - GET /api/v1/verticals → array of { key, displayName, icon, status, ... } for active verticals
    - GET /api/v1/verticals/[key]/defaults → { services, defaultBufferMinutes, defaultCancellationHours, messagingTone, bookingPageHints }

B2. businesses routes:
    - POST   /api/v1/businesses                       — creates business; requires auth; rejects if user already has one
    - GET    /api/v1/businesses/me                    — returns the owner's business
    - PATCH  /api/v1/businesses/me                    — partial update (name, vertical, default_language, default_currency, optional channel prefs)
    - POST   /api/v1/businesses/me/complete-onboarding — sets onboarding_completed=true; idempotent
    - GET    /api/v1/businesses/check-slug?slug=x     — returns { available: boolean, suggestions?: string[] }

B3. branches routes — full CRUD:
    - GET, POST on /api/v1/branches
    - GET, PATCH, DELETE on /api/v1/branches/[id]
    - DELETE is soft (is_active=false)
    - Validate slug uniqueness per business

B4. services routes — full CRUD + bulk:
    - GET, POST on /api/v1/services
    - GET, PATCH, DELETE on /api/v1/services/[id]
    - POST /api/v1/services/bulk → body: { services: CreateService[] }, returns the created rows in order

B5. staff routes — full CRUD + relations:
    - GET, POST on /api/v1/staff
    - GET, PATCH, DELETE on /api/v1/staff/[id]
    - POST /api/v1/staff/[id]/branches  → body: { branch_ids: string[] } — REPLACES the set (deletes existing staff_branches and inserts new)
    - POST /api/v1/staff/[id]/services  → body: { service_ids: string[] } — REPLACES the set
    - POST /api/v1/staff/[id]/invite    → STUB: return 501 Not Implemented in Phase 2

B6. staff/[id]/availability routes:
    - GET  /api/v1/staff/[id]/availability?branch_id=… → returns weekly slots for that staff×branch
    - PUT  /api/v1/staff/[id]/availability             → body: { branch_id, slots: [{ day_of_week, start_time, end_time }] }
                                                          REPLACES the full weekly schedule (delete + insert in one supabase RPC if practical, or sequential)

B7. Tests (vitest + supabase test client or msw):
    - happy path: POST /businesses creates a row and rejects a second POST from the same user
    - cross-tenant denial: user A cannot GET branches belonging to user B (RLS)
    - PUT /availability replaces slots atomically (no orphaned old slots)

EXIT CRITERION FOR BLOCK B:
  - All routes typecheck and lint
  - The 3 tests above pass
  - Manual curl/Bruno verification of each route shape
  - Single commit: "feat(phase-2): block B — REST endpoints v1 for all domain entities"

STOP and report. Wait for my approval.

================================================================
BLOCK C — WIZARD INFRASTRUCTURE
================================================================

C1. src/lib/wizard/store.ts:
    - localStorage key: 'klyro.wizard.v1' (versioned — bumping clears stale state)
    - Holds the WizardState type: { vertical, business, branch, services[], staff[], schedule{}, messaging, commit:{lastSuccessfulStep,errors} }
    - Use zustand@latest with persist middleware (recommended) OR a useSyncExternalStore-based hook
    - Exposes: useWizard(), setStep(), resetWizard(), getStep()

C2. src/lib/wizard/steps.ts:
    - WIZARD_STEPS array in order with metadata: { key, route, titleKey, completionCheck }
    - nextStep(state, current) / prevStep(state, current) helpers
    - canFinish(state) — true only when all 7 prior steps' completionCheck pass

C3. components/wizard/WizardShell.tsx:
    - Sticky header: <Logo variant="mark" /> + step progress (e.g. "Paso 3 de 8")
    - Children slot (the step component)
    - Sticky footer: Back / Continue buttons
    - Brand styling: --color-bg-base background, --color-violet CTA
    - i18n labels via next-intl

C4. setup/layout.tsx guards:
    - Redirect to /login if unauth
    - Redirect to /dashboard if onboarding_completed=true (call GET /businesses/me)
    - Render <WizardShell> around children

C5. setup/done/page.tsx:
    - Success splash with the cat mark, "¡Listo!" message, the 3 booking link types, auto-redirect to /dashboard after 4s

EXIT CRITERION FOR BLOCK C:
  - /setup loads, shows shell, footer Back/Continue works between empty step pages
  - State persists across reloads (localStorage)
  - Guard correctly redirects authed-but-onboarded users to /dashboard
  - Single commit: "feat(phase-2): block C — wizard shell, state store, step routing"

STOP and report. Wait for my approval.

================================================================
BLOCK D — WIZARD STEP COMPONENTS
================================================================

For each step: react-hook-form + the zod schema from BLOCK A. On Continue, validate, write to wizard store, navigate to next step. Use shadcn/ui primitives. Use copy from src/i18n/locales/{es,en}.json (add the strings — keys live under setup.step1, setup.step2, …).

D1. StepVertical:
    - Grid of 8 cards (one per registry entry, status='active')
    - On select → fetch GET /verticals/[key]/defaults, store in wizard state, Continue enables

D2. StepBusiness:
    - Fields: name, slug (auto-derived from name, editable), country dropdown, default_language, default_currency
    - On slug change (debounced 400ms) → GET /businesses/check-slug; show available/taken
    - Continue blocked if slug taken

D3. StepBranch:
    - Fields: name, slug, address, city, country (default from business), phone (libphonenumber-js E.164), whatsapp_number, timezone (default America/Tegucigalpa for HN)

D4. StepServices:
    - Table prefilled from vertical defaults (name, duration_minutes, price, currency)
    - Add Row / Remove Row / inline edit
    - Min 1 service to Continue

D5. StepStaff:
    - Default row: owner-as-staff, display_name from users.full_name (fetched on mount), disabled
    - "Agregar miembro" button → adds row with display_name + invite email field
    - At least 1 staff (the owner) required

D6. StepSchedule:
    - For each staff, a weekly grid: Mon–Sun, start/end per day, "Cerrado" toggle for off days
    - Default schedule from vertical (e.g. barbershop typical hours from the registry)
    - Validate start < end on every active day

D7. StepMessaging:
    - Primary channel: WhatsApp (default) with phone in E.164
    - Optional: SMS opt-in, Email opt-in
    - Cancellation policy hours (default from vertical)

D8. StepReview:
    - Read-only summary, grouped by section, with "Editar" links jumping back to each step
    - Big "Confirmar y crear" CTA → triggers commit (BLOCK E)

EXIT CRITERION FOR BLOCK D:
  - All 8 step pages render in the wizard
  - Form validation works on each step (client-side + zod-shared)
  - Wizard store correctly captures and restores data across reloads
  - i18n strings present in both es.json and en.json
  - Single commit: "feat(phase-2): block D — wizard step components"

STOP and report. Wait for my approval.

================================================================
BLOCK E — COMMIT ORCHESTRATOR
================================================================

E1. src/lib/wizard/commit.ts:
    - Exports commitWizard(state, { onProgress }) async function
    - Runs in order:
        1. POST /businesses (returns business id)
        2. POST /branches (returns branch id)
        3. POST /services/bulk (returns service ids)
        4. POST /staff (per staff; returns ids)
        5. POST /staff/[id]/branches (per staff)
        6. POST /staff/[id]/services (per staff)
        7. PUT  /staff/[id]/availability (per staff)
        8. PATCH /businesses/me (channel prefs)
        9. POST /businesses/me/complete-onboarding
    - Each successful step: update wizard state's commit.lastSuccessfulStep + onProgress() callback
    - On failure: throw with step index + ApiError details; preserve all already-committed data in state
    - Retry strategy: caller can call commitWizard again; orchestrator should skip already-committed steps based on lastSuccessfulStep

E2. StepReview wires to commitWizard:
    - Disable button + show inline progress ("Creando negocio...", "Creando sucursal...", etc.)
    - On full success: resetWizard() + push to /setup/done
    - On failure: show which step failed, ApiError message, "Reintentar" button that re-runs commitWizard

E3. Edge cases to test:
    - Slug taken in race condition (commit happens after wizard step) → friendly retry with new slug input
    - Network error mid-commit → state preserved, retry resumes from lastSuccessfulStep
    - 401 mid-commit → redirect to login, return to /setup/review on re-auth

EXIT CRITERION FOR BLOCK E:
  - Full wizard run (vertical → review → confirm) creates a complete, valid business in Supabase
  - onboarding_completed=true at the end
  - localStorage cleared after success
  - Failure mid-commit shows useful UI and retries idempotently
  - Single commit: "feat(phase-2): block E — wizard commit orchestrator"

STOP and report. Wait for my approval.

================================================================
BLOCK F — EDIT-AFTER PAGES
================================================================

Same REST endpoints, same lib/api/* client functions, same zod schemas. Brand-consistent forms.

F1. settings/business/page.tsx:
    - Form for name, vertical (dropdown), default_language, default_currency
    - Saves via PATCH /api/v1/businesses/me

F2. settings/branches/page.tsx + [id]/page.tsx:
    - List page: cards or table of all branches; "Agregar sucursal" CTA
    - Detail/edit page: full branch form
    - Add Branch dialog (POST /branches), Edit (PATCH), Soft-delete (DELETE)

F3. settings/services/page.tsx:
    - Table of all services, add/edit/soft-delete inline or via dialog
    - Uses POST/PATCH/DELETE /api/v1/services

F4. settings/team/page.tsx + [id]/page.tsx:
    - List page: staff cards with branch + service counts
    - Detail page: edit staff, manage branch assignments, manage service assignments, manage availability per branch
    - Uses the full staff endpoint set including availability

EXIT CRITERION FOR BLOCK F:
  - All 4 settings sections work end-to-end
  - Same client functions used by the wizard (no duplication)
  - Single commit: "feat(phase-2): block F — settings/edit-after pages"

STOP and report. Wait for my approval.

================================================================
BLOCK G — WIRING + POLISH + TESTS
================================================================

G1. Dashboard setup banner becomes a smart "Continuar setup" CTA:
    - Reads wizard localStorage state
    - Deep-links to the right /setup/* step based on lastSuccessfulStep
    - If no state, links to /setup (step 1)

G2. Empty/loading/error states for every page (use shadcn Skeleton, brand-colored empty states with cat mark)

G3. E2E test (Playwright):
    - Fresh signup → completes wizard for a barbershop → lands on /dashboard with the booking link visible
    - Lives in tests/e2e/wizard.spec.ts

G4. RLS smoke test:
    - Sign up a second user, complete wizard, verify they can't read user 1's data via any of the new endpoints
    - Lives in tests/integration/rls.spec.ts

G5. Update BUILD_STATUS.md:
    - Mark Phase 2 ✅ Done
    - List exit criteria met
    - Set "Active phase" to Phase 3

EXIT CRITERION FOR BLOCK G:
  - E2E test passes locally
  - RLS test passes
  - BUILD_STATUS.md updated
  - Lighthouse score on /setup ≥ 90 (mobile)
  - Single commit: "feat(phase-2): block G — wiring, polish, e2e and rls tests"

================================================================
PHASE 2 DEFINITION OF DONE
================================================================
  ✅ A new owner can complete the wizard end-to-end in <15 minutes
  ✅ DB shows a fully configured business: business + 1 branch + N services + 1+ staff + availability + channel prefs
  ✅ onboarding_completed flips to true at the end
  ✅ Wizard state survives reload via localStorage; clears on success
  ✅ Commit orchestrator is resumable on failure
  ✅ Edit-after pages work for business, branches, services, team
  ✅ All API routes under /api/v1/* with zod-validated bodies, RLS-scoped via getOwnerBusinessId
  ✅ E2E + RLS tests pass
  ✅ pnpm typecheck, lint, test, build all green
  ✅ BUILD_STATUS.md reflects Phase 2 complete

================================================================
REPORT BACK AFTER EACH BLOCK
================================================================
For each block, give me:
1. Confirmation the exit criterion is met
2. Any deviations from this plan and why
3. New deps added (with version pin in lockfile)
4. Open questions or blockers

Then STOP and wait for my approval before starting the next block.

Start now: read Klyro_Technical_PRD.md (Sections 5 and 7) and BUILD_STATUS.md, summarize what you understood about Phase 2 in 5–8 bullets, then begin BLOCK A.
```

---

## 📋 Notes before you start

1. Have `Klyro_Technical_PRD.md` and `BUILD_STATUS.md` reachable from where Claude Code runs.
2. The wizard depends on `next-intl` strings — Claude Code will add new keys to `src/i18n/locales/{es,en}.json` per step. Expect ~50 new strings per locale by end of Block D.
3. The single-branch / owner-as-only-staff constraint in the wizard is intentional for MVP. Multi-branch / multi-staff setup lives in the edit-after pages from day one.
4. Block B's stub of `POST /staff/[id]/invite` returning 501 is deliberate — real email comes in Phase 4 (Messaging Engine). The UI in Block D can still capture invite emails and store them in the wizard state; the orchestrator will silently skip the invite call until Phase 4.
5. Expect Phase 2 to take 1–2 days of Claude Code time at a steady pace, mostly in Block D (8 step components) and Block F (4 settings sections).

---

## 🔁 Block-by-block pattern

After each block is approved:

```
Proceed with Block <X> of Phase 2 from PROMPT_CLAUDE_CODE_PHASE_2.md.

Same rules apply:
- Read the block section first, summarize the plan
- Implement step by step
- Use @latest for any new deps
- Apply Klyro brand tokens and the <Logo /> component
- End with a single commit (do not push)
- Report exit criteria back to me
- Wait for my approval before moving on
```
