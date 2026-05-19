---
name: security-patterns
description: Security findings and patterns in Klyro codebase — Phase 1 review
metadata:
  type: project
---

Key security findings from Phase 1 review:

1. **Service role key used on public landing page** (`src/app/[locale]/page.tsx`) — `SUPABASE_SERVICE_ROLE_KEY` used to count businesses on a public page. This is a dev scaffold; must be removed before any production traffic. The service key bypasses all RLS.

2. **Middleware uses inline Supabase client instead of `updateSession`** — `src/middleware.ts` duplicates the cookie-handling logic that `src/lib/supabase/middleware.ts` already encapsulates. The `updateSession` function exists but is never called. This creates a maintenance risk if the cookie logic diverges.

3. **`next` redirect param on login is user-controlled** — The `next` query parameter set in middleware is passed to the callback route and used directly as a redirect target. No validation that it's a relative path — open redirect risk if `next` is set to an external URL.

4. **RLS `service role can manage messages` policy** — `using (true)` allows ANY authenticated user (not just service role) to manage messages if using the anon key with a JWT. The intent is service-role-only but the policy name is misleading — it applies to all roles.

5. **Auth trigger uses `private` schema** — Correct pattern; `private.handle_new_user()` runs as `security definer` with empty `search_path`. Well-implemented.

6. **`users` INSERT policy** — `with check (true)` means any authenticated user can insert a row into `public.users`. This is intentional (for the auth trigger to work via service role) but is a broad policy. Should be restricted to service role only in prod.

**Why:** Documenting for future reviews so these known issues are tracked.
**How to apply:** Flag the service role key on the public page as critical in any Phase 2+ review.

[[project-architecture]]
