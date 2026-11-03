/**
 * Campaign Controller — Building Fund Goals & Live Metrics
 */

const { db } = require('../config/database');
const { logAudit } = require('./adminController');

// Public: Fetch Live Building Campaign Progress
exports.getCampaign = (req, res) => {
  db.get('SELECT * FROM campaign_stats ORDER BY id DESC LIMIT 1', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || { goal_usd: 500000, raised_usd: 315000, goal_etb: 60000000, raised_etb: 37800000 });
  });
};

// Admin: Update Building Campaign Live Stats
exports.updateCampaign = (req, res) => {
  const { goal_usd, raised_usd, goal_etb, raised_etb } = req.body;

  if (goal_usd === undefined || raised_usd === undefined || goal_etb === undefined || raised_etb === undefined) {
    return res.status(400).json({ error: 'All campaign fields are required.' });
  }

  const sql = `
    UPDATE campaign_stats
    SET goal_usd = ?, raised_usd = ?, goal_etb = ?, raised_etb = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = (SELECT MAX(id) FROM campaign_stats)
  `;

  db.run(sql, [goal_usd, raised_usd, goal_etb, raised_etb], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    logAudit(req.admin.username, 'UPDATE_CAMPAIGN_STATS', `Updated Building Fund stats: ETB (${raised_etb}/${goal_etb}), USD (${raised_usd}/${goal_usd})`);
    res.json({ success: true, message: 'Campaign stats updated successfully.' });
  });
};
