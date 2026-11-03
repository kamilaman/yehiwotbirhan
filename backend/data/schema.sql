-- BATU YEHIYWOT BERHAN CHURCH - Database Schema (SQLite / PostgreSQL Compatible)

-- 1. Core Donations Table
CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  public_id TEXT UNIQUE,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_address TEXT,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETB',
  frequency TEXT NOT NULL DEFAULT 'one_time',
  designation TEXT NOT NULL DEFAULT 'building_fund',
  payment_provider TEXT NOT NULL,
  transaction_ref TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled', 'refunded', 'verification_required', 'refund_initiated'
  is_archived INTEGER DEFAULT 0,
  paid_at DATETIME,
  completed_at DATETIME,
  cancelled_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1b. Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_attempt_id INTEGER,
  donation_id INTEGER,
  tx_ref TEXT NOT NULL,
  provider_refund_reference TEXT,
  refund_reference TEXT UNIQUE NOT NULL,
  requested_amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETB',
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  provider_status TEXT,
  verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_attempt_id) REFERENCES payment_attempts (id) ON DELETE RESTRICT,
  FOREIGN KEY (donation_id) REFERENCES donations (id) ON DELETE RESTRICT
);

-- 2. Payment Attempts Table (Authoritative Provider Audit Trail)
CREATE TABLE IF NOT EXISTS payment_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_id INTEGER,
  provider TEXT NOT NULL DEFAULT 'chapa',
  tx_ref TEXT NOT NULL UNIQUE,
  chapa_reference TEXT,
  checkout_url TEXT,
  payment_method TEXT,
  requested_amount REAL NOT NULL,
  requested_currency TEXT NOT NULL DEFAULT 'ETB',
  provider_amount REAL,
  provider_currency TEXT,
  provider_status TEXT DEFAULT 'pending',
  provider_charge REAL DEFAULT 0,
  failure_reason TEXT,
  provider_mode TEXT, -- 'test' or 'live'
  verified_at DATETIME,
  last_verification_attempt_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donation_id) REFERENCES donations (id) ON DELETE SET NULL
);

-- 3. Payment Status History Table (Finite State Machine Transitions)
CREATE TABLE IF NOT EXISTS payment_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_attempt_id INTEGER,
  tx_ref TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  source TEXT NOT NULL, -- 'INITIALIZATION', 'CALLBACK', 'WEBHOOK', 'VERIFY', 'RECONCILIATION', 'ADMIN'
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Webhook Events Table (Cryptographic Signature & Idempotency Audit)
CREATE TABLE IF NOT EXISTS webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL DEFAULT 'chapa',
  event_type TEXT DEFAULT 'charge.complete',
  tx_ref TEXT,
  provider_reference TEXT,
  signature_verified INTEGER DEFAULT 0,
  payload_hash TEXT UNIQUE,
  payload_json TEXT,
  processing_status TEXT DEFAULT 'processed', -- 'processed', 'duplicate', 'failed'
  error_message TEXT,
  processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Contact Messages & Prayer Requests Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_title TEXT NOT NULL,
  participant_name TEXT,
  participant_email TEXT NOT NULL,
  participant_phone TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Building Campaign Live Stats Table
CREATE TABLE IF NOT EXISTS campaign_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_usd REAL DEFAULT 500000,
  raised_usd REAL DEFAULT 315000,
  goal_etb REAL DEFAULT 60000000,
  raised_etb REAL DEFAULT 37800000,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. IT Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Audit & Activity Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_username TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Pastor Posts & Sermon Media Table
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Pastor Zerfu',
  category TEXT NOT NULL DEFAULT 'sermon_poster',
  content TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_featured INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal lookup performance & integrity
CREATE INDEX IF NOT EXISTS idx_donations_tx_ref ON donations(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_attempts_tx_ref ON payment_attempts(tx_ref);
CREATE INDEX IF NOT EXISTS idx_history_tx_ref ON payment_status_history(tx_ref);
CREATE INDEX IF NOT EXISTS idx_webhook_hash ON webhook_events(payload_hash);
CREATE INDEX IF NOT EXISTS idx_webhook_tx_ref ON webhook_events(tx_ref);

-- Seed initial building campaign stats if empty
INSERT INTO campaign_stats (goal_usd, raised_usd, goal_etb, raised_etb)
SELECT 500000, 315000, 60000000, 37800000
WHERE NOT EXISTS (SELECT 1 FROM campaign_stats);

-- Seed initial Pastor posts & posters if empty
INSERT INTO posts (title, author, category, content, image_url, is_featured)
SELECT 'Pastor Zerfu — Welcome to BATU YEHIYWOT BERHAN CHURCH', 'Pastor Zerfu', 'pastor_message', 'Welcome to BATU YEHIYWOT BERHAN CHURCH. We are dedicated to walking in biblical truth, vibrant worship, and serving our community with the love of Christ in Batu, Ethiopia.', 'images/pastor_zerfu.png', 1
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE category = 'pastor_message');

INSERT INTO posts (title, author, category, content, image_url, is_featured)
SELECT 'Sunday Sermon Series: Walking in the Light (የክርስቶስ ብርሃን)', 'Pastor Zerfu', 'sermon_poster', 'Join us this Sunday at 9:00 AM (Amharic) and 11:00 AM (English & Afaan Oromo) for our new sermon series exploring 1 John 1:7. All are welcome to encounter God’s transformational presence.', 'images/sermon_poster.png', 1
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE category = 'sermon_poster');

INSERT INTO posts (title, author, category, content, image_url, is_featured)
SELECT 'Building Fund: Church Building & Front Entrance Views', 'Church Leadership', 'building_update', 'Praise God! Our new church building front facade, main entrance steps, and sanctuary facility progress in Batu (Ziway). Together we are building a home for generations.', 'images/church_building.jpg', 1
WHERE NOT EXISTS (SELECT 1 FROM posts WHERE category = 'building_update');
