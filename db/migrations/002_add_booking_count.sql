-- Migration 002: Add booking_count to reservations
-- Run this in the Supabase SQL editor.

ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS booking_count INTEGER NOT NULL DEFAULT 1;

COMMENT ON COLUMN reservations.booking_count IS
  'Total number of stays for this guest (1 = first visit, 2 = second visit, etc.)';
