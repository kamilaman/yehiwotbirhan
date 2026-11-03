/**
 * BATU YEHIYWOT BERHAN CHURCH — Chapa Reconciliation Worker
 * 
 * Scans for pending Chapa payment attempts that may have been completed by the donor
 * without returning to the website or where a webhook notification was delayed/missed.
 * Compatible with PostgreSQL and SQLite. Suitable for execution via cPanel Cron.
 * 
 * Example cPanel Cron (every 30 mins):
 * 0,30 * * * * /usr/local/bin/node /home/username/public_html/backend/src/scripts/reconcile-chapa.js >> /home/username/logs/chapa_reconcile.log 2>&1
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { db } = require('../config/database');
const chapaService = require('../services/chapaService');

console.log(`[Reconciler] [${new Date().toISOString()}] Starting Chapa Payment Reconciliation Run...`);

// Prevent overlapping cron jobs
const LOCK_FILE = path.join(__dirname, '../../data/reconciler.lock');
if (fs.existsSync(LOCK_FILE)) {
  try {
    const stats = fs.statSync(LOCK_FILE);
    const ageMinutes = (Date.now() - stats.mtimeMs) / (1000 * 60);
    if (ageMinutes < 15) {
      console.log(`[Reconciler] Run locked by another instance running ${ageMinutes.toFixed(1)} mins ago. Skipping.`);
      process.exit(0);
    } else {
      console.warn(`[Reconciler] Removing stale lock file older than 15 mins.`);
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (err) {
    // Continue if lock file can't be checked
  }
}

try {
  fs.writeFileSync(LOCK_FILE, String(process.pid));
} catch (e) {
  // If lock cannot be written, proceed anyway
}

function releaseLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (e) {}
}

process.on('exit', releaseLock);
process.on('SIGINT', () => { releaseLock(); process.exit(0); });
process.on('SIGTERM', () => { releaseLock(); process.exit(0); });

async function runReconciliation() {
  const isPostgres = Boolean(db.isPostgres);
  const timeCondition = isPostgres
    ? "created_at <= (NOW() - INTERVAL '15 minutes')"
    : "datetime(created_at, '+15 minutes') <= datetime('now')";

  const query = `
    SELECT id, donation_id, tx_ref, requested_amount, requested_currency, created_at
    FROM payment_attempts
    WHERE provider = 'chapa'
      AND provider_status = 'pending'
      AND ${timeCondition}
    ORDER BY created_at ASC
    LIMIT 50
  `;

  db.all(query, [], async (err, rows) => {
    if (err) {
      console.error('[Reconciler] Error fetching pending attempts:', err.message);
      releaseLock();
      process.exit(1);
    }

    if (!rows || rows.length === 0) {
      console.log('[Reconciler] No pending Chapa attempts older than 15 minutes found. Clean state.');
      releaseLock();
      process.exit(0);
    }

    console.log(`[Reconciler] Processing ${rows.length} pending attempts for verification...`);

    let reconciledCount = 0;
    let failedCount = 0;
    let unresolvedCount = 0;

    for (const row of rows) {
      try {
        console.log(`[Reconciler] Checking tx_ref: ${row.tx_ref} (Requested: ${row.requested_amount} ${row.requested_currency})...`);
        const chapaResult = await chapaService.verifyTransaction(row.tx_ref);

        if (chapaResult.verified) {
          const verifiedAmt = Number(chapaResult.amount);
          const reqAmt = Number(row.requested_amount);

          if (Math.abs(verifiedAmt - reqAmt) <= 0.01) {
            console.log(`[Reconciler] ✅ SUCCESS: ${row.tx_ref} was paid on Chapa! Settling...`);

            await new Promise((resolve) => {
              db.run(
                "UPDATE donations SET status = 'completed', paid_at = CURRENT_TIMESTAMP, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE transaction_ref = ? AND status != 'completed'",
                [row.tx_ref],
                function (dErr) {
                  if (this.changes > 0) {
                    const updateStatsSql = (row.requested_currency === 'USD')
                      ? 'UPDATE campaign_stats SET raised_usd = raised_usd + ? WHERE id = (SELECT MAX(id) FROM campaign_stats)'
                      : 'UPDATE campaign_stats SET raised_etb = raised_etb + ? WHERE id = (SELECT MAX(id) FROM campaign_stats)';
                    db.run(updateStatsSql, [verifiedAmt]);
                  }
                  db.run(
                    "UPDATE payment_attempts SET provider_status = 'success', chapa_reference = ?, provider_amount = ?, verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE tx_ref = ?",
                    [chapaResult.reference || '', verifiedAmt, row.tx_ref]
                  );
                  db.run(
                    "INSERT INTO payment_status_history (payment_attempt_id, tx_ref, old_status, new_status, source, details) VALUES (?, ?, 'pending', 'completed', 'RECONCILIATION', ?)",
                    [row.id, row.tx_ref, `Settled automatically by cron reconciler (${verifiedAmt} ${row.requested_currency})`]
                  );
                  reconciledCount++;
                  resolve();
                }
              );
            });
          } else {
            console.warn(`[Reconciler] ⚠️ Discrepancy on ${row.tx_ref}: requested ${reqAmt}, verified ${verifiedAmt}`);
            db.run(
              "UPDATE payment_attempts SET provider_status = 'verification_required', failure_reason = ?, last_verification_attempt_at = CURRENT_TIMESTAMP WHERE tx_ref = ?",
              [`Amount mismatch during reconciliation: expected ${reqAmt}, got ${verifiedAmt}`, row.tx_ref]
            );
          }
        } else if (chapaResult.status === 'failed' || chapaResult.status === 'cancelled') {
          console.log(`[Reconciler] ❌ Chapa reports ${row.tx_ref} as ${chapaResult.status}.`);
          db.run("UPDATE payment_attempts SET provider_status = ?, updated_at = CURRENT_TIMESTAMP WHERE tx_ref = ?", [chapaResult.status, row.tx_ref]);
          db.run("UPDATE donations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE transaction_ref = ?", [chapaResult.status, row.tx_ref]);
          db.run(
            "INSERT INTO payment_status_history (payment_attempt_id, tx_ref, old_status, new_status, source, details) VALUES (?, ?, 'pending', ?, 'RECONCILIATION', 'Provider confirmed terminal failure')",
            [row.id, row.tx_ref, chapaResult.status]
          );
          failedCount++;
        } else {
          console.log(`[Reconciler] ⏳ ${row.tx_ref} still pending on Chapa.`);
          db.run("UPDATE payment_attempts SET last_verification_attempt_at = CURRENT_TIMESTAMP WHERE tx_ref = ?", [row.tx_ref]);
          unresolvedCount++;
        }
      } catch (checkErr) {
        console.error(`[Reconciler] Failed to verify ${row.tx_ref}:`, checkErr.message);
        unresolvedCount++;
      }
    }

    console.log(`[Reconciler] Run complete. Settled: ${reconciledCount}, Failed: ${failedCount}, Pending/Unresolved: ${unresolvedCount}`);
    releaseLock();
    process.exit(0);
  });
}

runReconciliation();
