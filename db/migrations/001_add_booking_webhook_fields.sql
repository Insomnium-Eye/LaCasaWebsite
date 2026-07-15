-- Migration 001: Add webhook booking fields to reservations
-- Run this in the Supabase SQL editor before using the booking webhook.

-- 1. Allow multiple bookings per email (repeat guests would violate the unique constraint)
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_email_key;

-- 2. Allow email to be null (external platform bookings may not always include one)
ALTER TABLE reservations ALTER COLUMN email DROP NOT NULL;

-- 3. Track which platform the booking came from
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS source VARCHAR(30) DEFAULT 'direct';
-- Values: 'airbnb' | 'vrbo' | 'booking_com' | 'direct' | 'external'

-- 4. Track total amount paid (distinct from nightly_rate * nights due to platform fees/discounts)
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS total_paid DECIMAL(10, 2);
