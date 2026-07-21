const express = require('express');
const { getDB } = require('../db/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const db = getDB();
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const logs = db.prepare('SELECT * FROM water_logs WHERE user_id=? AND date=? ORDER BY created_at').all(req.user.id, date);
  const total_ml = logs.reduce((s, l) => s + l.amount_ml, 0);
  const goal_ml = req.user.water_goal_ml || 2000;
  res.json({ logs, total_ml, goal_ml });
});

router.post('/', (req, res) => {
  const { date, amount_ml } = req.body;
  if (!date || !amount_ml) return res.status(400).json({ error: 'Data e quantidade obrigatórias' });
  const db = getDB();
  const r = db.prepare('INSERT INTO water_logs (user_id, date, amount_ml) VALUES (?,?,?)').run(req.user.id, date, amount_ml);
  res.json({ id: r.lastInsertRowid, success: true });
});

router.delete('/:id', (req, res) => {
  getDB().prepare('DELETE FROM water_logs WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

module.exports = router;
