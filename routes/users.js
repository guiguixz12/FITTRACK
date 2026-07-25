const express = require('express');
const bcrypt = require('bcryptjs');
const { getDB } = require('../db/init');
const { requireAuth } = require('../middleware/auth');
const { computeTargets } = require('../utils/targets');

const router = express.Router();
router.use(requireAuth);

router.get('/me', (req, res) => {
  const user = getDB()
    .prepare('SELECT id, name, target_calories, target_protein, target_carbs, target_fat, height_cm, age, sex, target_weight, theme, activity_factor, goal_diff, targets_auto FROM users WHERE id=?')
    .get(req.user.id);
  res.json({ user });
});

router.put('/me', (req, res) => {
  const { target_calories, target_protein, target_carbs, target_fat, height_cm, age, sex, target_weight, theme } = req.body;
  const db = getDB();
  db.prepare(`
    UPDATE users SET
      target_calories=?, target_protein=?, target_carbs=?, target_fat=?,
      height_cm=?, age=?, sex=?, target_weight=?, theme=?
    WHERE id=?
  `).run(target_calories, target_protein, target_carbs, target_fat, height_cm, age, sex,
         target_weight || null, theme || 'light', req.user.id);
  // Switch to manual mode — isolated so missing column never kills the main save
  try { db.prepare('UPDATE users SET targets_auto=0 WHERE id=?').run(req.user.id); } catch (_) {}
  res.json({ success: true });
});

// Apply calculator result — saves activity_factor + goal_diff, runs computeTargets, enables auto mode
router.post('/me/auto-targets', (req, res) => {
  const { activity_factor, goal_diff, height_cm, age, sex } = req.body;
  if (!activity_factor || goal_diff == null) {
    return res.status(400).json({ error: 'activity_factor e goal_diff obrigatórios' });
  }
  const db = getDB();
  // Persist the calculator settings and any updated profile fields (height/age/sex)
  db.prepare(`
    UPDATE users SET activity_factor=?, goal_diff=?, targets_auto=1,
      height_cm=COALESCE(?, height_cm), age=COALESCE(?, age), sex=COALESCE(?, sex)
    WHERE id=?
  `).run(activity_factor, goal_diff, height_cm || null, age || null, sex || null, req.user.id);

  const targets = computeTargets(req.user.id);
  if (!targets) {
    return res.status(400).json({ error: 'Perfil incompleto ou sem peso registrado. Preencha altura, idade, sexo e registre um peso.' });
  }
  db.prepare(`
    UPDATE users SET target_calories=?, target_protein=?, target_carbs=?, target_fat=?
    WHERE id=?
  `).run(targets.target_calories, targets.target_protein, targets.target_carbs, targets.target_fat, req.user.id);

  const user = db.prepare(
    'SELECT id, name, target_calories, target_protein, target_carbs, target_fat, height_cm, age, sex, target_weight, theme, activity_factor, goal_diff, targets_auto FROM users WHERE id=?'
  ).get(req.user.id);

  res.json({ success: true, targets, user, notification: targets.notification });
});

router.patch('/me/theme', (req, res) => {
  const { theme } = req.body;
  if (!['dark', 'light'].includes(theme)) return res.status(400).json({ error: 'Tema inválido' });
  getDB().prepare('UPDATE users SET theme=? WHERE id=?').run(theme, req.user.id);
  res.json({ success: true });
});

router.put('/me/password', (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) return res.status(400).json({ error: 'Ambas as senhas são obrigatórias' });
  if (new_password.length < 6) return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' });

  const db = getDB();
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  if (!bcrypt.compareSync(current_password, user.password_hash)) {
    return res.status(401).json({ error: 'Senha atual incorreta' });
  }

  db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(bcrypt.hashSync(new_password, 10), req.user.id);
  res.json({ success: true });
});

module.exports = router;
