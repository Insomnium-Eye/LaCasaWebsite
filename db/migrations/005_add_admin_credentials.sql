-- Migration 005: Password for the admin login on /portal
-- Run this in the Supabase SQL editor.
--
-- Single row. password_hash NULL (or no row) = the admin still uses the shared
-- default password (GUEST_DEFAULT_PASSWORD env var). Changed from the portal's
-- User Profile tab while logged in as admin.

CREATE TABLE IF NOT EXISTS admin_credentials (
  id TEXT PRIMARY KEY DEFAULT 'admin' CHECK (id = 'admin'),
  password_hash TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
