const express = require('express');
const { getDB } = require('../db/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ── Diet Logs ─────────────────────────────────────────────────────────────────

router.get('/logs', (req, res) => {
  const db = getDB();
  const { date } = req.query;

  if (date) {
    const log = db.prepare('SELECT * FROM diet_logs WHERE user_id = ? AND date = ?').get(req.user.id, date);
    return res.json({ log: log || null });
  }

  const logs = db
    .prepare('SELECT * FROM diet_logs WHERE user_id = ? ORDER BY date DESC LIMIT 30')
    .all(req.user.id);
  res.json({ logs });
});

router.post('/logs', (req, res) => {
  const { date, calories, protein, carbs, fat, notes, mode } = req.body;
  if (!date) return res.status(400).json({ error: 'Data obrigatória' });

  const db  = getDB();
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const existing = db.prepare('SELECT * FROM diet_logs WHERE user_id = ? AND date = ?').get(req.user.id, date);

  // mode='check' → only report if a conflict exists, never write
  if (mode === 'check') {
    return res.json({ existing: existing || null });
  }

  if (existing) {
    if (mode === 'merge') {
      db.prepare(`UPDATE diet_logs
        SET calories=?, protein=?, carbs=?, fat=?, notes=?, updated_at=?
        WHERE id=?`).run(
          (existing.calories || 0) + (calories || 0),
          round1((existing.protein || 0) + (protein || 0)),
          round1((existing.carbs   || 0) + (carbs   || 0)),
          round1((existing.fat     || 0) + (fat     || 0)),
          notes || existing.notes || '',
          now, existing.id
      );
    } else {
      // mode='replace' or legacy call — overwrite
      db.prepare(`UPDATE diet_logs
        SET calories=?, protein=?, carbs=?, fat=?, notes=?, updated_at=?
        WHERE id=?`).run(calories || 0, protein || 0, carbs || 0, fat || 0, notes || '', now, existing.id);
    }
    return res.json({ id: existing.id, updated: true, mode: mode || 'replace' });
  }

  const r = db.prepare(`INSERT INTO diet_logs
    (user_id, date, calories, protein, carbs, fat, notes, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(req.user.id, date, calories || 0, protein || 0, carbs || 0, fat || 0, notes || '', now, now);
  res.json({ id: r.lastInsertRowid, created: true });
});

function round1(n) { return Math.round(n * 10) / 10; }

router.delete('/logs/:id', (req, res) => {
  getDB().prepare('DELETE FROM diet_logs WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// ── Weight Logs ───────────────────────────────────────────────────────────────

router.get('/weight', (req, res) => {
  const db = getDB();
  const { date, days } = req.query;

  if (date) {
    const log = db.prepare('SELECT * FROM weight_logs WHERE user_id=? AND date=?').get(req.user.id, date);
    return res.json({ log: log || null });
  }

  let logs;
  if (days) {
    logs = db.prepare(
      "SELECT * FROM weight_logs WHERE user_id=? AND date >= date('now', ?) ORDER BY date ASC"
    ).all(req.user.id, `-${days} days`);
  } else {
    logs = db.prepare('SELECT * FROM weight_logs WHERE user_id=? ORDER BY date ASC').all(req.user.id);
  }
  res.json({ logs });
});

router.post('/weight', (req, res) => {
  const { date, weight_kg } = req.body;
  if (!date || weight_kg == null) return res.status(400).json({ error: 'Data e peso obrigatórios' });

  getDB().prepare(`
    INSERT INTO weight_logs (user_id, date, weight_kg) VALUES (?,?,?)
    ON CONFLICT(user_id, date) DO UPDATE SET weight_kg=excluded.weight_kg
  `).run(req.user.id, date, weight_kg);

  res.json({ success: true });
});

router.delete('/weight/:id', (req, res) => {
  getDB().prepare('DELETE FROM weight_logs WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

module.exports = router;
