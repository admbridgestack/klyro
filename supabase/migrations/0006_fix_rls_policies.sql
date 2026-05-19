-- Fix overly-permissive RLS policies introduced in 0002.
--
-- The service role key bypasses RLS by default in Supabase, so these
-- policies are both unnecessary and a security risk: any authenticated
-- user could insert/modify rows they don't own.

-- messages: drop the catch-all "for all using (true)" policy.
-- The dispatch edge function and pg_cron job use the service role key
-- and therefore bypass RLS without needing an explicit policy.
drop policy if exists "service role can manage messages" on messages;

-- users: drop the unrestricted INSERT policy.
-- The auth trigger runs as SECURITY DEFINER under the postgres role,
-- which bypasses RLS. No explicit INSERT policy is needed.
drop policy if exists "service role can insert users" on users;
