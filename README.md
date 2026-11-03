# BATU YEHIYWOT BERHAN CHURCH — Enterprise Full-Stack Web Application

An enterprise-grade, responsive, accessible, high-performance web platform and IT Admin Portal designed for **BATU YEHIYWOT BERHAN CHURCH** in Batu, Ethiopia.

Built with a modular **Decoupled Frontend & Backend Architecture**, Docker containerization, Nginx reverse proxying, modular Controllers & Routes, SQLite volume persistence, WCAG 2.2 AA accessibility, and full **Ethiopian & International Payment Integration Architecture** supporting Telebirr, CBE, Coopbank, Awash Bank, Birhan Bank, Stripe, and PayPal.

---

## 🏗️ Production Architecture Overview

```text
ye-hiwot-birhan/
├── docker-compose.yml           # Single-command production container orchestration
├── package.json                 # Universal root scripts
├── backend/                     # Decoupled Express.js REST API Server
│   ├── Dockerfile               # Node.js production image
│   ├── .env.example             # Environment configuration template
│   ├── package.json             # Backend dependencies
│   ├── data/
│   │   ├── schema.sql           # Database schema & initial seeders
│   │   └── church_database.sqlite # Persistent SQLite database
│   └── src/
│       ├── server.js            # Express application entrypoint
│       ├── config/              # App & DB connections
│       ├── middleware/          # Auth & security middleware
│       ├── controllers/         # Modular controllers (Admin, Donations, Posts, etc.)
│       └── routes/              # Central REST API routes (/api/*)
└── frontend/                    # Decoupled Web Client & Admin Portal
    ├── Dockerfile               # Nginx Alpine container
    ├── nginx.conf               # Nginx reverse proxy (/api -> backend:5000)
    ├── index.html               # Homepage (Pastor Showcase, Beliefs, Services)
    ├── admin.html               # IT Admin Management Portal (7 Modules)
    ├── building-fund.html       # Building Fund Donation Page
    ├── about.html               # Leadership & Faith Statement
    ├── ministries.html          # Church Ministries Breakdown
    ├── events.html              # Upcoming Events & Registration
    ├── contact.html             # Visitor Message & Prayer Request Page
    ├── css/                     # Custom Tailwind CSS & Design System
    ├── js/                      # Modular Client & Admin JS Logic
    └── images/                  # Generated Pastor Posters & Assets
```

---

## 🚀 How to Deploy in Production

### Option 1: One-Command Deployment using Docker Compose (Recommended)

Ensure Docker & Docker Compose are installed on your production server:

```bash
docker-compose up -d --build
```

- **Frontend (Nginx)**: Runs on Port `80` (Proxies `/api` requests to backend).
- **Backend (Node.js API)**: Runs on Port `5000` inside Docker network.
- **Database Persistence**: Saved in Docker volume `sqlite_data`.

To stop deployment:
```bash
docker-compose down
```

---

### Option 2: Running Locally with Node.js

From the root directory:

```bash
npm start
# or
npm run dev
```

- **Website URL**: `http://localhost:5000`
- **IT Admin Portal**: `http://localhost:5000/admin.html`
- **Default IT Admin Credentials**: Username: `admin` | Password: `admin123`

---

### Option 3: Running the IT Admin Portal Individually (Dedicated Port 3001)

To run the IT Admin Portal isolated on its own dedicated port alongside the Backend API:

```bash
npm run admin
```

- **Dedicated Admin Portal**: `http://localhost:3001` (Direct access; automatically redirects to Admin Portal)
- **Backend API**: `http://localhost:5000`
- **Default IT Admin Credentials**: Username: `admin` | Password: `admin123`

---

## 🇪🇹 Production Chapa Payment Gateway (Ethiopia)

The church platform utilizes an enterprise-grade, cryptographically verified integration with **[Chapa](https://chapa.co)** supporting:
- **Telebirr** (Web & App checkout)
- **CBE Birr** (Commercial Bank of Ethiopia)
- **Coopbank** (Cooperative Bank of Oromia / CoopPay)
- **Awash Bank & Amole**
- **Bank Transfer** (Direct Account 1000 4829 3019 4)

### Webhook & Callback Architecture:
1. **Asynchronous Webhooks**: Mounted at `/api/donations/chapa/webhook` and `/api/webhooks/chapa`.
2. **Cryptographic Integrity**: Incoming payloads are validated against `x-chapa-signature` and `chapa-signature` headers using HMAC-SHA256 and constant-time comparison (`crypto.timingSafeEqual`). Webhook processing strictly fails closed if keys or signatures are invalid.
3. **Idempotency**: Webhook events are hashed (SHA-256) and deduplicated in the `webhook_events` table to prevent duplicate transaction recording.
4. **Critical Data Verification**: Compares reported amount and currency against local payment attempt records. Flagged discrepancies transition to `verification_required` without updating financial campaign totals.
5. **Zero Client Trust**: The frontend is untrusted. Donations cannot be created as `completed` by clients. State is updated only after authoritative server-to-server verification with Chapa.
6. **Refund Auditing**: Admin portal includes controlled refund triggers that invoke Chapa's refund API (`POST /v1/refund/:tx_ref`) and record immutable entries in the `refunds` table.
7. **Soft-Archive Ledger**: Financial records are never physically deleted (`DELETE` operations convert to non-destructive `is_archived = 1` updates).

### Automatic Reconciliation (cPanel Cron):
To automatically reconcile any abandoned or delayed checkouts where the donor completed payment on Chapa but closed the browser before redirection:
```bash
# Run manually:
npm --prefix backend run reconcile

# Or schedule in cPanel Cron Jobs (Every 30 minutes):
0,30 * * * * /usr/local/bin/node /home/username/public_html/backend/src/scripts/reconcile-chapa.js >> /home/username/logs/chapa_reconcile.log 2>&1
```

---

## 🔒 Security Best Practices Enforced

1. **Decoupled Architecture**: Frontend and Backend layers can be scaled independently behind Nginx, Docker, or hosted on cPanel Passenger.
2. **PBKDF2 Password Hashing**: IT Admin passwords are salt-hashed securely using SHA-512 with 100,000 iterations.
3. **HMAC-SHA256 Webhook Verification**: Rejects any forged or tampered webhook callbacks with dual header validation.
4. **Financial Audit Logging**: All administrative actions, payment settlements, and status transitions are permanently audited into `audit_logs` and `payment_status_history`.
5. **Strict Currency Isolation**: ETB and USD donations are accounted for separately in all metrics, preventing fictitious exchange conversions.
6. **HTTP Security Headers**: Express server injects `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, and `Referrer-Policy`.
7. **Environment Isolation**: Production keys and secrets are managed via `.env` with strict test/live mode validation.

