---
name: project-architecture
description: Klyro codebase architecture snapshot — Phase 0 complete, Phase 1 built awaiting smoke test
metadata:
  type: project
---

Phase 0 (Foundation) complete. Phase 1 (Auth & Onboarding Shell) built, needs smoke testing. Phase 2 (Setup Wizard) is next.

**Why:** Reviewing before Phase 2 starts to ensure no blocking issues carry forward.
**How to apply:** When suggesting Phase 2 work, confirm Phase 1 blockers are addressed first.

Key architectural facts confirmed by reading code:
- Supabase clients: `client.ts` (browser singleton), `server.ts` (async, Server Components/Actions), `middleware.ts` (has `updateSession` but is NOT called by `src/middleware.ts` — the middleware inlines its own client instead)
- RLS via `get_my_business_id()` and `get_my_role()` helper functions — `security definer`
- Auth trigger in `private` schema (not `public`) — correct
- `businesses.vertical` is plain `text` — never a DB enum
- Message templates: 84 rows (7 verticals × 2 channels × 2 languages × 3 types) — seeded via migration 0003
- pg_cron dispatches messages every 5 minutes via `net.http_post` to Edge Function
- No API routes exist yet — only auth callback route handler
- No tests exist in `src/` at all — vitest config points to `./tests/setup.ts` which doesn't exist

[[security-patterns]] [[convention-violations]]
