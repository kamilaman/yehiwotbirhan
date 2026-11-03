/**
 * Contact Controller — Visitor Messages & Prayer Requests
 */

const { db } = require('../config/database');
const { logAudit } = require('./adminController');

// Public: Store Visitor Contact Message
exports.createContactMessage = (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const sql = 'INSERT INTO contact_messages (name, email, phone, message, status) VALUES (?, ?, ?, ?, "unread")';
  db.run(sql, [name, email, phone || '', message], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, message: 'Message submitted successfully.', id: this.lastID });
  });
};

// Public: Newsletter Subscription
exports.subscribeNewsletter = (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const sql = 'INSERT INTO contact_messages (name, email, phone, message, status) VALUES (?, ?, "", "[Newsletter Subscription] Subscribed to church weekly bulletin", "unread")';
  db.run(sql, ['Newsletter Subscriber', email], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, message: 'Successfully subscribed to the church newsletter!' });
  });
};

// Admin: Get Messages List
exports.getContactMessages = (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM contact_messages';
  const params = [];

  if (status && status !== 'all') {
    sql += ' WHERE status = ?';
    params.push(status);
  }

  sql += ' ORDER BY id DESC';

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Admin: Update Message Status & Staff Notes
exports.updateContactMessage = (req, res) => {
  const { status, notes } = req.body;
  const id = req.params.id;

  const sql = 'UPDATE contact_messages SET status = COALESCE(?, status), notes = COALESCE(?, notes) WHERE id = ?';
  db.run(sql, [status, notes, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    logAudit(req.admin.username, 'UPDATE_MESSAGE', `Updated contact message #${id} status to ${status}`);
    res.json({ success: true, message: 'Message updated.' });
  });
};

// Admin: Delete Contact Message
exports.deleteContactMessage = (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM contact_messages WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    logAudit(req.admin.username, 'DELETE_MESSAGE', `Deleted contact message #${id}`);
    res.json({ success: true, message: 'Message deleted.' });
  });
};
