/**
 * BATU YEHIYWOT BERHAN CHURCH — Production Donation & Payment Controller
 * Strict financial precision, authoritative server-side trust model,
 * HMAC webhook validation, and non-destructive audit compliance.
 */

const crypto = require('crypto');
const { db } = require('../config/database');
const config = require('../config');
const { logAudit } = require('./adminController');
const chapaService = require('../services/chapaService');

// --- HELPER: FINANCIAL LOGGING & STATE TRANSITIONS ---

function recordStatusHistory(txRef, attemptId, oldStatus, newStatus, source, details = '') {
  const sql = `
    INSERT INTO payment_status_history (payment_attempt_id, tx_ref, old_status, new_status, source, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.run(sql, [attemptId || null, txRef, oldStatus || 'none', newStatus, source, details], (err) => {
    if (err) console.error('[State Machine] Failed to record status history:', err.message);
  });
}

/**
 * Idempotently settles a verified payment to 'completed'.
 * Only executes state update if status is not already 'completed'.
 */
function settlePaymentSuccess(txRef, providerAmount, providerCurrency, providerRef, paymentMethod, source, callback) {
  const findAttemptSql = 'SELECT * FROM payment_attempts WHERE tx_ref = ?';
  db.get(findAttemptSql, [txRef], (err, attempt) => {
    if (err || !attempt) {
      console.error('[Payment Settlement] Payment attempt not found for txRef:', txRef);
      if (callback) callback(new Error('Payment attempt not found'));
      return;
    }

    if (attempt.provider_status === 'success') {
      // Already settled idempotently
      if (callback) callback(null, { alreadySettled: true, attempt });
      return;
    }

    const requestedAmount = Number(attempt.requested_amount);
    const verifiedAmount = Number(providerAmount) || requestedAmount;

    // 1. Atomically update donation record
    const updateDonationSql = `
      UPDATE donations 
      SET status = 'completed', 
          paid_at = CURRENT_TIMESTAMP, 
          completed_at = CURRENT_TIMESTAMP, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE transaction_ref = ? AND status != 'completed'
    `;

    db.run(updateDonationSql, [txRef], function (donErr) {
      if (donErr) {
        console.error('[Payment Settlement] Error updating donation status:', donErr.message);
        if (callback) callback(donErr);
        return;
      }

      const donationUpdated = this.changes > 0;

      // 2. Update payment attempt
      const updateAttemptSql = `
        UPDATE payment_attempts 
        SET provider_status = 'success',
            chapa_reference = ?,
            provider_amount = ?,
            provider_currency = ?,
            payment_method = ?,
            verified_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE tx_ref = ?
      `;

      db.run(
        updateAttemptSql,
        [providerRef || '', verifiedAmount, providerCurrency || 'ETB', paymentMethod || 'chapa', txRef],
        (attemptErr) => {
          if (attemptErr) console.error('[Payment Settlement] Error updating payment attempt:', attemptErr.message);

          // 3. Record status transition
          recordStatusHistory(txRef, attempt.id, attempt.provider_status, 'completed', source, `Verified and settled via ${source}`);

          // 4. Update campaign stats atomically exactly once if donation was just marked completed
          if (donationUpdated) {
            const updateStatsSql = (attempt.requested_currency === 'USD')
              ? 'UPDATE campaign_stats SET raised_usd = raised_usd + ? WHERE id = (SELECT MAX(id) FROM campaign_stats)'
              : 'UPDATE campaign_stats SET raised_etb = raised_etb + ? WHERE id = (SELECT MAX(id) FROM campaign_stats)';

            db.run(updateStatsSql, [verifiedAmount], (statErr) => {
              if (statErr) console.error('[Payment Settlement] Error updating campaign_stats:', statErr.message);
            });

            logAudit('CHAPA_SYSTEM', 'PAYMENT_SETTLED', `Settled ${verifiedAmount} ${attempt.requested_currency} for tx_ref: ${txRef} via ${source}`);
          }

          if (callback) callback(null, { alreadySettled: false, amount: verifiedAmount });
        }
      );
    });
  });
}

// ============================================================================
// 1. PUBLIC: RECORD DONATION INTENT (NEVER TRUSTS CLIENT FOR PAYMENT SUCCESS)
// ============================================================================
exports.createDonation = (req, res) => {
  const donorName = req.body.donor_name || req.body.donor?.name;
  const donorEmail = req.body.donor_email || req.body.donor?.email;
  const donorAddress = req.body.donor_address || req.body.donor?.address || '';
  const numAmount = Number(req.body.amount);
  const rawCurrency = (req.body.currency || 'ETB').trim().toUpperCase();
  const frequency = req.body.frequency === 'monthly' ? 'monthly' : 'one_time';
  const designation = req.body.designation || 'building_fund';
  const paymentProvider = req.body.payment_provider || 'manual_bank';

  // RULE 1 & RULE 10: Client CANNOT decide payment status! Always begins as 'pending'.
  const status = 'pending';

  if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Please provide a valid, positive donation amount.' });
  }
  if (!donorName || !donorName.trim()) {
    return res.status(400).json({ error: 'Donor full name is required.' });
  }
  if (!donorEmail || !donorEmail.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (rawCurrency !== 'ETB' && rawCurrency !== 'USD') {
    return res.status(400).json({ error: 'Unsupported currency. Only ETB and USD are accepted.' });
  }

  const publicId = crypto.randomUUID ? crypto.randomUUID() : `don-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const transactionRef = req.body.transaction_ref
    ? String(req.body.transaction_ref).trim()
    : `HB-OFFLINE-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  const sql = `
    INSERT INTO donations (public_id, donor_name, donor_email, donor_address, amount, currency, frequency, designation, payment_provider, transaction_ref, status, is_archived)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `;

  const params = [
    publicId,
    donorName.trim(),
    donorEmail.trim().toLowerCase(),
    donorAddress.trim(),
    numAmount.toFixed(2),
    rawCurrency,
    frequency,
    designation,
    paymentProvider,
    transactionRef,
    status
  ];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('[Donation Create] Database error:', err.message);
      return res.status(500).json({ error: 'Failed to record donation intent.' });
    }

    const donationId = this.lastID;
    recordStatusHistory(transactionRef, null, null, 'pending', 'INITIALIZATION', `Offline/Bank transfer donation intent logged: ${paymentProvider}`);

    res.status(201).json({
      success: true,
      message: 'Donation registered in pending verification status.',
      publicId,
      txRef: transactionRef,
      donationId
    });
  });
};

// ============================================================================
// 2. CHAPA LOCAL ETHIOPIAN PAYMENT INITIALIZATION
// ============================================================================
exports.initializeChapaDonation = async (req, res) => {
  try {
    const { donor_name, donor_email, donor_phone, amount, designation, payment_method } = req.body;

    if (!donor_name || !donor_email || !amount) {
      return res.status(400).json({ error: 'Full name, email address, and donation amount are required.' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      return res.status(400).json({ error: 'Minimum donation amount via Chapa is 10 ETB.' });
    }
    if (numAmount > 10000000) {
      return res.status(400).json({ error: 'Donation amount exceeds the single transaction limit.' });
    }

    const cleanEmail = donor_email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const validMethods = ['telebirr', 'cbebirr', 'abyssinia', 'awash', 'coop', 'card'];
    const selectedMethod = (payment_method && validMethods.includes(payment_method.toLowerCase()))
      ? payment_method.toLowerCase()
      : 'telebirr';

    // Generate a server-side tx_ref using the same pattern as PHP docx's generateReference()
    // but with stronger crypto entropy (crypto.randomBytes vs PHP uniqid).
    const txRef = chapaService.constructor.generateTxRef('HB-CHAPA');
    const publicId = crypto.randomUUID ? crypto.randomUUID() : `don-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const [firstName, ...rest] = donor_name.trim().split(' ');
    const lastName = rest.join(' ') || 'Supporter';
    const fundDesignation = designation || 'building_fund';
    const cleanPhone = donor_phone ? donor_phone.trim() : '';
    const paymentProviderLabel = `chapa_${selectedMethod}`;

    // 1. Persist local records first (Outside external network call)
    const insertDonationSql = `
      INSERT INTO donations (public_id, donor_name, donor_email, donor_address, amount, currency, frequency, designation, payment_provider, transaction_ref, status, is_archived)
      VALUES (?, ?, ?, ?, ?, 'ETB', 'one_time', ?, ?, ?, 'pending', 0)
    `;

    db.run(insertDonationSql, [publicId, donor_name.trim(), cleanEmail, cleanPhone, numAmount.toFixed(2), fundDesignation, paymentProviderLabel, txRef], function (donErr) {
      if (donErr) {
        console.error('[Chapa Init] Failed to insert donation:', donErr.message);
        return res.status(500).json({ error: 'Failed to create donation record in database.' });
      }

      const donationId = this.lastID;
      const providerMode = chapaService.getMode();

      const insertAttemptSql = `
        INSERT INTO payment_attempts (donation_id, provider, tx_ref, requested_amount, requested_currency, provider_status, provider_mode, payment_method)
        VALUES (?, 'chapa', ?, ?, 'ETB', 'pending', ?, ?)
      `;

      db.run(insertAttemptSql, [donationId, txRef, numAmount.toFixed(2), providerMode, selectedMethod], async function (attErr) {
        if (attErr) {
          console.error('[Chapa Init] Failed to insert payment attempt:', attErr.message);
          return res.status(500).json({ error: 'Failed to initialize payment attempt.' });
        }

        const attemptId = this.lastID;
        recordStatusHistory(txRef, attemptId, null, 'pending', 'INITIALIZATION', `Initiated Chapa checkout intent via ${selectedMethod}`);

        // Resolve absolute callback & return URLs.
        // callback_url = server-to-server webhook (POST, receives Chapa async events)
        // return_url   = browser redirect after donor completes/cancels payment on Chapa checkout
        const host = req.get('host');
        const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
        const serverBaseUrl = config.appUrl || `${protocol}://${host}`;
        const callbackUrl = `${serverBaseUrl}/api/webhooks/chapa`;
        const returnUrl = `${config.frontendUrl}/building-fund?status=verifying&tx_ref=${encodeURIComponent(txRef)}&provider=chapa&method=${encodeURIComponent(selectedMethod)}`;

        // If real Chapa key is not yet configured:
        if (!chapaService.isConfigured()) {
          if (config.nodeEnv === 'production') {
            return res.status(503).json({
              success: false,
              error: 'Payment gateway is temporarily undergoing maintenance. Please try again shortly or use direct bank transfer.'
            });
          }

          // In development: support seamless sandbox simulation
          db.run(
            'UPDATE payment_attempts SET checkout_url = ?, provider_mode = "sandbox", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [returnUrl, attemptId]
          );

          return res.status(200).json({
            success: true,
            checkout_url: returnUrl,
            tx_ref: txRef,
            public_id: publicId,
            payment_method: selectedMethod,
            mode: 'sandbox_simulation',
            message: 'Development Sandbox: Proceeding to checkout verification simulation.'
          });
        }

        try {
          const chapaRes = await chapaService.initializeTransaction({
            amount: numAmount,
            currency: 'ETB',
            email: cleanEmail,
            firstName,
            lastName,
            phoneNumber: cleanPhone,
            txRef,
            callbackUrl,
            returnUrl,
            title: 'BATU YEHIYWOT BERHAN CHURCH',
            description: `Sanctuary Building Fund (${numAmount.toLocaleString()} ETB)`
          });

          // Save checkout URL to attempt record
          db.run(
            'UPDATE payment_attempts SET checkout_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [chapaRes.checkoutUrl, attemptId]
          );

          return res.status(200).json({
            success: true,
            checkout_url: chapaRes.checkoutUrl,
            tx_ref: txRef,
            public_id: publicId,
            mode: chapaRes.mode,
            message: 'Chapa checkout initialized successfully.'
          });
        } catch (apiErr) {
          console.error('[Chapa Init] Chapa API error:', apiErr.message);

          // Mark failure in DB
          db.run("UPDATE payment_attempts SET provider_status = 'failed', failure_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [apiErr.message, attemptId]);
          db.run("UPDATE donations SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [donationId]);
          recordStatusHistory(txRef, attemptId, 'pending', 'failed', 'INITIALIZATION', apiErr.message);

          const isConfigErr = apiErr.message.includes('CHAPA_CONFIG_ERROR');
          return res.status(isConfigErr ? 503 : 502).json({
            success: false,
            error: isConfigErr
              ? 'Payment gateway is temporarily undergoing maintenance. Please try again shortly or use direct bank transfer.'
              : `Unable to initialize payment with Chapa: ${apiErr.message}`
          });
        }
      });
    });
  } catch (err) {
    console.error('[Chapa Init] Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error processing payment request.' });
  }
};

// ============================================================================
// 3. CHAPA WEBHOOK HANDLER (HMAC DUAL-SIGNATURE VALIDATED ASYNCHRONOUS EVENTS)
// ============================================================================
exports.chapaWebhook = async (req, res) => {
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));

  // Cryptographic Signature Verification (Fail-closed in production)
  // In development, when CHAPA_WEBHOOK_SECRET is not configured, we emit a clear
  // warning and continue processing — matching the PHP docx's callback() approach
  // of processing verified local payment data.
  const webhookSecretConfigured = config.chapaWebhookSecret && config.chapaWebhookSecret.trim() !== '';
  const isValidSignature = chapaService.verifyWebhookSignature(rawBody, req.headers);

  if (!isValidSignature) {
    if (config.nodeEnv === 'production') {
      // Production: strictly reject unsigned webhooks
      console.warn('[Chapa Webhook] REJECTED: Invalid or missing webhook signature (production)');
      logAudit('SECURITY', 'WEBHOOK_SIGNATURE_MISMATCH', 'Rejected unauthorized Chapa webhook request (invalid HMAC signature)');
      return res.status(401).json({ error: 'Invalid webhook signature.' });
    } else if (!webhookSecretConfigured) {
      // Development: no secret configured — log warning and allow through (matches PHP dev behavior)
      console.warn('[Chapa Webhook] DEV MODE: CHAPA_WEBHOOK_SECRET not set. Processing webhook without signature verification. Set CHAPA_WEBHOOK_SECRET in .env for production security.');
    } else {
      // Development with secret configured but signature mismatch — still reject
      console.warn('[Chapa Webhook] REJECTED: Webhook signature mismatch even in dev mode (secret IS configured).');
      return res.status(401).json({ error: 'Invalid webhook signature.' });
    }
  }
  const payload = req.body || {};
  const txRef = payload.tx_ref;
  const payloadStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
  const payloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex');

  // Check for idempotency deduplication in webhook_events table
  db.get('SELECT id, processing_status FROM webhook_events WHERE payload_hash = ?', [payloadHash], (dupErr, existing) => {
    if (existing) {
      console.log('[Chapa Webhook] Idempotent ignore: payload already processed', payloadHash);
      return res.status(200).json({ status: 'success', message: 'Event already processed' });
    }

    // Insert into webhook audit log
    const logEventSql = `
      INSERT INTO webhook_events (provider, event_type, tx_ref, provider_reference, signature_verified, payload_hash, payload_json, processing_status)
      VALUES ('chapa', ?, ?, ?, 1, ?, ?, 'processed')
    `;
    db.run(logEventSql, [payload.event || 'charge.complete', txRef || '', payload.reference || '', payloadHash, payloadStr]);

    if (!txRef) {
      return res.status(200).json({ status: 'ignored', message: 'No tx_ref in payload' });
    }

    const providerStatus = (payload.status || '').toLowerCase();

    // Look up local payment attempt
    db.get('SELECT * FROM payment_attempts WHERE tx_ref = ?', [txRef], (attErr, attempt) => {
      if (attErr || !attempt) {
        console.warn('[Chapa Webhook] Received webhook for unmapped tx_ref:', txRef);
        return res.status(200).json({ status: 'acknowledged' });
      }

      // Handle non-success events (failed, cancelled, reversed, refunded)
      if (providerStatus !== 'success') {
        let mappedStatus = 'failed';
        if (providerStatus === 'reversed') mappedStatus = 'reversed';
        else if (providerStatus === 'refunded') mappedStatus = 'refunded';
        else if (providerStatus === 'cancelled') mappedStatus = 'cancelled';

        console.log(`[Chapa Webhook] Non-success event (${providerStatus} -> ${mappedStatus}) for txRef:`, txRef);
        db.run('UPDATE payment_attempts SET provider_status = ?, failure_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE tx_ref = ?', [mappedStatus, payload.message || providerStatus, txRef]);
        db.run('UPDATE donations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE transaction_ref = ?', [mappedStatus, txRef]);
        recordStatusHistory(txRef, attempt.id, attempt.provider_status, mappedStatus, 'WEBHOOK', payload.message || `Provider reported ${providerStatus}`);
        return res.status(200).json({ status: 'acknowledged', providerStatus: mappedStatus });
      }

      // Critical Data Verification: Compare amount & currency
      const reportedAmount = Number(payload.amount);
      const reportedCurrency = (payload.currency || 'ETB').toUpperCase();
      const requestedAmount = Number(attempt.requested_amount);

      if (reportedCurrency !== attempt.requested_currency) {
        console.error(`[Chapa Webhook] CURRENCY MISMATCH for ${txRef}: expected ${attempt.requested_currency}, got ${reportedCurrency}`);
        logAudit('SECURITY', 'CURRENCY_MISMATCH_SUSPECT', `tx_ref ${txRef} reported currency ${reportedCurrency} instead of ${attempt.requested_currency}`);
        db.run("UPDATE payment_attempts SET provider_status = 'verification_required', failure_reason = 'Currency mismatch between provider and record' WHERE tx_ref = ?", [txRef]);
        db.run("UPDATE donations SET status = 'verification_required' WHERE transaction_ref = ?", [txRef]);
        recordStatusHistory(txRef, attempt.id, attempt.provider_status, 'verification_required', 'WEBHOOK', 'Currency mismatch detected');
        return res.status(400).json({ error: 'Currency mismatch' });
      }

      if (Math.abs(reportedAmount - requestedAmount) > 0.01) {
        console.error(`[Chapa Webhook] AMOUNT MISMATCH for ${txRef}: expected ${requestedAmount}, got ${reportedAmount}`);
        logAudit('SECURITY', 'AMOUNT_TAMPERING_SUSPECT', `tx_ref ${txRef} reported amount ${reportedAmount} instead of ${requestedAmount}`);
        db.run("UPDATE payment_attempts SET provider_status = 'verification_required', failure_reason = 'Amount mismatch between provider and record' WHERE tx_ref = ?", [txRef]);
        db.run("UPDATE donations SET status = 'verification_required' WHERE transaction_ref = ?", [txRef]);
        recordStatusHistory(txRef, attempt.id, attempt.provider_status, 'verification_required', 'WEBHOOK', 'Amount mismatch detected');
        return res.status(400).json({ error: 'Amount mismatch' });
      }

      // Authoritative atomic state transition
      settlePaymentSuccess(
        txRef,
        reportedAmount,
        reportedCurrency,
        payload.reference || payload.chapa_reference,
        payload.method || 'online',
        'WEBHOOK',
        (settleErr) => {
          if (settleErr) return res.status(500).json({ error: 'Settlement failure' });
          return res.status(200).json({ status: 'success' });
        }
      );
    });
  });
};

// Aliased legacy route callback
exports.chapaCallback = exports.chapaWebhook;

// ============================================================================
// 4. VERIFY CHAPA PAYMENT (AUTHORITATIVE SERVER-TO-SERVER VERIFICATION)
// ============================================================================
exports.verifyChapaDonation = async (req, res) => {
  try {
    const { tx_ref } = req.params;
    if (!tx_ref) {
      return res.status(400).json({ success: false, error: 'Transaction reference is required.' });
    }

    db.get('SELECT * FROM payment_attempts WHERE tx_ref = ?', [tx_ref], async (err, attempt) => {
      if (err) return res.status(500).json({ success: false, error: 'Database query error.' });

      if (!attempt) {
        return res.status(404).json({ success: false, error: 'Payment attempt record not found.' });
      }

      // If already settled, return verified status immediately (redacting sensitive PII, keeping name)
      if (attempt.provider_status === 'success') {
        db.get('SELECT public_id, donor_name, amount, currency, designation, status, paid_at FROM donations WHERE transaction_ref = ?', [tx_ref], (dErr, don) => {
          return res.json({
            success: true,
            verified: true,
            provider: 'chapa',
            payment_method: attempt.payment_method || 'telebirr',
            donation: don,
            amount: attempt.provider_amount || attempt.requested_amount,
            currency: attempt.provider_currency || 'ETB',
            message: 'Donation has been verified and confirmed.'
          });
        });
        return;
      }

      // Development Sandbox Verification (active strictly in non-production environments when credentials are demo or unconfigured)
      if (config.nodeEnv !== 'production' && (attempt.provider_mode === 'sandbox' || !chapaService.isConfigured())) {
        const simulatedMethod = attempt.payment_method || 'telebirr';
        settlePaymentSuccess(
          tx_ref,
          attempt.requested_amount,
          attempt.requested_currency,
          `CHAPA-DEMO-${Date.now()}`,
          simulatedMethod,
          'VERIFY',
          (settleErr) => {
            if (settleErr) return res.status(500).json({ success: false, error: 'Settlement failure.' });

            db.get('SELECT public_id, donor_name, amount, currency, designation, status, paid_at FROM donations WHERE transaction_ref = ?', [tx_ref], (dErr, updatedDonation) => {
              return res.json({
                success: true,
                verified: true,
                provider: 'chapa',
                payment_method: simulatedMethod,
                donation: updatedDonation,
                amount: attempt.requested_amount,
                currency: attempt.requested_currency,
                message: 'Chapa Sandbox Simulation: Payment successfully verified and recorded.'
              });
            });
          }
        );
        return;
      }

      // Query Chapa Verification API authoritatively
      try {
        const chapaResult = await chapaService.verifyTransaction(tx_ref);

        if (chapaResult.verified) {
          const verifiedAmt = Number(chapaResult.amount);
          const reqAmt = Number(attempt.requested_amount);

          if (Math.abs(verifiedAmt - reqAmt) > 0.01) {
            console.error(`[Chapa Verify] Amount discrepancy for ${tx_ref}: requested ${reqAmt}, verified ${verifiedAmt}`);
            logAudit('SECURITY', 'VERIFICATION_AMOUNT_MISMATCH', `tx_ref ${tx_ref} verified with ${verifiedAmt} but requested ${reqAmt}`);
            db.run("UPDATE payment_attempts SET provider_status = 'verification_required', failure_reason = 'Verification amount mismatch' WHERE tx_ref = ?", [tx_ref]);
            return res.status(400).json({ success: false, error: 'Payment amount does not match original donation request.' });
          }

          settlePaymentSuccess(
            tx_ref,
            verifiedAmt,
            chapaResult.currency,
            chapaResult.reference,
            chapaResult.paymentMethod,
            'VERIFY',
            (settleErr) => {
              if (settleErr) {
                return res.status(500).json({ success: false, error: 'Failed to settle donation state.' });
              }

              db.get('SELECT public_id, donor_name, amount, currency, designation, status, paid_at FROM donations WHERE transaction_ref = ?', [tx_ref], (dErr, updatedDonation) => {
                return res.json({
                  success: true,
                  verified: true,
                  provider: 'chapa',
                  donation: updatedDonation,
                  message: 'Chapa payment successfully verified and recorded.'
                });
              });
            }
          );
        } else {
          db.run(
            'UPDATE payment_attempts SET last_verification_attempt_at = CURRENT_TIMESTAMP WHERE tx_ref = ?',
            [tx_ref]
          );

          return res.json({
            success: false,
            verified: false,
            status: chapaResult.status,
            provider: 'chapa',
            message: chapaResult.message || 'Payment has not been completed on Chapa.'
          });
        }
      } catch (verifyErr) {
        console.error('[Chapa Verify] Remote verification request failed:', verifyErr.message);
        return res.status(502).json({
          success: false,
          verified: false,
          error: `Unable to verify with Chapa: ${verifyErr.message}`
        });
      }
    });
  } catch (err) {
    console.error('[Chapa Verify] Unhandled error:', err);
    res.status(500).json({ success: false, error: 'Failed to verify donation.' });
  }
};

// ============================================================================
// 5. PUBLIC: GET AUTHORITATIVE DONATION STATUS BY PUBLIC ID (PII REDACTED)
// ============================================================================
exports.getDonationStatus = (req, res) => {
  const { identifier } = req.params;
  if (!identifier) return res.status(400).json({ error: 'Donation identifier or tx_ref is required.' });

  const sql = `
    SELECT d.public_id, d.amount, d.currency, d.designation, d.status, d.paid_at, d.created_at,
           p.tx_ref, p.provider, p.provider_status, p.payment_method, p.verified_at
    FROM donations d
    LEFT JOIN payment_attempts p ON d.transaction_ref = p.tx_ref
    WHERE (d.public_id = ? OR d.transaction_ref = ? OR p.tx_ref = ?)
      AND (d.is_archived = 0 OR d.is_archived IS NULL)
    ORDER BY d.id DESC
    LIMIT 1
  `;

  db.get(sql, [identifier, identifier, identifier], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database query error.' });
    if (!row) return res.status(404).json({ error: 'Donation record not found.' });

    res.json({
      success: true,
      donation: {
        publicId: row.public_id,
        amount: row.amount,
        currency: row.currency,
        designation: row.designation,
        status: row.status,
        provider: row.provider || 'chapa',
        paymentMethod: row.payment_method,
        txRef: row.tx_ref,
        paidAt: row.paid_at || row.verified_at,
        createdAt: row.created_at
      }
    });
  });
};

// ============================================================================
// 6. STRIPE INTERNATIONAL PAYMENT INITIALIZATION & VERIFICATION
// ============================================================================
exports.initializeStripeDonation = async (req, res) => {
  try {
    const { donor_name, donor_email, amount, designation } = req.body;

    if (!amount || !donor_name || !donor_email) {
      return res.status(400).json({ error: 'Name, email, and amount in USD are required for Stripe.' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      return res.status(400).json({ error: 'Minimum international donation is $1 USD.' });
    }

    const txRef = `HB-STRIPE-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const publicId = crypto.randomUUID ? crypto.randomUUID() : `don-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const insertSql = `
      INSERT INTO donations (public_id, donor_name, donor_email, amount, currency, frequency, designation, payment_provider, transaction_ref, status, is_archived)
      VALUES (?, ?, ?, ?, 'USD', 'one_time', ?, 'stripe', ?, 'pending', 0)
    `;
    db.run(insertSql, [publicId, donor_name.trim(), donor_email.trim().toLowerCase(), numAmount.toFixed(2), designation || 'building_fund', txRef]);

    const isLiveOrTestKey = config.stripeSecretKey &&
      !config.stripeSecretKey.includes('xxxxxxxx') &&
      !config.stripeSecretKey.includes('demo');

    if (isLiveOrTestKey) {
      const params = new URLSearchParams({
        'payment_method_types[0]': 'card',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][product_data][name]': 'BATU YEHIYWOT BERHAN CHURCH — Building Fund',
        'line_items[0][price_data][product_data][description]': `Sanctuary Expansion Gift (${numAmount.toFixed(2)} USD)`,
        'line_items[0][price_data][unit_amount]': Math.round(numAmount * 100).toString(),
        'line_items[0][quantity]': '1',
        'mode': 'payment',
        'customer_email': donor_email.trim().toLowerCase(),
        'client_reference_id': txRef,
        'metadata[tx_ref]': txRef,
        'metadata[public_id]': publicId,
        'success_url': `${config.frontendUrl}/building-fund?status=success&session_id={CHECKOUT_SESSION_ID}&tx_ref=${txRef}&provider=stripe`,
        'cancel_url': `${config.frontendUrl}/building-fund?status=cancelled`
      });

      try {
        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        const session = await response.json();
        if (session.url) {
          return res.json({
            success: true,
            provider: 'stripe',
            checkout_url: session.url,
            session_id: session.id,
            tx_ref: txRef,
            public_id: publicId
          });
        }
      } catch (stripeErr) {
        console.warn('Stripe network reachability notice:', stripeErr.message);
      }
    }

    // Demo / Sandbox mode: return simulated checkout URL
    const demoReturnUrl = `${config.frontendUrl}/building-fund?status=success&session_id=cs_test_demo_${Date.now()}&tx_ref=${txRef}&provider=stripe`;
    return res.json({
      success: true,
      mode: 'stripe_demo_sandbox',
      provider: 'stripe',
      tx_ref: txRef,
      public_id: publicId,
      checkout_url: demoReturnUrl,
      amount: numAmount,
      currency: 'USD'
    });
  } catch (err) {
    console.error('Stripe Initialization Error:', err);
    res.status(500).json({ error: 'Failed to initialize Stripe payment.' });
  }
};

// Helper for Stripe Webhook Signature Verification
function verifyStripeSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  try {
    const parts = signatureHeader.split(',');
    let timestamp = '';
    const signatures = [];
    for (const part of parts) {
      const [k, v] = part.split('=');
      if (k === 't') timestamp = v;
      if (k === 'v1') signatures.push(v);
    }
    if (!timestamp || signatures.length === 0) return false;

    // Check timestamp tolerance window (5 minutes)
    const tolerance = 300;
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp, 10)) > tolerance) {
      console.warn('[Stripe Webhook] Timestamp outside tolerance window');
      return false;
    }

    const payload = `${timestamp}.${rawBody.toString('utf8')}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    for (const sig of signatures) {
      const sigBuf = Buffer.from(sig, 'utf8');
      const expectedBuf = Buffer.from(expectedSig, 'utf8');
      if (sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error('[Stripe Webhook] Error verifying signature:', err.message);
    return false;
  }
}

exports.verifyStripeDonation = async (req, res) => {
  try {
    const { session_id } = req.params;
    const { tx_ref } = req.query;

    if (!session_id && !tx_ref) {
      return res.status(400).json({ error: 'Session ID or transaction reference is required.' });
    }

    // Query record safely using specific identifiers
    let query = 'SELECT * FROM donations WHERE ';
    const params = [];
    if (tx_ref && session_id) {
      query += '(transaction_ref = ? OR transaction_ref = ?) AND (is_archived = 0 OR is_archived IS NULL)';
      params.push(tx_ref, session_id);
    } else if (tx_ref) {
      query += 'transaction_ref = ? AND (is_archived = 0 OR is_archived IS NULL)';
      params.push(tx_ref);
    } else {
      query += 'transaction_ref = ? AND (is_archived = 0 OR is_archived IS NULL)';
      params.push(session_id);
    }

    db.get(query, params, async (err, row) => {
      if (err || !row) return res.status(404).json({ error: 'Donation record not found' });

      // If already settled, return verified status
      if (row.status === 'completed') {
        return res.json({
          success: true,
          verified: true,
          provider: 'stripe',
          donation: {
            publicId: row.public_id,
            amount: row.amount,
            currency: 'USD',
            status: 'completed',
            txRef: row.transaction_ref
          }
        });
      }

      const isRealKey = config.stripeSecretKey &&
        !config.stripeSecretKey.includes('demo') &&
        !config.stripeSecretKey.includes('xxxx');

      if (isRealKey && session_id && !session_id.startsWith('cs_test_demo_')) {
        // Authoritative Server-to-Server Verification with Stripe API
        try {
          const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(session_id)}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${config.stripeSecretKey}`
            }
          });

          if (!stripeRes.ok) {
            return res.status(400).json({ success: false, verified: false, error: 'Could not verify checkout session with Stripe.' });
          }

          const session = await stripeRes.json();
          const isPaid = session.payment_status === 'paid';

          if (!isPaid) {
            return res.json({
              success: false,
              verified: false,
              status: session.payment_status,
              message: 'Payment has not been completed on Stripe.'
            });
          }

          // Verify Amount & Currency
          const sessionAmountUsd = (session.amount_total || 0) / 100;
          if (Math.abs(sessionAmountUsd - Number(row.amount)) > 0.01) {
            logAudit('SECURITY', 'STRIPE_AMOUNT_MISMATCH', `Stripe session ${session_id} amount mismatch: expected ${row.amount}, got ${sessionAmountUsd}`);
            return res.status(400).json({ success: false, error: 'Payment amount mismatch between Stripe session and donation record.' });
          }

          if ((session.currency || '').toUpperCase() !== 'USD') {
            logAudit('SECURITY', 'STRIPE_CURRENCY_MISMATCH', `Stripe session ${session_id} currency mismatch`);
            return res.status(400).json({ success: false, error: 'Payment currency mismatch.' });
          }

          // Authoritative state update
          db.run(
            'UPDATE donations SET status = "completed", paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status != "completed"',
            [row.id],
            function () {
              if (this.changes > 0) {
                db.run('UPDATE campaign_stats SET raised_usd = raised_usd + ? WHERE id = (SELECT MAX(id) FROM campaign_stats)', [sessionAmountUsd]);
                recordStatusHistory(row.transaction_ref, null, 'pending', 'completed', 'VERIFY', `Authoritatively verified via Stripe API (${session.id})`);
                logAudit('STRIPE_SYSTEM', 'PAYMENT_SETTLED', `Settled ${sessionAmountUsd} USD for tx_ref: ${row.transaction_ref}`);
              }
            }
          );

          return res.json({
            success: true,
            verified: true,
            provider: 'stripe',
            donation: {
              publicId: row.public_id,
              amount: row.amount,
              currency: 'USD',
              status: 'completed',
              txRef: row.transaction_ref
            }
          });
        } catch (apiErr) {
          console.error('[Stripe Verify] Error verifying with Stripe API:', apiErr.message);
          return res.status(502).json({ success: false, error: 'Unable to communicate with Stripe verification server.' });
        }
      }

      // Development Sandbox Simulation (Strictly non-production only)
      if (config.nodeEnv !== 'production' && session_id && session_id.startsWith('cs_test_demo_')) {
        db.run(
          'UPDATE donations SET status = "completed", paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status != "completed"',
          [row.id],
          function () {
            if (this.changes > 0) {
              db.run('UPDATE campaign_stats SET raised_usd = raised_usd + ? WHERE id = (SELECT MAX(id) FROM campaign_stats)', [row.amount]);
              recordStatusHistory(row.transaction_ref, null, 'pending', 'completed', 'VERIFY', 'Stripe sandbox simulation completed');
            }
          }
        );

        return res.json({
          success: true,
          verified: true,
          mode: 'sandbox_simulation',
          provider: 'stripe',
          donation: {
            publicId: row.public_id,
            amount: row.amount,
            currency: 'USD',
            status: 'completed',
            txRef: row.transaction_ref
          }
        });
      }

      // Production without valid verified session
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Unable to verify payment. Please ensure your checkout session is valid.'
      });
    });
  } catch (err) {
    console.error('Stripe Verification Error:', err);
    res.status(500).json({ error: 'Failed to verify Stripe payment.' });
  }
};

exports.stripeWebhook = async (req, res) => {
  try {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    const sigHeader = req.headers['stripe-signature'];
    const secret = config.stripeWebhookSecret;

    // Signature verification (Fail closed in production)
    if (secret) {
      const isValid = verifyStripeSignature(rawBody, sigHeader, secret);
      if (!isValid) {
        logAudit('SECURITY', 'STRIPE_WEBHOOK_SIGNATURE_MISMATCH', 'Rejected unauthorized Stripe webhook request (invalid HMAC signature)');
        return res.status(401).json({ error: 'Invalid webhook signature.' });
      }
    } else if (config.nodeEnv === 'production') {
      console.warn('[Stripe Webhook] Rejected: STRIPE_WEBHOOK_SECRET is not configured in production.');
      return res.status(503).json({ error: 'Stripe webhook secret not configured.' });
    }

    const event = req.body;
    if (event?.type === 'checkout.session.completed') {
      const session = event.data?.object;
      if (!session) return res.status(400).json({ error: 'Missing session data' });

      const txRef = session.client_reference_id || session.metadata?.tx_ref;
      const isPaid = session.payment_status === 'paid';

      if (txRef && isPaid) {
        db.get('SELECT * FROM donations WHERE transaction_ref = ? AND (is_archived = 0 OR is_archived IS NULL)', [txRef], (findErr, don) => {
          if (findErr || !don) {
            console.warn('[Stripe Webhook] Unmapped tx_ref:', txRef);
            return res.json({ received: true });
          }

          const amt = (session.amount_total || 0) / 100;
          if (Math.abs(amt - Number(don.amount)) > 0.01) {
            logAudit('SECURITY', 'STRIPE_WEBHOOK_AMOUNT_MISMATCH', `tx_ref ${txRef} reported ${amt} USD instead of ${don.amount}`);
            db.run("UPDATE donations SET status = 'verification_required' WHERE transaction_ref = ?", [txRef]);
            return res.status(400).json({ error: 'Amount mismatch' });
          }

          db.run(
            'UPDATE donations SET status = "completed", paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE transaction_ref = ? AND status != "completed"',
            [txRef],
            function () {
              if (this.changes > 0) {
                db.run('UPDATE campaign_stats SET raised_usd = raised_usd + ? WHERE id = (SELECT MAX(id) FROM campaign_stats)', [amt]);
                recordStatusHistory(txRef, null, 'pending', 'completed', 'WEBHOOK', 'Stripe checkout completed via verified webhook');
                logAudit('STRIPE_SYSTEM', 'PAYMENT_SETTLED', `Settled ${amt} USD for tx_ref: ${txRef} via verified Stripe webhook`);
              }
            }
          );
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

// ============================================================================
// 7. ADMIN: FILTERED DONATIONS LIST (WITH ADVANCED METRICS & ATTEMPTS)
// ============================================================================
exports.getDonations = (req, res) => {
  const { q, currency, provider, status } = req.query;
  let sql = 'SELECT * FROM donations WHERE (is_archived = 0 OR is_archived IS NULL)';
  const params = [];

  if (q) {
    sql += ' AND (donor_name LIKE ? OR donor_email LIKE ? OR transaction_ref LIKE ? OR public_id LIKE ?)';
    const term = `%${q}%`;
    params.push(term, term, term, term);
  }
  if (currency) {
    sql += ' AND currency = ?';
    params.push(currency.toUpperCase());
  }
  if (provider) {
    sql += ' AND payment_provider = ?';
    params.push(provider);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY id DESC LIMIT 200';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// ============================================================================
// 8. ADMIN: RECORD MANUAL OFFLINE CASH / BANK TRANSFER WITH AUDIT
// ============================================================================
exports.createManualDonation = (req, res) => {
  const { donorName, donorEmail, donorAddress, amount, currency, designation, paymentProvider, transactionRef } = req.body;

  if (!donorName || !amount) {
    return res.status(400).json({ error: 'Donor Name and Amount are required.' });
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Valid positive donation amount is required.' });
  }

  const curr = (currency || 'ETB').trim().toUpperCase();
  const prov = paymentProvider || 'cbe_bank_transfer';
  const txRef = transactionRef ? transactionRef.trim() : `OFFLINE-${Date.now()}`;
  const publicId = crypto.randomUUID ? crypto.randomUUID() : `don-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  const sql = `
    INSERT INTO donations (public_id, donor_name, donor_email, donor_address, amount, currency, frequency, designation, payment_provider, transaction_ref, status, is_archived, completed_at, paid_at)
    VALUES (?, ?, ?, ?, ?, ?, 'one_time', ?, ?, ?, 'completed', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  db.run(sql, [
    publicId,
    donorName.trim(),
    donorEmail || 'offline@hiwotbirhanchurch.org',
    donorAddress || '',
    numAmount.toFixed(2),
    curr,
    designation || 'building_fund',
    prov,
    txRef
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const donationId = this.lastID;
    const updateSql = (curr === 'USD')
      ? 'UPDATE campaign_stats SET raised_usd = raised_usd + ? WHERE id = (SELECT MAX(id) FROM campaign_stats)'
      : 'UPDATE campaign_stats SET raised_etb = raised_etb + ? WHERE id = (SELECT MAX(id) FROM campaign_stats)';

    db.run(updateSql, [numAmount]);
    recordStatusHistory(txRef, null, 'none', 'completed', 'ADMIN', `Offline gift verified by admin: ${req.admin.username}`);
    logAudit(req.admin.username, 'ADD_MANUAL_DONATION', `Added verified offline donation of ${numAmount} ${curr} for ${donorName}`);

    res.status(201).json({ success: true, message: 'Manual donation recorded and verified.', id: donationId });
  });
};

// ============================================================================
// 9. ADMIN: CONTROLLED STATUS UPDATES (CANNOT ARBITRARILY SET SUCCESS)
// ============================================================================
exports.updateDonation = (req, res) => {
  const { status, transaction_ref, notes } = req.body;
  const id = req.params.id;

  // RULE 16: Admin cannot arbitrarily set status to completed without provider verification
  if (status === 'completed') {
    return res.status(400).json({
      error: 'Direct transition to completed is prohibited. Use "Verify with Provider" to authoritatively confirm payment.'
    });
  }

  const sql = 'UPDATE donations SET status = COALESCE(?, status), transaction_ref = COALESCE(?, transaction_ref), updated_at = CURRENT_TIMESTAMP WHERE id = ?';
  db.run(sql, [status, transaction_ref, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    logAudit(req.admin.username, 'UPDATE_DONATION', `Admin updated donation #${id} status: ${status || 'unchanged'}`);
    res.json({ success: true, message: 'Donation updated successfully.' });
  });
};

// ============================================================================
// 10. ADMIN: NON-DESTRUCTIVE SOFT ARCHIVE (PREVENTS PHYSICAL ROW DELETION)
// ============================================================================
exports.deleteDonation = (req, res) => {
  const id = req.params.id;

  // RULE 12: Never destroy financial records. Soft archive instead.
  db.run('UPDATE donations SET is_archived = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    logAudit(req.admin.username, 'ARCHIVE_DONATION', `Archived donation #${id} (soft delete)`);
    res.json({ success: true, message: 'Donation record archived.' });
  });
};

// ============================================================================
// 11. ADMIN: AUTHORITATIVE MANUAL VERIFICATION TRIGGER (PHASE 22)
// ============================================================================
exports.adminVerifyDonation = (req, res) => {
  const id = req.params.id;

  db.get('SELECT * FROM donations WHERE id = ?', [id], async (err, don) => {
    if (err || !don) return res.status(404).json({ error: 'Donation not found.' });

    if (don.status === 'completed') {
      return res.json({ success: true, message: 'Donation is already verified and completed.', donation: don });
    }

    if (!don.transaction_ref) {
      return res.status(400).json({ error: 'Donation record has no transaction reference to verify.' });
    }

    try {
      const chapaResult = await chapaService.verifyTransaction(don.transaction_ref);

      if (chapaResult.verified) {
        settlePaymentSuccess(
          don.transaction_ref,
          chapaResult.amount,
          chapaResult.currency,
          chapaResult.reference,
          chapaResult.paymentMethod,
          'ADMIN',
          (settleErr) => {
            if (settleErr) return res.status(500).json({ error: 'Failed to settle state.' });
            logAudit(req.admin.username, 'ADMIN_VERIFY_SUCCESS', `Authoritatively verified tx_ref: ${don.transaction_ref}`);
            return res.json({ success: true, verified: true, message: 'Payment authoritatively verified and settled with Chapa.' });
          }
        );
      } else {
        return res.json({
          success: false,
          verified: false,
          providerStatus: chapaResult.status,
          message: chapaResult.message || 'Chapa reports payment is not completed.'
        });
      }
    } catch (apiErr) {
      return res.status(502).json({ error: `Provider verification failed: ${apiErr.message}` });
    }
  });
};

// ============================================================================
// 12. ADMIN: PROCESS CONTROLLED REFUND (PHASE 23)
// ============================================================================
exports.adminRefundDonation = (req, res) => {
  const id = req.params.id;
  const { reason, amount } = req.body;

  db.get('SELECT * FROM donations WHERE id = ?', [id], async (err, don) => {
    if (err || !don) return res.status(404).json({ error: 'Donation record not found.' });

    if (don.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed donations can be refunded.' });
    }

    const refundAmount = amount ? Number(amount) : Number(don.amount);
    if (isNaN(refundAmount) || refundAmount <= 0 || refundAmount > Number(don.amount)) {
      return res.status(400).json({ error: 'Invalid refund amount.' });
    }

    const refundRef = `REF-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    try {
      const refundResult = await chapaService.refundTransaction({
        txRef: don.transaction_ref,
        amount: refundAmount,
        reason: reason || 'Donor requested refund via Church Admin',
        reference: refundRef
      });

      // Record refund in refunds table
      const insertRefundSql = `
        INSERT INTO refunds (donation_id, tx_ref, provider_refund_reference, refund_reference, requested_amount, currency, reason, status, provider_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'processing', ?)
      `;
      db.run(insertRefundSql, [
        don.id,
        don.transaction_ref,
        refundResult.refId || '',
        refundRef,
        refundAmount.toFixed(2),
        don.currency,
        reason || '',
        refundResult.status
      ]);

      // Update donation status
      db.run("UPDATE donations SET status = 'refund_initiated', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [don.id]);
      recordStatusHistory(don.transaction_ref, null, 'completed', 'refund_initiated', 'ADMIN', `Refund initiated: ${refundRef}`);
      logAudit(req.admin.username, 'INITIATE_REFUND', `Initiated refund of ${refundAmount} ${don.currency} for donation #${don.id}`);

      return res.json({
        success: true,
        refundReference: refundRef,
        providerResponse: refundResult,
        message: 'Refund request processed with provider.'
      });
    } catch (apiErr) {
      console.error('[Admin Refund] Provider error:', apiErr.message);
      return res.status(502).json({ error: `Provider refund error: ${apiErr.message}` });
    }
  });
};
