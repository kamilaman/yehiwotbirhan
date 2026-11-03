/**
 * BATU YEHIYWOT BERHAN CHURCH - Enterprise Backend API Server Entrypoint
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const routes = require('./routes');

const http = require('http');
const rateLimit = require('express-rate-limit');

const app = express();

// Enable reverse proxy trust (for accurate IP resolution behind Nginx/Docker)
app.set('trust proxy', 1);

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (config.nodeEnv === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Production-hardened CORS configuration
const allowedOrigins = [
  config.frontendUrl,
  config.appUrl,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5000',
  'https://batuyehiywotberhanchurch.org',
  'https://www.batuyehiywotberhanchurch.org'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || config.nodeEnv !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true
}));

app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads directory exists and serve statically
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// 1. General API Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// 2. Strict Auth Rate Limiting (Prevents brute force on IT Admin Portal)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many failed login attempts. Please try again after 15 minutes.' }
});

// 3. Public Form Submission Limiter (Prevents payment/contact/registration spam)
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please wait a few moments before trying again.' }
});

// 4. Status Polling Limiter (Permits healthy browser receipt verification)
const statusLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Status check rate limit reached. Please wait a moment.' }
});

app.use('/api', apiLimiter);
app.use('/api/admin/login', authLimiter);
app.use('/api/donations/chapa/initialize', formLimiter);
app.use('/api/donations/stripe/initialize', formLimiter);
app.use('/api/donations', formLimiter);
app.use('/api/contact', formLimiter);
app.use('/api/newsletter', formLimiter);
app.use('/api/events/register', formLimiter);
app.use('/api/donations/status', statusLimiter);
app.use('/api/donations/chapa/verify', statusLimiter);
app.use('/api/donations/stripe/verify', statusLimiter);
app.use('/api/payments/chapa/callback', statusLimiter);

// Mount REST API Routes under /api
app.use('/api', routes);

// Reverse Proxy all web routes to Next.js frontend (port 3000)
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();

  const proxyReq = http.request(
    {
      hostname: '127.0.0.1',
      port: 3000,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: 'localhost:3000' }
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  );

  proxyReq.on('error', () => {
    // If Next.js dev server is not responding, fallback to static public assets
    next();
  });

  req.pipe(proxyReq, { end: true });
});

// Serve only safe static frontend assets (never expose package.json, Dockerfile, or configs)
const publicDir = path.join(__dirname, '../../frontend/public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}
app.use('/images', express.static(path.join(__dirname, '../../frontend/images')));
app.use('/css', express.static(path.join(__dirname, '../../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../../frontend/js')));

// Global Error Handler (Sanitizes stack traces and internal errors in production)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'production' ? 'An unexpected server error occurred.' : err.message
  });
});

// Start API Server if executed directly
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`===================================================`);
    console.log(`BATU YEHIYWOT BERHAN CHURCH API Server Running!`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Server URL:  http://localhost:${config.port}`);
    console.log(`===================================================`);
  });
}

module.exports = app;
