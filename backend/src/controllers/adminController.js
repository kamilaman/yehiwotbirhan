/**
 * Admin Controller — Authentication, Dashboard Overview, Diagnostics & Password Security
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { db, hashPassword, verifyPassword } = require('../config/database');
const config = require('../config');

function logAudit(adminUsername, action, details) {
  const sql = 'INSERT INTO audit_logs (admin_username, action, details) VALUES (?, ?, ?)';
  db.run(sql, [adminUsername, action, details || ''], (err) => {
    if (err) console.warn('Failed to record audit log:', err.message);
  });
}

exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!admin) return res.status(401).json({ error: 'Invalid username or password.' });

    const isValid = verifyPassword(password, admin.password_hash, admin.salt);
    if (!isValid) return res.status(401).json({ error: 'Invalid username or password.' });

    const adminSessionInfo = {
      id: admin.id,
      username: admin.username,
      fullName: admin.full_name,
      role: admin.role
    };

    // Sign stateless JWT with 24-hour expiration
    const token = jwt.sign(adminSessionInfo, config.jwtSecret, { expiresIn: '24h' });

    db.run('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [admin.id]);
    logAudit(admin.username, 'ADMIN_LOGIN', 'Logged into Admin Portal');

    res.json({ success: true, token, admin: adminSessionInfo });
  });
};

exports.getMe = (req, res) => {
  res.json({ success: true, admin: req.admin });
};

exports.changePassword = (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
  }

  db.get('SELECT * FROM admins WHERE username = ?', [req.admin.username], (err, admin) => {
    if (err || !admin) return res.status(500).json({ error: 'Failed to verify account.' });

    if (!verifyPassword(currentPassword, admin.password_hash, admin.salt)) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const { hash, salt } = hashPassword(newPassword);
    db.run('UPDATE admins SET password_hash = ?, salt = ? WHERE username = ?', [hash, salt, req.admin.username], (updateErr) => {
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      logAudit(req.admin.username, 'CHANGE_PASSWORD', 'Password updated successfully');
      res.json({ success: true, message: 'Password changed successfully.' });
    });
  });
};

exports.getStats = (req, res) => {
  const stats = {};

  // Rule 3, Rule 6 & Rule 7: Only settled, completed gifts count toward verified totals. Strictly isolated currencies.
  const completedEtbSql = "SELECT SUM(amount) AS total_etb FROM donations WHERE (currency = 'ETB' OR currency IS NULL) AND status = 'completed' AND (is_archived = 0 OR is_archived IS NULL)";
  const completedUsdSql = "SELECT SUM(amount) AS total_usd FROM donations WHERE currency = 'USD' AND status = 'completed' AND (is_archived = 0 OR is_archived IS NULL)";

  db.get(completedEtbSql, [], (e1, r1) => {
    stats.total_etb = r1 ? Number(r1.total_etb || 0) : 0;

    db.get(completedUsdSql, [], (e2, r2) => {
      stats.total_usd = r2 ? Number(r2.total_usd || 0) : 0;

      db.get("SELECT COUNT(*) AS count FROM donations WHERE (is_archived = 0 OR is_archived IS NULL)", [], (e3, r3) => {
        stats.donations_count = r3 ? r3.count : 0;

        // Status breakdown metrics for financial audit
        db.all("SELECT status, count(*) as count, SUM(amount) as sum FROM donations WHERE (is_archived = 0 OR is_archived IS NULL) GROUP BY status", [], (eStat, rows) => {
          stats.status_breakdown = {};
          if (rows) {
            rows.forEach((row) => {
              stats.status_breakdown[row.status] = {
                count: row.count,
                total: Number(row.sum || 0)
              };
            });
          }

          db.get("SELECT COUNT(*) AS unread FROM contact_messages WHERE status = 'unread'", [], (e4, r4) => {
            stats.unread_messages = r4 ? r4.unread : 0;

            db.get("SELECT COUNT(*) AS count FROM event_registrations", [], (e5, r5) => {
              stats.event_registrations_count = r5 ? r5.count : 0;

              db.get("SELECT * FROM campaign_stats ORDER BY id DESC LIMIT 1", [], (e6, campaign) => {
                stats.campaign = campaign || { goal_usd: 500000, raised_usd: 315000, goal_etb: 60000000, raised_etb: 37800000 };

                db.all("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 15", [], (e7, logs) => {
                  stats.recent_audit_logs = logs || [];
                  res.json(stats);
                });
              });
            });
          });
        });
      });
    });
  });
};

exports.getSystemHealth = (req, res) => {
  let dbSizeBytes = 0;
  if (fs.existsSync(config.dbPath)) {
    const stats = fs.statSync(config.dbPath);
    dbSizeBytes = stats.size;
  }

  db.get('SELECT COUNT(*) AS donations FROM donations', [], (e1, r1) => {
    db.get('SELECT COUNT(*) AS messages FROM contact_messages', [], (e2, r2) => {
      db.get('SELECT COUNT(*) AS events FROM event_registrations', [], (e3, r3) => {
        db.get('SELECT COUNT(*) AS logs FROM audit_logs', [], (e4, r4) => {
          res.json({
            status: 'HEALTHY',
            uptimeSeconds: Math.floor(process.uptime()),
            nodeVersion: process.version,
            platform: process.platform,
            memoryUsageMB: (process.memoryUsage().rss / (1024 * 1024)).toFixed(2),
            database: {
              type: 'SQLite3',
              fileSizeBytes: dbSizeBytes,
              fileSizeMB: (dbSizeBytes / (1024 * 1024)).toFixed(2),
              tables: {
                donations: r1 ? r1.donations : 0,
                messages: r2 ? r2.messages : 0,
                event_registrations: r3 ? r3.events : 0,
                audit_logs: r4 ? r4.logs : 0
              }
            }
          });
        });
      });
    });
  });
};

exports.getDatabaseBackup = (req, res) => {
  const backupData = {
    exportedAt: new Date().toISOString(),
    exportedBy: req.admin.username
  };

  db.all('SELECT * FROM donations', [], (e1, donations) => {
    backupData.donations = donations || [];
    db.all('SELECT * FROM contact_messages', [], (e2, messages) => {
      backupData.contact_messages = messages || [];
      db.all('SELECT * FROM event_registrations', [], (e3, events) => {
        backupData.event_registrations = events || [];
        db.all('SELECT * FROM campaign_stats', [], (e4, campaign) => {
          backupData.campaign_stats = campaign || [];
          db.all('SELECT * FROM audit_logs', [], (e5, logs) => {
            backupData.audit_logs = logs || [];

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=hiwot_birhan_db_backup_${Date.now()}.json`);
            res.send(JSON.stringify(backupData, null, 2));
          });
        });
      });
    });
  });
};

exports.logAudit = logAudit;
