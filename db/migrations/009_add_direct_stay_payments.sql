-- Migration 009: Paid direct bookings ("Book directly" on the unit cards)
-- Run this in the Supabase SQL editor BEFORE deploying the code that uses it. Safe to run more than once.
--
-- The Stripe webhook records each paid stay as a reservation. stripe_session_id
-- is unique, so a webhook Stripe delivers twice still creates only one reservation.
-- No new table, so no new row-level security block (reservations is already locked down by 007).

ALTER TABLE reservations ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_currency VARCHAR(3);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS guests INT;

-- NULLs don't clash, so reservations without a Stripe payment are unaffected.
CREATE UNIQUE INDEX IF NOT EXISTS reservations_stripe_session_id_key ON reservations(stripe_session_id);

-- Check: should list the three columns.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'reservations' AND column_name IN ('stripe_session_id', 'payment_currency', 'guests');
