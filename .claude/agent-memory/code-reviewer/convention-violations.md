---
name: convention-violations
description: Convention violations found in Phase 1 review — hardcoded strings, CSS, middleware patterns
metadata:
  type: project
---

Recurring convention issues found in Phase 1 code:

1. **Hardcoded display strings** in `src/app/[locale]/(dashboard)/dashboard/page.tsx` lines 83-85 — checklist items ("Elige tu vertical", "Configura tu negocio", "Agrega tus servicios") are Spanish-only hardcoded strings, not i18n keys.

2. **Hardcoded string in Sidebar** — `aria-label="Cerrar sesión"` at `src/components/dashboard/Sidebar.tsx` line 116 is hardcoded Spanish, not an i18n key.

3. **Inline CSS custom properties via `var()` syntax** — Throughout the codebase, color tokens are applied as `className="bg-[var(--color-violet)]"` instead of Tailwind utility classes like `bg-violet`. This is technically valid in Tailwind v4 but is inconsistent — `globals.css` defines `@theme` tokens which should generate `bg-violet`, `text-violet` etc. directly. The `var()` pattern works but is verbose.

4. **`updateSession` middleware function unused** — `src/lib/supabase/middleware.ts` exports `updateSession` but `src/middleware.ts` never imports or calls it, duplicating the cookie logic. Either use `updateSession` or delete the file.

5. **Logo component uses `next/image` `Image` import** — `src/components/shared/Logo.tsx` imports `Image` from `next/image` on line 1 but only uses it for the `lockup` variant. The `mark` and `wordmark` variants use SVG directly (correct). The `Image` import is fine — but `Logo.tsx` is the correct usage point for `<img>`-equivalent, not a violation.

6. **Error message hardcoded in auth action** — `src/lib/actions/auth.ts` line 45: `return { error: "Email requerido" }` is a hardcoded Spanish string not going through i18n.

7. **Dashboard page has hardcoded placeholder text** — `src/app/[locale]/(dashboard)/dashboard/page.tsx` line 100: "Tu dashboard aparecerá aquí en la Fase 5." is hardcoded Spanish, not an i18n key.

8. **No tests exist** — Zero test files in `src/`. The `vitest.config.ts` references `./tests/setup.ts` which does not exist. `pnpm test` would immediately fail.

**Why:** Documenting for consistent enforcement in Phase 2 reviews.
**How to apply:** Flag any new hardcoded strings and the missing test setup as blockers for Phase 2 PR reviews.

[[project-architecture]]
