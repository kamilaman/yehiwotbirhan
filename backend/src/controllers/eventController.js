/**
 * Event Controller — Event Registrations & Attendee Management
 */

const { db } = require('../config/database');
const { logAudit } = require('./adminController');

// Public & Admin: Register Participant
exports.registerEventParticipant = (req, res) => {
  const { eventTitle, participantName, participantEmail, participantPhone, notes } = req.body;

  if (!eventTitle || !participantEmail) {
    return res.status(400).json({ error: 'Event Title and Participant Email are required.' });
  }

  const sql = `
    INSERT INTO event_registrations (event_title, participant_name, participant_email, participant_phone, status, notes)
    VALUES (?, ?, ?, ?, 'confirmed', ?)
  `;

  db.run(sql, [eventTitle, participantName || 'Guest', participantEmail, participantPhone || '', notes || ''], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    
    if (req.admin) {
      logAudit(req.admin.username, 'ADD_EVENT_PARTICIPANT', `Added ${participantName} to ${eventTitle}`);
    }
    
    res.status(201).json({ success: true, message: 'Event registration confirmed.', id: this.lastID });
  });
};

// Admin: Get All Event Registrations
exports.getEventRegistrations = (req, res) => {
  db.all('SELECT * FROM event_registrations ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Admin: Delete Event Registration
exports.deleteEventRegistration = (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM event_registrations WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    logAudit(req.admin.username, 'DELETE_EVENT_PARTICIPANT', `Deleted event registration #${id}`);
    res.json({ success: true, message: 'Event registration removed.' });
  });
};
