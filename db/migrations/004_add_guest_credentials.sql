-- Migration 004: Guest portal passwords and usernames
-- Run this in the Supabase SQL editor.
--
-- password_hash NULL means the guest still uses the shared default password
-- (GUEST_DEFAULT_PASSWORD env var). That covers every existing reservation and
-- every new one, so no default password is ever stored in the database.

ALTER TABLE reservations ADD COLUMN IF NOT EXISTS username VARCHAR(30);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_reservations_username ON reservations (LOWER(username));

COMMENT ON COLUMN reservations.password_hash IS
  'scrypt hash of the guest portal password; NULL = shared default password';
