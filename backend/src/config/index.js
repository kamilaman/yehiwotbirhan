/**
 * Backend Environment & System Configuration Loader
 */

const path = require('path');
const fs = require('fs');

// Load environment configuration from .env file if present
const envCandidates = [
  path.join(__dirname, '../../.env'),
  path.join(__dirname, '../../../.env')
];
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    break;
  }
}
require('dotenv').config(); // default fallback

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'hiwot_birhan_church_secret_key_2026',
  dbPath: process.env.DB_PATH || path.join(__dirname, '../../data/church_database.sqlite'),
  schemaPath: path.join(__dirname, '../../data/schema.sql'),
  postgresSchemaPath: path.join(__dirname, '../../data/schema.postgres.sql'),
  databaseUrl: process.env.DATABASE_URL || '',
  chapaSecretKey: process.env.CHAPA_SECRET_KEY || '',
  chapaWebhookSecret: process.env.CHAPA_WEBHOOK_SECRET || '',
  chapaMode: process.env.CHAPA_MODE || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  appUrl: process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || ''
};
