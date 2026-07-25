const jwt   = require('jsonwebtoken');
const { getDB } = require('../db/init');

function getSecret() {
  return process.env.JWT_SECRET;
}

function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = jwt.verify(token, getSecret());
    // Token version check: any logout-all increments token_version, invalidating old tokens
    if (payload.tv !== undefined) {
      const row = getDB().prepare('SELECT token_version FROM users WHERE id=?').get(payload.id);
      if (!row || row.token_version !== payload.tv) {
        return res.status(401).json({ error: 'Sessão revogada. Faça login novamente.' });
      }
    }
    req.user = payload;
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

function requireVerified(req, res, next) {
  const row = getDB().prepare('SELECT verified FROM users WHERE id=?').get(req.user.id);
  if (!row?.verified) {
    return res.status(403).json({ error: 'E-mail não verificado. Confirme seu e-mail para acessar.', code: 'EMAIL_NOT_VERIFIED' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, requireSuperAdmin, requireVerified };
