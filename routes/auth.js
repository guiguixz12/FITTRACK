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

router.post('/register', async (req, res) => {
  const { name, password, email } = req.body;
  if (!name || !password) return res.status(400).json({ error: 'Nome e senha obrigatórios' });

  const trimmedName  = name.trim();
  const trimmedEmail = email ? email.trim().toLowerCase() : null;
  if (trimmedName.length < 3) return res.status(400).json({ error: 'Nome deve ter pelo menos 3 caracteres' });
  if (password.length < 6)    return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });

  const db = getDB();
  const existing = db.prepare('SELECT id FROM users WHERE name = ?').get(trimmedName);
  if (existing) return res.status(409).json({ error: 'Esse nome de usuário já está em uso' });

  if (trimmedEmail) {
    const emailTaken = db.prepare('SELECT id FROM users WHERE email = ?').get(trimmedEmail);
    if (emailTaken) return res.status(409).json({ error: 'Esse e-mail já está cadastrado' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (name, password_hash, email) VALUES (?, ?, ?)'
  ).run(trimmedName, hash, trimmedEmail);

  const user = db.prepare(
    'SELECT id, name, email, target_calories, target_protein, target_carbs, target_fat, height_cm, age, sex, target_weight, theme, plan FROM users WHERE id = ?'
  ).get(result.lastInsertRowid);

  const token = jwt.sign(
    { id: user.id, name: user.name },
    process.env.JWT_SECRET || 'dev_secret_change_me',
    { expiresIn: '30d' }
  );

  if (process.env.NODE_ENV === 'production') COOKIE_OPTS.secure = true;
  res.cookie('token', token, COOKIE_OPTS);
  res.status(201).json({ user });
});

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
    .prepare('SELECT id, name, email, target_calories, target_protein, target_carbs, target_fat, height_cm, age, sex, target_weight, theme, plan FROM users WHERE id = ?')
    .get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json({ user });
});

module.exports = router;
