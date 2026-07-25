const jwt   = require('jsonwebtoken');
const { getDB } = require('../db/init');

const SECRET = () => process.env.JWT_SECRET || 'dev_secret_change_me';

function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, SECRET());
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    const role = req.user.role || getDB().prepare('SELECT role FROM users WHERE id=?').get(req.user.id)?.role;
    req.user.role = role || 'user';
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }
    next();
  });
}

function requireSuperAdmin(req, res, next) {
  requireAuth(req, res, () => {
    const role = req.user.role || getDB().prepare('SELECT role FROM users WHERE id=?').get(req.user.id)?.role;
    req.user.role = role || 'user';
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Acesso restrito ao super administrador' });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin, requireSuperAdmin };
