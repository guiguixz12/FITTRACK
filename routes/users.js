const express = require('express');
const bcrypt = require('bcryptjs');
const { getDB } = require('../db/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/me', (req, res) => {
  const user = getDB()
    .prepare('SELECT id, name, target_calories, target_protein, target_carbs, target_fat, height_cm, age, sex, target_weight, theme FROM users WHERE id=?')
    .get(req.user.id);
  res.json({ user });
});

router.put('/me', (req, res) => {
  const { target_calories, target_protein, target_carbs, target_fat, height_cm, age, sex, target_weight, theme } = req.body;
  getDB().prepare(`
    UPDATE users SET
      target_calories=?, target_protein=?, target_carbs=?, target_fat=?,
      height_cm=?, age=?, sex=?, target_weight=?, theme=?
    WHERE id=?
  `).run(target_calories, target_protein, target_carbs, target_fat, height_cm, age, sex,
         target_weight || null, theme || 'light', req.user.id);
  res.json({ success: true });
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
