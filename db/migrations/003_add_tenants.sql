-- Migration 003: Long-term tenants with automatic monthly rent (Stripe subscriptions)
-- Run this in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL DEFAULT '',
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  unit_id VARCHAR(50) NOT NULL,
  unit_name VARCHAR(100),
  monthly_rent NUMERIC(10, 2) NOT NULL CHECK (monthly_rent > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'mxn',
  first_rent_date DATE NOT NULL,             -- always the 1st of a month
  months INTEGER NOT NULL CHECK (months BETWEEN 1 AND 36),
  language VARCHAR(2) NOT NULL DEFAULT 'en',
  notes TEXT,
  -- 'pending_setup' → tenant hasn't saved a card yet
  -- 'activating'    → card saved, subscription being created (transient)
  -- 'active'        → subscription running
  -- 'past_due'      → latest rent charge failed (Stripe is retrying)
  -- 'completed'     → lease ran its full length
  -- 'cancelled'     → ended early by admin
  status VARCHAR(20) NOT NULL DEFAULT 'pending_setup',
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

CREATE TABLE IF NOT EXISTS rent_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  period_start DATE NOT NULL,                -- the rent month this charge covers
  status VARCHAR(20) NOT NULL,               -- 'paid' | 'failed'
  hosted_invoice_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rent_payments_tenant ON rent_payments(tenant_id);
