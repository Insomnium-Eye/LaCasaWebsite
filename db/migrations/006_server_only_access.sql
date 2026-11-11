-- Migration 006: Let the website's server use the tables added in 003 and 005
-- Run this in the Supabase SQL editor.
--
-- Supabase auto-enables row-level security (RLS) on new tables. With no
-- policy, RLS blocks every write — including the website's own server
-- ("new row violates row-level security policy").
--
-- These tables are only ever touched by the website's server (via
-- DATABASE_URL), never by browsers. So:
--   1. Remove all access for Supabase's public API roles (anon, authenticated).
--      The anon key is public, so this keeps admin password hashes and tenant
--      data unreachable through it.
--   2. Keep RLS on, with a policy that lets any role that still has table
--      privileges (i.e. the server's role) read and write.

REVOKE ALL ON admin_credentials, tenants, rent_payments FROM anon, authenticated;

ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants           ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS server_only ON admin_credentials;
DROP POLICY IF EXISTS server_only ON tenants;
DROP POLICY IF EXISTS server_only ON rent_payments;

CREATE POLICY server_only ON admin_credentials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY server_only ON tenants           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY server_only ON rent_payments     FOR ALL USING (true) WITH CHECK (true);
