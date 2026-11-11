-- Migration 007: Close every table to Supabase's public API
-- Run this in the Supabase SQL editor. Safe to run more than once.
--
-- Supabase exposes tables through its REST API to the "anon" and
-- "authenticated" roles. Our website never uses that API — only its server
-- talks to Postgres (via DATABASE_URL) — so nothing should be reachable
-- through it. This applies to every table in the public schema the same
-- rules migration 006 applied to the newer tables:
--   1. revoke all access from anon and authenticated,
--   2. turn row-level security on,
--   3. add a policy so the website's server role can still read and write.
-- The Supabase dashboard and the service_role key are unaffected.

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS server_only ON public.%I', t);
    EXECUTE format('CREATE POLICY server_only ON public.%I FOR ALL USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- Sequences (auto-increment counters) don't need public API access either.
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

-- Tables created later from the SQL editor won't be granted to anon/authenticated.
-- (New migrations should still include the RLS block from the README.)
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- Check the result: every row should show rls_on = true and anon_can_read = false.
SELECT c.relname                                    AS table_name,
       c.relrowsecurity                             AS rls_on,
       has_table_privilege('anon', c.oid, 'SELECT') AS anon_can_read
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY 1;
