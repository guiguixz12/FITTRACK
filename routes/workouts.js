const express = require('express');
const { getDB } = require('../db/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ── Workout Sessions ──────────────────────────────────────────────────────────

router.get('/', (req, res) => {
  const db = getDB();
  const { date } = req.query;

  if (date) {
    const workout = db.prepare('SELECT * FROM workouts WHERE user_id=? AND date=?').get(req.user.id, date);
    if (!workout) return res.json({ workout: null });
    const exercises = db.prepare('SELECT * FROM workout_exercises WHERE workout_id=? ORDER BY exercise_order').all(workout.id);
    return res.json({ workout: { ...workout, exercises } });
  }

  const workouts = db.prepare('SELECT * FROM workouts WHERE user_id=? ORDER BY date DESC LIMIT 20').all(req.user.id);
  res.json({ workouts });
});

router.post('/', (req, res) => {
  const { date, notes } = req.body;
  if (!date) return res.status(400).json({ error: 'Data obrigatória' });

  const db = getDB();
  const existing = db.prepare('SELECT id FROM workouts WHERE user_id=? AND date=?').get(req.user.id, date);

  if (existing) {
    if (notes !== undefined) db.prepare('UPDATE workouts SET notes=? WHERE id=?').run(notes, existing.id);
    return res.json({ id: existing.id });
  }

  const r = db.prepare('INSERT INTO workouts (user_id, date, notes) VALUES (?,?,?)').run(req.user.id, date, notes || '');
  res.json({ id: r.lastInsertRowid, created: true });
});

router.put('/:id', (req, res) => {
  const { notes } = req.body;
  getDB().prepare('UPDATE workouts SET notes=? WHERE id=? AND user_id=?').run(notes || '', req.params.id, req.user.id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  getDB().prepare('DELETE FROM workouts WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// ── Exercises ─────────────────────────────────────────────────────────────────

router.post('/:id/exercises', (req, res) => {
  const db = getDB();
  const workout = db.prepare('SELECT id FROM workouts WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!workout) return res.status(404).json({ error: 'Treino não encontrado' });

  const { name, sets, reps, weight_kg } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome do exercício obrigatório' });

  const { max } = db.prepare('SELECT MAX(exercise_order) as max FROM workout_exercises WHERE workout_id=?').get(req.params.id);
  const order = (max || 0) + 1;

  const r = db.prepare('INSERT INTO workout_exercises (workout_id, name, sets, reps, weight_kg, exercise_order) VALUES (?,?,?,?,?,?)')
    .run(req.params.id, name, sets || null, reps || null, weight_kg || null, order);

  res.json({ id: r.lastInsertRowid });
});

router.put('/:id/exercises/:exId', (req, res) => {
  const db = getDB();
  const ex = db.prepare(`
    SELECT we.id FROM workout_exercises we
    JOIN workouts w ON we.workout_id = w.id
    WHERE we.id=? AND w.user_id=?
  `).get(req.params.exId, req.user.id);
  if (!ex) return res.status(404).json({ error: 'Exercício não encontrado' });

  const { name, sets, reps, weight_kg } = req.body;
  db.prepare('UPDATE workout_exercises SET name=?, sets=?, reps=?, weight_kg=? WHERE id=?')
    .run(name, sets || null, reps || null, weight_kg || null, req.params.exId);
  res.json({ success: true });
});

router.delete('/:id/exercises/:exId', (req, res) => {
  const db = getDB();
  const ex = db.prepare(`
    SELECT we.id FROM workout_exercises we
    JOIN workouts w ON we.workout_id = w.id
    WHERE we.id=? AND w.user_id=?
  `).get(req.params.exId, req.user.id);
  if (!ex) return res.status(404).json({ error: 'Exercício não encontrado' });

  db.prepare('DELETE FROM workout_exercises WHERE id=?').run(req.params.exId);
  res.json({ success: true });
});

module.exports = router;
