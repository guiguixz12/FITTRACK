const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db/init');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sendVerificationCode } = require('../utils/mailer');

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
  if (!email)             return res.status(400).json({ error: 'E-mail obrigatório' });

  const trimmedName  = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  if (trimmedName.length < 3)         return res.status(400).json({ error: 'Nome deve ter pelo menos 3 caracteres' });
  if (password.length < 6)            return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))
    return res.status(400).json({ error: 'E-mail inválido' });

  const db = getDB();
  const existing = db.prepare('SELECT id FROM users WHERE name = ?').get(trimmedName);
  if (existing) return res.status(409).json({ error: 'Esse nome de usuário já está em uso' });

  const emailTaken = db.prepare('SELECT id FROM users WHERE email = ?').get(trimmedEmail);
  if (emailTaken) return res.status(409).json({ error: 'Esse e-mail já está cadastrado' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (name, password_hash, email, verified) VALUES (?, ?, ?, 0)'
  ).run(trimmedName, hash, trimmedEmail);

  const user = db.prepare(
    'SELECT id, name, email, target_calories, target_protein, target_carbs, target_fat, height_cm, age, sex, target_weight, theme, plan, token_version FROM users WHERE id = ?'
  ).get(result.lastInsertRowid);

  // Issue and store verification code
  const code      = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  db.prepare(
    'INSERT OR REPLACE INTO email_verifications (user_id, code, expires_at, resend_count, resend_window_start) VALUES (?, ?, ?, 0, datetime("now"))'
  ).run(user.id, code, expiresAt);
  sendVerificationCode(trimmedEmail, code).catch(err => console.error('[MAILER register]', err));

  const token = jwt.sign(
    { id: user.id, name: user.name, tv: user.token_version || 0 },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, COOKIE_OPTS);
  res.status(201).json({ user, emailVerificationRequired: true });
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
  // New columns added in Mudança 1 — fetch separately so missing columns never crash /me
  try {
    const extra = db.prepare('SELECT activity_factor, goal_diff, targets_auto FROM users WHERE id=?').get(req.user.id);
    if (extra) Object.assign(user, extra);
  } catch (_) { /* columns not yet migrated in this env — safe to skip */ }

  const resp = { user };
  if (req.user._impersonatedBy) {
    const admin = db.prepare('SELECT id, name FROM users WHERE id=?').get(req.user._impersonatedBy);
    if (admin) resp.impersonatedBy = { id: admin.id, name: admin.name };
  }
  res.json(resp);
});

router.post('/verify-email', requireAuth, (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Código obrigatório' });

  const db  = getDB();
  const ver = db.prepare('SELECT * FROM email_verifications WHERE user_id=?').get(req.user.id);
  if (!ver) return res.status(400).json({ error: 'Nenhum código pendente' });

  if (new Date() > new Date(ver.expires_at)) {
    return res.status(400).json({ error: 'Código expirado. Solicite um novo.' });
  }
  if (ver.code !== String(code).trim()) {
    return res.status(400).json({ error: 'Código incorreto' });
  }

  db.prepare('UPDATE users SET verified=1 WHERE id=?').run(req.user.id);
  db.prepare('DELETE FROM email_verifications WHERE user_id=?').run(req.user.id);
  res.json({ success: true });
});

router.post('/resend-verification', requireAuth, async (req, res) => {
  const db   = getDB();
  const user = db.prepare('SELECT id, email, verified FROM users WHERE id=?').get(req.user.id);
  if (!user || user.verified) return res.status(400).json({ error: 'Conta já verificada' });
  if (!user.email)            return res.status(400).json({ error: 'Nenhum e-mail cadastrado' });

  const ver = db.prepare('SELECT * FROM email_verifications WHERE user_id=?').get(req.user.id);
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  const windowStart = ver ? new Date(ver.resend_window_start).getTime() : 0;
  const withinWindow = (now - windowStart) < hourMs;
  const resendCount  = withinWindow ? (ver?.resend_count || 0) : 0;

  if (resendCount >= 3) {
    return res.status(429).json({ error: 'Limite de reenvio atingido. Tente novamente em 1 hora.' });
  }

  const code      = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(now + 15 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
  const newWindow = withinWindow
    ? ver.resend_window_start
    : new Date(now).toISOString().slice(0, 19).replace('T', ' ');

  db.prepare(
    'INSERT OR REPLACE INTO email_verifications (user_id, code, expires_at, resend_count, resend_window_start) VALUES (?, ?, ?, ?, ?)'
  ).run(user.id, code, expiresAt, resendCount + 1, newWindow);

  try {
    await sendVerificationCode(user.email, code);
    res.json({ success: true });
  } catch (err) {
    console.error('[MAILER resend]', err);
    res.status(500).json({ error: 'Erro ao enviar e-mail. Tente novamente.' });
  }
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
