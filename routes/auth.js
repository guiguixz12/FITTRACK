const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db/init');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

router.post('/register', async (req, res) => {
  // Honeypot: bots fill hidden fields; real users leave them blank
  if (req.body.website || req.body.phone_number) {
    return res.status(400).json({ error: 'Requisição inválida' });
  }

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
    { id: user.id, name: user.name, tv: user.token_version || 0 },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );


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
    { id: user.id, name: user.name, role: user.role || 'user', tv: user.token_version || 0 },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );


  res.cookie('token', token, COOKIE_OPTS);

  const { password_hash, ...safe } = user;
  res.json({ user: safe });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

router.get('/me', requireAuth, (req, res) => {
  const db   = getDB();
  const user = db
    .prepare('SELECT id, name, email, target_calories, target_protein, target_carbs, target_fat, height_cm, age, sex, target_weight, theme, plan, role FROM users WHERE id = ?')
    .get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  const resp = { user };
  if (req.user._impersonatedBy) {
    const admin = db.prepare('SELECT id, name FROM users WHERE id=?').get(req.user._impersonatedBy);
    if (admin) resp.impersonatedBy = { id: admin.id, name: admin.name };
  }
  res.json(resp);
});

router.post('/logout-all', requireAuth, (req, res) => {
  getDB().prepare('UPDATE users SET token_version = token_version + 1 WHERE id=?').run(req.user.id);
  res.clearCookie('token');
  res.clearCookie('adminToken');
  res.json({ success: true });
});

router.post('/impersonate/:clientId', requireAdmin, (req, res) => {
  const db     = getDB();
  const client = db.prepare('SELECT id, name, role, admin_id FROM users WHERE id=?').get(req.params.clientId);
  if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });
  if (client.role !== 'user') return res.status(403).json({ error: 'Só é possível visualizar contas de usuário' });
  if (req.user.role === 'admin' && client.admin_id !== req.user.id) {
    return res.status(403).json({ error: 'Este cliente não pertence a você' });
  }

  const clientRow = db.prepare('SELECT token_version FROM users WHERE id=?').get(client.id);
  const clientToken = jwt.sign(
    { id: client.id, name: client.name, role: 'user', _impersonatedBy: req.user.id, tv: clientRow?.token_version || 0 },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );


  res.cookie('adminToken', req.cookies.token, COOKIE_OPTS);
  res.cookie('token', clientToken, COOKIE_OPTS);
  res.json({ success: true });
});

router.post('/stop-impersonate', requireAuth, (req, res) => {
  const adminToken = req.cookies?.adminToken;
  if (!adminToken) return res.status(400).json({ error: 'Não está em modo de visualização' });

  // Verify the adminToken is a valid JWT for an admin — not just any cookie value
  let payload;
  try {
    payload = jwt.verify(adminToken, process.env.JWT_SECRET);
  } catch {
    res.clearCookie('adminToken');
    return res.status(400).json({ error: 'Token de administrador inválido' });
  }
  if (!['admin', 'super_admin'].includes(payload.role)) {
    res.clearCookie('adminToken');
    return res.status(403).json({ error: 'Token de administrador inválido' });
  }

  res.cookie('token', adminToken, COOKIE_OPTS);
  res.clearCookie('adminToken');
  res.json({ success: true });
});

module.exports = router;
