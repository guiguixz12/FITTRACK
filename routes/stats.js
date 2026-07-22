const express = require('express');
const { getDB } = require('../db/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ── Streak ────────────────────────────────────────────────────────────────────
router.get('/streak', (req, res) => {
  const db = getDB();
  const uid = req.user.id;

  // Get all dates with activity (diet log OR workout)
  const dietDates  = db.prepare('SELECT DISTINCT date FROM diet_logs WHERE user_id=? AND calories > 0 ORDER BY date DESC').all(uid).map(r => r.date);
  const wkDates    = db.prepare('SELECT DISTINCT date FROM workouts WHERE user_id=? ORDER BY date DESC').all(uid).map(r => r.date);
  const allDates   = [...new Set([...dietDates, ...wkDates])].sort().reverse();

  if (!allDates.length) return res.json({ streak: 0, longest: 0 });

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Current streak — must include today or yesterday
  let streak = 0;
  if (allDates[0] === today || allDates[0] === yesterday) {
    let prev = new Date(allDates[0]);
    streak = 1;
    for (let i = 1; i < allDates.length; i++) {
      const cur = new Date(allDates[i]);
      const diff = (prev - cur) / 86400000;
      if (diff === 1) { streak++; prev = cur; }
      else break;
    }
  }

  // Longest streak
  let longest = 1, cur = 1;
  const sorted = [...allDates].sort();
  for (let i = 1; i < sorted.length; i++) {
    const diff = (new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000;
    if (diff === 1) { cur++; if (cur > longest) longest = cur; }
    else cur = 1;
  }

  res.json({ streak, longest });
});

// ── Weekly Report ─────────────────────────────────────────────────────────────
router.get('/weekly', (req, res) => {
  const db  = getDB();
  const uid = req.user.id;

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    days.push(d);
  }

  const dietLogs = db.prepare(
    `SELECT date, calories, protein, carbs, fat FROM diet_logs WHERE user_id=? AND date>=? AND date<=?`
  ).all(uid, days[0], days[6]);

  const workouts = db.prepare(
    `SELECT w.date, COUNT(we.id) as ex_count, SUM(we.sets * we.reps * COALESCE(we.weight_kg,0)) as volume
     FROM workouts w LEFT JOIN workout_exercises we ON we.workout_id = w.id
     WHERE w.user_id=? AND w.date>=? AND w.date<=?
     GROUP BY w.date`
  ).all(uid, days[0], days[6]);

  const dietMap = Object.fromEntries(dietLogs.map(d => [d.date, d]));
  const wkMap   = Object.fromEntries(workouts.map(w => [w.date, w]));

  const report = days.map(date => ({
    date,
    calories: dietMap[date]?.calories || 0,
    protein:  dietMap[date]?.protein  || 0,
    trained:  !!wkMap[date],
    volume:   Math.round(wkMap[date]?.volume || 0),
  }));

  const loggedDays   = report.filter(d => d.calories > 0).length;
  const trainedDays  = report.filter(d => d.trained).length;
  const avgCalories  = loggedDays ? Math.round(report.filter(d => d.calories > 0).reduce((s, d) => s + d.calories, 0) / loggedDays) : 0;
  const avgProtein   = loggedDays ? Math.round(report.filter(d => d.protein  > 0).reduce((s, d) => s + d.protein,  0) / loggedDays) : 0;
  const totalVolume  = report.reduce((s, d) => s + d.volume, 0);

  res.json({ days: report, summary: { loggedDays, trainedDays, avgCalories, avgProtein, totalVolume } });
});

// ── Personal Records ──────────────────────────────────────────────────────────
router.get('/prs', (req, res) => {
  const prs = getDB().prepare('SELECT * FROM exercise_prs WHERE user_id=? ORDER BY date DESC').all(req.user.id);
  res.json({ prs });
});

// Called after saving a workout exercise — check/update PR
router.post('/prs/check', (req, res) => {
  const { exercise_name, sets, reps, weight_kg, date } = req.body;
  if (!exercise_name) return res.status(400).json({ error: 'exercise_name obrigatório' });

  const db  = getDB();
  const uid = req.user.id;
  const volume = (sets || 0) * (reps || 0) * (weight_kg || 0);

  const existing = db.prepare('SELECT * FROM exercise_prs WHERE user_id=? AND exercise_name=?').get(uid, exercise_name);

  let is_pr = false;
  if (!existing || volume > (existing.volume || 0)) {
    db.prepare(`
      INSERT INTO exercise_prs (user_id, exercise_name, weight_kg, reps, sets, volume, date)
      VALUES (?,?,?,?,?,?,?)
      ON CONFLICT(user_id, exercise_name) DO UPDATE SET
        weight_kg=excluded.weight_kg, reps=excluded.reps, sets=excluded.sets,
        volume=excluded.volume, date=excluded.date
    `).run(uid, exercise_name, weight_kg || 0, reps || 0, sets || 0, volume, date || new Date().toISOString().slice(0, 10));
    is_pr = true;
  }

  res.json({ is_pr, volume, previous_volume: existing?.volume || 0 });
});

// ── Exercise Weight History ───────────────────────────────────────────────────
router.get('/exercise-history', (req, res) => {
  const db  = getDB();
  const uid = req.user.id;
  const { name } = req.query;

  if (!name) {
    const names = db.prepare(`
      SELECT DISTINCT we.name
      FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE w.user_id = ? AND we.weight_kg > 0
      ORDER BY we.name
    `).all(uid).map(r => r.name);
    return res.json({ names });
  }

  const history = db.prepare(`
    SELECT w.date, MAX(we.weight_kg) as weight_kg, we.sets, we.reps
    FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
    WHERE w.user_id = ? AND LOWER(we.name) = LOWER(?) AND we.weight_kg > 0
    GROUP BY w.date
    ORDER BY w.date ASC
  `).all(uid, name);

  res.json({ name, history });
});

module.exports = router;
