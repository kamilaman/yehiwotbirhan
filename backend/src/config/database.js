/**
 * Enterprise Database Connection & Crypto Utilities Manager
 * Supports:
 *   1. Production PostgreSQL (when DATABASE_URL is configured)
 *   2. Local SQLite (fallback when DATABASE_URL is not provided)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./index');

let db;

function hashPassword(password, salt = null, iterations = 100000) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, storedHash, storedSalt) {
  const { hash: modernHash } = hashPassword(password, storedSalt, 100000);
  if (modernHash === storedHash) return true;
  const { hash: legacyHash } = hashPassword(password, storedSalt, 1000);
  return legacyHash === storedHash;
}

if (config.databaseUrl) {
  // ============================================================================
  // POSTGRESQL DRIVER ADAPTER
  // ============================================================================
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: process.env.NODE_ENV === 'production' && !config.databaseUrl.includes('localhost') && !config.databaseUrl.includes('127.0.0.1')
      ? { rejectUnauthorized: false }
      : false
  });

  // Helper to convert SQLite '?' placeholders to PostgreSQL '$1, $2, ...' accurately ignoring '?' inside string literals
  function convertSql(sql) {
    let index = 1;
    let inString = false;
    let result = '';
    for (let i = 0; i < sql.length; i++) {
      const char = sql[i];
      if (char === "'") {
        if (inString && sql[i + 1] === "'") {
          result += "''";
          i++;
          continue;
        }
        inString = !inString;
        result += char;
      } else if (char === '?' && !inString) {
        result += `$${index++}`;
      } else {
        result += char;
      }
    }
    return result;
  }

  db = {
    isPostgres: true,
    pool,

    run(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      params = params || [];

      let convertedSql = convertSql(sql);
      const isInsert = /^\s*INSERT\s+INTO/i.test(convertedSql);
      const hasReturning = /\bRETURNING\b/i.test(convertedSql);

      // Append RETURNING id on INSERT statements so this.lastID is populated
      if (isInsert && !hasReturning) {
        convertedSql += ' RETURNING id';
      }

      pool.query(convertedSql, params, (err, res) => {
        const context = {
          lastID: res?.rows?.[0]?.id || 0,
          changes: res?.rowCount || 0
        };
        if (callback) {
          callback.call(context, err);
        }
      });
    },

    get(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      params = params || [];
      const convertedSql = convertSql(sql);

      pool.query(convertedSql, params, (err, res) => {
        if (callback) {
          callback(err, res ? res.rows[0] : null);
        }
      });
    },

    all(sql, params, callback) {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      params = params || [];
      const convertedSql = convertSql(sql);

      pool.query(convertedSql, params, (err, res) => {
        if (callback) {
          callback(err, res ? res.rows : []);
        }
      });
    },

    exec(sql, callback) {
      pool.query(sql, (err) => {
        if (callback) callback(err);
      });
    }
  };

  pool.connect((err, client, release) => {
    if (err) {
      console.error('❌ Failed to connect to PostgreSQL database:', err.message);
    } else {
      release();
      console.log('✅ Connected to PostgreSQL database successfully.');
      initPostgresSchema();
    }
  });

  function initPostgresSchema() {
    if (fs.existsSync(config.postgresSchemaPath)) {
      const schemaSql = fs.readFileSync(config.postgresSchemaPath, 'utf8');
      pool.query(schemaSql, (err) => {
        if (err) {
          console.error('Error applying PostgreSQL schema:', err.message);
        } else {
          console.log('PostgreSQL schema verified and synchronized.');
          seedDefaultAdmin();
        }
      });
    } else {
      seedDefaultAdmin();
    }
  }

} else {
  // ============================================================================
  // SQLITE DRIVER (LOCAL DEVELOPMENT FALLBACK)
  // ============================================================================
  const sqlite3 = require('sqlite3').verbose();
  const dbDir = path.dirname(config.dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new sqlite3.Database(config.dbPath, (err) => {
    if (err) {
      console.error('Failed to connect to SQLite database:', err.message);
    } else {
      console.log('Connected to SQLite database at:', config.dbPath);
      initSqliteSchema();
    }
  });

  function initSqliteSchema() {
    if (fs.existsSync(config.schemaPath)) {
      const schemaSql = fs.readFileSync(config.schemaPath, 'utf8');
      db.exec(schemaSql, (err) => {
        if (err) {
          console.error('Error executing SQLite schema SQL:', err.message);
        } else {
          console.log('Database tables verified & initialized successfully.');
          seedDefaultAdmin();
          migrateSqliteColumns();
        }
      });
    }
  }

  function migrateSqliteColumns() {
    const migrations = [
      { table: 'contact_messages', column: 'notes', type: 'TEXT' },
      { table: 'event_registrations', column: 'participant_phone', type: 'TEXT' },
      { table: 'event_registrations', column: 'status', type: "TEXT DEFAULT 'confirmed'" },
      { table: 'event_registrations', column: 'notes', type: 'TEXT' },
      { table: 'donations', column: 'public_id', type: 'TEXT' },
      { table: 'donations', column: 'is_archived', type: 'INTEGER DEFAULT 0' },
      { table: 'donations', column: 'paid_at', type: 'DATETIME' },
      { table: 'donations', column: 'completed_at', type: 'DATETIME' },
      { table: 'donations', column: 'cancelled_at', type: 'DATETIME' },
      { table: 'donations', column: 'updated_at', type: 'DATETIME' },
      { table: 'payment_attempts', column: 'updated_at', type: 'DATETIME' }
    ];

    migrations.forEach(({ table, column, type }) => {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`, () => {});
    });

    db.run("UPDATE donations SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL", () => {});
    db.run("UPDATE donations SET is_archived = 0 WHERE is_archived IS NULL", () => {});
  }
}

function seedDefaultAdmin() {
  db.get('SELECT COUNT(*) AS count FROM admins', [], (err, row) => {
    if (err) return;
    const count = Number(row?.count || 0);
    if (count === 0) {
      const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const { hash, salt } = hashPassword(defaultPassword, null, 100000);
      const sql = 'INSERT INTO admins (username, password_hash, salt, full_name, role) VALUES (?, ?, ?, ?, ?)';
      db.run(sql, [defaultUsername, hash, salt, 'Church IT Admin', 'superadmin'], (seedErr) => {
        if (seedErr) {
          console.error('Error seeding default admin:', seedErr.message);
        } else {
          console.log(`✅ Default IT Admin initialized (Username: ${defaultUsername})`);
        }
      });
    }
  });
}

module.exports = {
  db,
  hashPassword,
  verifyPassword
};
