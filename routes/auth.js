const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const COOKIE_OPTS = {
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: 'lax'
};

router.post('/login', (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ error: 'Nome e senha obrigatórios' });

  const user = getDB().prepare('SELECT * FROM users WHERE name = ?').get(name);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name },
    process.env.JWT_SECRET || 'dev_secret_change_me',
    { expiresIn: '30d' }
  );

  if (process.env.NODE_ENV === 'production') COOKIE_OPTS.secure = true;
  res.cookie('token', token, COOKIE_OPTS);

  const { password_hash, ...safe } = user;
  res.json({ user: safe });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

router.get('/me', requireAuth, (req, res) => {
  const user = getDB()
    .prepare('SELECT id, name, target_calories, target_protein, target_carbs, target_fat, height_cm, age, sex, target_weight, theme FROM users WHERE id = ?')
    .get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json({ user });
});

module.exports = router;
