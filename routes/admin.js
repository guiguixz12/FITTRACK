const express = require('express');
const bcrypt  = require('bcryptjs');
const { getDB } = require('../db/init');
const { requireAdmin, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// ── Clients ───────────────────────────────────────────────────────────────────

router.get('/clients', requireAdmin, (req, res) => {
  const db = getDB();
  let clients;
  if (req.user.role === 'super_admin') {
    clients = db.prepare(`
      SELECT u.id, u.name, u.email, u.target_calories, u.height_cm, u.age, u.sex,
             u.admin_id, a.name AS admin_name,
             (SELECT date FROM workouts WHERE user_id=u.id ORDER BY date DESC LIMIT 1) AS last_workout,
             (SELECT COUNT(*) FROM workouts WHERE user_id=u.id) AS workout_count
      FROM users u LEFT JOIN users a ON a.id = u.admin_id
      WHERE u.role = 'user'
      ORDER BY u.name
    `).all();
  } else {
    clients = db.prepare(`
      SELECT u.id, u.name, u.email, u.target_calories, u.height_cm, u.age, u.sex,
             (SELECT date FROM workouts WHERE user_id=u.id ORDER BY date DESC LIMIT 1) AS last_workout,
             (SELECT COUNT(*) FROM workouts WHERE user_id=u.id) AS workout_count
      FROM users u
      WHERE u.role = 'user' AND u.admin_id = ?
      ORDER BY u.name
    `).all(req.user.id);
  }
  res.json({ clients });
});

router.post('/clients', requireAdmin, (req, res) => {
  const { name, password, target_calories, target_protein, target_carbs, target_fat, height_cm, age, sex } = req.body;
  if (!name || !password) return res.status(400).json({ error: 'Nome e senha obrigatórios' });
  if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres' });

  const db = getDB();
  if (db.prepare('SELECT id FROM users WHERE name=?').get(name.trim())) {
    return res.status(409).json({ error: 'Nome de usuário já em uso' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const r = db.prepare(`
    INSERT INTO users (name, password_hash, role, admin_id, target_calories, target_protein, target_carbs, target_fat, height_cm, age, sex)
    VALUES (?, ?, 'user', ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name.trim(), hash, req.user.id,
    target_calories || 2000, target_protein || 150,
    target_carbs || 200, target_fat || 65,
    height_cm || null, age || null, sex || null);

  res.json({ id: r.lastInsertRowid, name: name.trim() });
});

router.delete('/clients/:id', requireAdmin, (req, res) => {
  const db     = getDB();
  const client = db.prepare('SELECT id, admin_id, role FROM users WHERE id=?').get(req.params.id);
  if (!client)               return res.status(404).json({ error: 'Usuário não encontrado' });
  if (client.role !== 'user') return res.status(403).json({ error: 'Não é possível excluir admins por aqui' });
  if (req.user.role === 'admin' && client.admin_id !== req.user.id) {
    return res.status(403).json({ error: 'Este cliente não pertence a você' });
  }
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ── Admins (super_admin only) ─────────────────────────────────────────────────

router.get('/admins', requireSuperAdmin, (req, res) => {
  const admins = getDB().prepare(`
    SELECT u.id, u.name, u.email,
           COUNT(c.id) AS client_count
    FROM users u LEFT JOIN users c ON c.admin_id = u.id
    WHERE u.role = 'admin'
    GROUP BY u.id ORDER BY u.name
  `).all();
  res.json({ admins });
});

router.post('/admins', requireSuperAdmin, (req, res) => {
  const { name, password, email } = req.body;
  if (!name || !password) return res.status(400).json({ error: 'Nome e senha obrigatórios' });
  if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres' });

  const db = getDB();
  if (db.prepare('SELECT id FROM users WHERE name=?').get(name.trim())) {
    return res.status(409).json({ error: 'Nome de usuário já em uso' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const r = db.prepare(`
    INSERT INTO users (name, password_hash, email, role)
    VALUES (?, ?, ?, 'admin')
  `).run(name.trim(), hash, email?.trim().toLowerCase() || null);

  res.json({ id: r.lastInsertRowid, name: name.trim() });
});

router.delete('/admins/:id', requireSuperAdmin, (req, res) => {
  const db    = getDB();
  const admin = db.prepare('SELECT id, role FROM users WHERE id=?').get(req.params.id);
  if (!admin)              return res.status(404).json({ error: 'Admin não encontrado' });
  if (admin.role !== 'admin') return res.status(403).json({ error: 'Usuário não é admin' });

  db.prepare('UPDATE users SET admin_id=NULL WHERE admin_id=?').run(req.params.id);
  db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
