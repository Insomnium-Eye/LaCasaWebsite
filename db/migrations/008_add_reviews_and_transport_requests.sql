-- Migration 008: Create tables the live database is missing
-- Run this in the Supabase SQL editor. Safe to run more than once.
--
-- reviews + review_images → "Leave a Review" portal tab and /admin/reviews
-- transport_requests      → paid portal transport trips, recorded by the Stripe webhook
-- Definitions match db/schema.sql and the queries in lib/supabase-helpers.ts.

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  stars INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  headline VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  anonymous BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'pending',      -- 'pending' | 'approved' | 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transport_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  destination VARCHAR(100) NOT NULL,
  custom_destination TEXT,
  scheduled_at TIMESTAMP NOT NULL,
  passengers INT DEFAULT 1,
  round_trip BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2) NOT NULL,             -- MXN for paid trips
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',      -- 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_reservation_id ON reviews(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON review_images(review_id);
CREATE INDEX IF NOT EXISTS idx_transport_requests_reservation_id ON transport_requests(reservation_id);

-- Server-only access (see README → Engineering rules → Protect user data)
REVOKE ALL ON reviews, review_images, transport_requests FROM anon, authenticated;

ALTER TABLE reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_images      ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS server_only ON reviews;
DROP POLICY IF EXISTS server_only ON review_images;
DROP POLICY IF EXISTS server_only ON transport_requests;

CREATE POLICY server_only ON reviews            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY server_only ON review_images      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY server_only ON transport_requests FOR ALL USING (true) WITH CHECK (true);

-- Check: the three tables should be listed with rls_on = true, anon_can_read = false.
SELECT c.relname                                    AS table_name,
       c.relrowsecurity                             AS rls_on,
       has_table_privilege('anon', c.oid, 'SELECT') AS anon_can_read
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname IN ('reviews', 'review_images', 'transport_requests')
ORDER BY 1;
