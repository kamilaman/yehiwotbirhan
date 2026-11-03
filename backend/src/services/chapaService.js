/**
 * Production Chapa Payment Gateway Service
 * Reference: Official Chapa Developer Documentation (https://developer.chapa.co/)
 * Translated and adapted from PHP/Laravel patterns (php.docx) into Node.js/Express
 * for the Batu Yehiywot Berhan Church architecture.
 * Implements strict type validation, dual signature verification, error mapping, and refunds.
 */

const crypto = require('crypto');
const config = require('../config');

const CHAPA_API_BASE = process.env.CHAPA_API_BASE_URL || 'https://api.chapa.co/v1';
const REQUEST_TIMEOUT_MS = 12000;

// Standardized Provider Error Categories
const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  PAYMENT_DECLINED: 'PAYMENT_DECLINED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
  ALREADY_COMPLETED: 'ALREADY_COMPLETED',
  RATE_LIMITED: 'RATE_LIMITED',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  UNKNOWN_PROVIDER_ERROR: 'UNKNOWN_PROVIDER_ERROR'
};

class ChapaService {
  constructor() {
    this.secretKey = config.chapaSecretKey;
    this.webhookSecret = config.chapaWebhookSecret || config.chapaSecretKey;
    this.mode = config.chapaMode || (this.secretKey && this.secretKey.startsWith('CHASECK_TEST-') ? 'test' : 'live');
  }

  /**
   * Generates a unique, server-side transaction reference.
   * Mirrors PHP docx generateReference() but uses crypto.randomBytes for stronger entropy.
   * @param {string} [prefix] - Optional prefix (e.g. 'HB-CHAPA')
   * @returns {string} Unique tx_ref safe for Chapa
   */
  static generateTxRef(prefix = 'HB-CHAPA') {
    const ts = Date.now();
    const rand = crypto.randomBytes(4).toString('hex');
    return `${prefix}-${ts}-${rand}`;
  }

  /**
   * Determine whether a valid live or real test key is configured (not a placeholder).
   * A key is considered a real key when it starts with CHASECK_TEST- or CHASECK_LIVE-
   * AND does not contain placeholder markers.
   */
  isConfigured() {
    if (!this.secretKey || this.secretKey.trim() === '') return false;
    const k = this.secretKey.trim();
    // Reject known placeholder/demo values
    if (k.includes('xxxxxxxx') || k.includes('demo') || k.includes('placeholder')) return false;
    // Must begin with official Chapa key prefixes
    return k.startsWith('CHASECK_TEST-') || k.startsWith('CHASECK_LIVE-') || k.startsWith('CHASECK-');
  }

  /**
   * Validates server-side payment configuration
   */
  validateConfig() {
    if (!this.isConfigured()) {
      const err = new Error('CHAPA_CONFIG_ERROR: Chapa Secret Key is not configured on the server. Please supply a valid Chapa key in .env');
      err.code = ErrorCodes.CONFIGURATION_ERROR;
      throw err;
    }
  }

  /**
   * Determine whether current credentials indicate test or live mode
   */
  getMode() {
    if (!this.secretKey) return 'unconfigured';
    return this.secretKey.startsWith('CHASECK_TEST-') ? 'test' : 'live';
  }

  /**
   * Map HTTP/API responses into standardized internal error models
   */
  _mapError(statusCode, responseData, fallbackMessage) {
    const rawMsg = responseData?.message || responseData?.error || fallbackMessage;
    let code = ErrorCodes.UNKNOWN_PROVIDER_ERROR;

    if (statusCode === 401 || statusCode === 403) {
      code = ErrorCodes.AUTHENTICATION_ERROR;
    } else if (statusCode === 400 || statusCode === 422) {
      code = ErrorCodes.VALIDATION_ERROR;
    } else if (statusCode === 404) {
      code = ErrorCodes.TRANSACTION_NOT_FOUND;
    } else if (statusCode === 429) {
      code = ErrorCodes.RATE_LIMITED;
    } else if (statusCode >= 500) {
      code = ErrorCodes.PROVIDER_UNAVAILABLE;
    }

    const error = new Error(rawMsg);
    error.code = code;
    error.statusCode = statusCode;
    error.providerData = responseData;
    return error;
  }

  /**
   * Performs a safe, timed HTTPS request to the Chapa API
   */
  async _request(endpoint, options = {}) {
    this.validateConfig();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const url = `${CHAPA_API_BASE}${endpoint}`;
      const headers = {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Batu-Yehiywot-Berhan-Church/2.0',
        ...(options.headers || {})
      };

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      clearTimeout(timeout);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw this._mapError(response.status, data, `HTTP ${response.status} from Chapa API`);
      }

      return data;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        const timeoutErr = new Error('Chapa API request timed out after 12 seconds.');
        timeoutErr.code = ErrorCodes.TIMEOUT;
        throw timeoutErr;
      }
      throw err;
    }
  }

  /**
   * Initializes a hosted checkout payment with Chapa
   * Endpoint: POST /v1/transaction/initialize
   */
  async initializeTransaction(params) {
    const {
      amount,
      currency = 'ETB',
      email,
      firstName,
      lastName,
      phoneNumber,
      txRef,
      callbackUrl,
      returnUrl,
      title = 'BATU YEHIYWOT BERHAN CHURCH',
      description = 'Sanctuary Building Fund & Ministry Support'
    } = params;

    // Strict validation of input
    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount < 10) {
      const err = new Error('Minimum donation amount via Chapa is 10 ETB.');
      err.code = ErrorCodes.VALIDATION_ERROR;
      throw err;
    }
    if (numAmount > 10000000) {
      const err = new Error('Donation amount exceeds single transaction limit.');
      err.code = ErrorCodes.VALIDATION_ERROR;
      throw err;
    }

    const cleanCurrency = (currency || 'ETB').trim().toUpperCase();
    if (cleanCurrency !== 'ETB' && cleanCurrency !== 'USD') {
      const err = new Error(`Unsupported currency: ${cleanCurrency}. Only ETB and USD are supported.`);
      err.code = ErrorCodes.VALIDATION_ERROR;
      throw err;
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      const err = new Error('Valid donor email is required.');
      err.code = ErrorCodes.VALIDATION_ERROR;
      throw err;
    }
    if (!txRef) {
      const err = new Error('Unique transaction reference (tx_ref) is required.');
      err.code = ErrorCodes.VALIDATION_ERROR;
      throw err;
    }

    // Build payload as proper JSON object.
    // IMPORTANT: Chapa's JSON API requires 'customization' as a NESTED OBJECT,
    // NOT as 'customization[title]' bracket-notation flat strings.
    // (The PHP docx uses the nested object form: { "customization": { "title": "..." } })
    const payload = {
      amount: numAmount.toFixed(2),
      currency: cleanCurrency,
      email: cleanEmail,
      first_name: (firstName || '').trim() || 'Supporter',
      last_name: (lastName || '').trim() || 'Church Donor',
      tx_ref: txRef,
      callback_url: callbackUrl,
      return_url: returnUrl,
      customization: {
        title: title,
        description: description
      }
    };

    // Include phone_number only when provided (Chapa optional field)
    if (phoneNumber && typeof phoneNumber === 'string' && phoneNumber.trim()) {
      payload.phone_number = phoneNumber.trim();
    }

    const response = await this._request('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (response?.status !== 'success' || !response?.data?.checkout_url) {
      const err = new Error(response?.message || 'Chapa did not return a valid checkout URL.');
      err.code = ErrorCodes.PROVIDER_UNAVAILABLE;
      throw err;
    }

    return {
      success: true,
      checkoutUrl: response.data.checkout_url,
      txRef: txRef,
      mode: this.getMode(),
      message: response.message
    };
  }

  /**
   * Authoritatively verifies a transaction with Chapa
   * Endpoint: GET /v1/transaction/verify/:tx_ref
   */
  async verifyTransaction(txRef) {
    if (!txRef) {
      throw new Error('Transaction reference (tx_ref) is required for verification.');
    }

    const response = await this._request(`/transaction/verify/${encodeURIComponent(txRef)}`, {
      method: 'GET'
    });

    if (response?.status !== 'success' || !response?.data) {
      return {
        verified: false,
        status: response?.data?.status || 'failed',
        message: response?.message || 'Transaction could not be verified by Chapa.'
      };
    }

    const data = response.data;
    const isPaid = (data.status || '').toLowerCase() === 'success';

    return {
      verified: isPaid,
      status: (data.status || '').toLowerCase(),
      amount: Number(data.amount),
      currency: (data.currency || 'ETB').toUpperCase(),
      txRef: data.tx_ref,
      reference: data.reference,
      charge: Number(data.charge || 0),
      paymentMethod: data.method || 'online',
      mode: data.mode,
      donorEmail: data.email,
      donorFirstName: data.first_name,
      donorLastName: data.last_name,
      paidAt: data.created_at || data.updated_at,
      raw: data
    };
  }

  /**
   * Validates Chapa Webhook HMAC-SHA256 signature
   * Supports both `x-chapa-signature` and `chapa-signature` headers
   * Header comparison is constant-time (timingSafeEqual).
   */
  verifyWebhookSignature(rawBody, headers) {
    if (!this.webhookSecret || this.webhookSecret.trim() === '') {
      console.warn('[ChapaService] Webhook rejected: CHAPA_WEBHOOK_SECRET is not configured.');
      return false;
    }

    let signatureHeader = '';
    if (typeof headers === 'string') {
      signatureHeader = headers;
    } else if (headers && typeof headers === 'object') {
      signatureHeader = headers['x-chapa-signature'] || headers['chapa-signature'] || '';
    }

    if (!signatureHeader || signatureHeader.trim() === '') {
      return false;
    }

    try {
      const payloadBuf = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody || {}));
      
      // 1. Check HMAC of payload signed with secret key (Standard x-chapa-signature)
      const computedPayloadHmac = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payloadBuf)
        .digest('hex');

      const expectedPayloadBuf = Buffer.from(computedPayloadHmac, 'utf8');
      const providedBuf = Buffer.from(signatureHeader.trim(), 'utf8');

      if (expectedPayloadBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedPayloadBuf, providedBuf)) {
        return true;
      }

      // 2. Check HMAC of secret key signed with secret key (Alternative chapa-signature)
      const computedSecretHmac = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(this.webhookSecret)
        .digest('hex');

      const expectedSecretBuf = Buffer.from(computedSecretHmac, 'utf8');
      if (expectedSecretBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedSecretBuf, providedBuf)) {
        return true;
      }

      return false;
    } catch (err) {
      console.error('[ChapaService] Webhook signature verification error:', err.message);
      return false;
    }
  }

  /**
   * Processes a refund via Chapa Refund API
   * Endpoint: POST /v1/refund/:tx_ref
   */
  async refundTransaction({ txRef, amount, reason, reference }) {
    if (!txRef) {
      throw new Error('Transaction reference (tx_ref) is required for refund.');
    }

    const payload = {};
    if (amount) {
      const numAmount = Number(amount);
      if (numAmount > 0) payload.amount = numAmount.toFixed(2);
    }
    if (reason) payload.reason = reason;
    if (reference) payload.reference = reference;

    const response = await this._request(`/refund/${encodeURIComponent(txRef)}`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return {
      success: response?.status === 'success',
      refId: response?.data?.ref_id || response?.data?.reference || null,
      status: response?.data?.status || 'processing',
      message: response?.message || 'Refund request received by Chapa.',
      raw: response?.data
    };
  }
}

module.exports = new ChapaService();
module.exports.ErrorCodes = ErrorCodes;
