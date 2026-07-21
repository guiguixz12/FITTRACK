const express = require('express');
const { getDB } = require('../db/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET all templates with exercises
router.get('/', (req, res) => {
  const db = getDB();
  const templates = db.prepare(
    'SELECT * FROM workout_templates WHERE user_id = ? ORDER BY day_of_week'
  ).all(req.user.id);

  for (const t of templates) {
    t.exercises = db.prepare(
      'SELECT * FROM workout_template_exercises WHERE template_id = ? ORDER BY exercise_order'
    ).all(t.id);
  }

  res.json({ templates });
});

// PUT (upsert) template for a day — replaces name + all exercises atomically
router.put('/:dow', (req, res) => {
  const dow = parseInt(req.params.dow);
  if (dow < 0 || dow > 6) return res.status(400).json({ error: 'Dia inválido (0–6)' });

  const { name, exercises = [] } = req.body;
  const db = getDB();

  const upsert = db.transaction(() => {
    // Upsert template row
    db.prepare(`
      INSERT INTO workout_templates (user_id, day_of_week, name)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, day_of_week) DO UPDATE SET name = excluded.name
    `).run(req.user.id, dow, name || '');

    const tpl = db.prepare(
      'SELECT id FROM workout_templates WHERE user_id = ? AND day_of_week = ?'
    ).get(req.user.id, dow);

    // Replace all exercises
    db.prepare('DELETE FROM workout_template_exercises WHERE template_id = ?').run(tpl.id);

    const ins = db.prepare(`
      INSERT INTO workout_template_exercises (template_id, name, sets, reps, weight_kg, exercise_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    exercises.forEach((ex, i) => {
      ins.run(tpl.id, ex.name, ex.sets || null, ex.reps || null, ex.weight_kg || null, i + 1);
    });

    return tpl.id;
  });

  const id = upsert();
  res.json({ id });
});

// DELETE template for a day (set to rest)
router.delete('/:dow', (req, res) => {
  const dow = parseInt(req.params.dow);
  const db = getDB();
  const tpl = db.prepare(
    'SELECT id FROM workout_templates WHERE user_id = ? AND day_of_week = ?'
  ).get(req.user.id, dow);

  if (tpl) db.prepare('DELETE FROM workout_templates WHERE id = ?').run(tpl.id);
  res.json({ success: true });
});

module.exports = router;
