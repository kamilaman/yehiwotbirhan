-- ==============================================================================
-- BATU YEHIYWOT BERHAN CHURCH — Production PostgreSQL Schema
-- Strict financial precision (NUMERIC 14,2), UUIDs, and immutable audit logs
-- ==============================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Core Donations Table
CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  public_id VARCHAR(64) UNIQUE NOT NULL DEFAULT uuid_generate_v4()::text,
  donor_name VARCHAR(255) NOT NULL,
  donor_email VARCHAR(255) NOT NULL,
  donor_address TEXT,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'ETB' CHECK (currency IN ('ETB', 'USD')),
  frequency VARCHAR(50) NOT NULL DEFAULT 'one_time',
  designation VARCHAR(100) NOT NULL DEFAULT 'building_fund',
  payment_provider VARCHAR(50) NOT NULL DEFAULT 'chapa',
  transaction_ref VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'reversed', 'refunded', 'verification_required', 'refund_initiated')),
  is_archived BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1b. Refunds Table (Financial Audit Trail for Reversals & Refunds)
CREATE TABLE IF NOT EXISTS refunds (
  id SERIAL PRIMARY KEY,
  payment_attempt_id INTEGER REFERENCES payment_attempts(id) ON DELETE RESTRICT,
  donation_id INTEGER REFERENCES donations(id) ON DELETE RESTRICT,
  tx_ref VARCHAR(255) NOT NULL,
  provider_refund_reference VARCHAR(255),
  refund_reference VARCHAR(255) UNIQUE NOT NULL,
  requested_amount NUMERIC(14, 2) NOT NULL CHECK (requested_amount > 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'ETB' CHECK (currency IN ('ETB', 'USD')),
  reason TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'reversed')),
  provider_status VARCHAR(50),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Payment Attempts Table (Authoritative Provider Audit Trail)
CREATE TABLE IF NOT EXISTS payment_attempts (
  id SERIAL PRIMARY KEY,
  donation_id INTEGER REFERENCES donations(id) ON DELETE SET NULL,
  provider VARCHAR(50) NOT NULL DEFAULT 'chapa',
  tx_ref VARCHAR(255) NOT NULL UNIQUE,
  chapa_reference VARCHAR(255),
  checkout_url TEXT,
  payment_method VARCHAR(100),
  requested_amount NUMERIC(14, 2) NOT NULL CHECK (requested_amount > 0),
  requested_currency VARCHAR(10) NOT NULL DEFAULT 'ETB' CHECK (requested_currency IN ('ETB', 'USD')),
  provider_amount NUMERIC(14, 2),
  provider_currency VARCHAR(10),
  provider_status VARCHAR(50) DEFAULT 'pending',
  provider_charge NUMERIC(14, 2) DEFAULT 0,
  failure_reason TEXT,
  provider_mode VARCHAR(20) DEFAULT 'test' CHECK (provider_mode IN ('test', 'live', 'sandbox')),
  verified_at TIMESTAMP WITH TIME ZONE,
  last_verification_attempt_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Payment Status History Table (FSM Transition Log)
CREATE TABLE IF NOT EXISTS payment_status_history (
  id SERIAL PRIMARY KEY,
  payment_attempt_id INTEGER REFERENCES payment_attempts(id) ON DELETE SET NULL,
  tx_ref VARCHAR(255) NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  source VARCHAR(50) NOT NULL CHECK (source IN ('INITIALIZATION', 'CALLBACK', 'WEBHOOK', 'VERIFY', 'RECONCILIATION', 'REFUND', 'ADMIN')),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Webhook Events Table (Cryptographic Signature & Idempotency Audit)
CREATE TABLE IF NOT EXISTS webhook_events (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(50) NOT NULL DEFAULT 'chapa',
  event_type VARCHAR(100) DEFAULT 'charge.complete',
  tx_ref VARCHAR(255),
  provider_reference VARCHAR(255),
  signature_verified BOOLEAN DEFAULT FALSE,
  payload_hash VARCHAR(64) UNIQUE NOT NULL,
  payload_json TEXT NOT NULL,
  processing_status VARCHAR(50) DEFAULT 'processed' CHECK (processing_status IN ('processed', 'duplicate', 'failed')),
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Contact Messages & Prayer Requests Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'unread',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
  id SERIAL PRIMARY KEY,
  event_title VARCHAR(255) NOT NULL,
  participant_name VARCHAR(255),
  participant_email VARCHAR(255) NOT NULL,
  participant_phone VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Building Campaign Live Stats Table (Separated ETB and USD Goals)
CREATE TABLE IF NOT EXISTS campaign_stats (
  id SERIAL PRIMARY KEY,
  goal_usd NUMERIC(14, 2) DEFAULT 500000.00,
  raised_usd NUMERIC(14, 2) DEFAULT 315000.00,
  goal_etb NUMERIC(14, 2) DEFAULT 60000000.00,
  raised_etb NUMERIC(14, 2) DEFAULT 37800000.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. IT Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Audit & Activity Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  admin_username VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Pastor Posts & Sermon Media Table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL DEFAULT 'Pastor Zerfu',
  category VARCHAR(100) NOT NULL DEFAULT 'sermon_poster',
  content TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance & integrity
CREATE INDEX IF NOT EXISTS idx_pg_donations_tx_ref ON donations(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_pg_donations_public_id ON donations(public_id);
CREATE INDEX IF NOT EXISTS idx_pg_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_pg_donations_archived ON donations(is_archived);
CREATE INDEX IF NOT EXISTS idx_pg_attempts_tx_ref ON payment_attempts(tx_ref);
CREATE INDEX IF NOT EXISTS idx_pg_history_tx_ref ON payment_status_history(tx_ref);
CREATE INDEX IF NOT EXISTS idx_pg_webhook_hash ON webhook_events(payload_hash);
CREATE INDEX IF NOT EXISTS idx_pg_webhook_tx_ref ON webhook_events(tx_ref);
CREATE INDEX IF NOT EXISTS idx_pg_refunds_tx_ref ON refunds(tx_ref);
CREATE INDEX IF NOT EXISTS idx_pg_refunds_ref ON refunds(refund_reference);

-- Seed initial building campaign stats if empty
INSERT INTO campaign_stats (goal_usd, raised_usd, goal_etb, raised_etb)
SELECT 500000.00, 315000.00, 60000000.00, 37800000.00
WHERE NOT EXISTS (SELECT 1 FROM campaign_stats);
