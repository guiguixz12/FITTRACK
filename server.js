require('dotenv').config();

// Fail fast if JWT_SECRET is missing or too weak — never start with a default
const _secret = process.env.JWT_SECRET;
if (!_secret || _secret.length < 32) {
  console.error('FATAL: JWT_SECRET must be set in environment and be at least 32 characters.');
  console.error('Generate one with: openssl rand -hex 64');
  process.exit(1);
}

const express = require('express');
const cookieParser = require('cookie-parser');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const { initDB } = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure private uploads dir exists (outside public/, never served statically)
fs.mkdirSync(path.join(__dirname, 'private-uploads'), { recursive: true });

initDB();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  // CSP in report-only mode — won't break the app but will log violations
  // Review /csp-report logs before switching to enforce mode
  contentSecurityPolicy: {
    reportOnly: true,
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      styleSrc:       ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:        ["'self'", "https://fonts.gstatic.com"],
      imgSrc:         ["'self'", "data:", "blob:"],
      connectSrc:     ["'self'"],
      workerSrc:      ["'self'"],
      reportUri:      ["/csp-report"],
    },
  },
  crossOriginEmbedderPolicy: false, // relaxed — PWA needs this
}));

// CSP violation reporting endpoint (log only — no action)
app.post('/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
  console.warn('[CSP]', JSON.stringify(req.body));
  res.status(204).end();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// /uploads intentionally NOT served statically — photos require auth via /api/photos/file/*

// ── Rate limiting ─────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  keyGenerator: (req) => `${ipKeyGenerator(req)}:${(req.body?.name || '').toLowerCase()}`,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  skipSuccessfulRequests: true,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de cadastros atingido. Tente novamente em 1 hora.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em breve.' },
});

app.use('/api/auth/login',    loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api',               apiLimiter);

app.use('/api/admin', require('./routes/admin'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/diet', require('./routes/diet'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/workout-templates', require('./routes/workout-templates'));
app.use('/api/diet-templates',   require('./routes/diet-templates'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/users', require('./routes/users'));
app.use('/api/water', require('./routes/water'));
app.use('/api/stats', require('./routes/stats'));

app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/app',   (req, res) => res.sendFile(path.join(__dirname, 'public', 'app.html')));

// /admin requires a valid admin JWT cookie — never served to unauthenticated users
app.get('/admin', (req, res) => {
  const jwt = require('jsonwebtoken');
  const token = req.cookies?.token;
  if (!token) return res.redirect('/login');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!['admin', 'super_admin'].includes(payload.role)) return res.redirect('/login');
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  } catch {
    res.redirect('/login');
  }
});

app.get('/', (req, res) => res.redirect('/login'));

app.use((err, req, res, next) => {
  // Log full error server-side (stack trace, context) — never sent to client
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err);
  if (res.headersSent) return next(err);
  const status = err.status || err.statusCode || 500;
  // Validation/client errors (4xx) keep their message; server errors get generic response
  const message = status < 500 ? (err.message || 'Requisição inválida') : 'Erro interno do servidor';
  res.status(status).json({ error: message });
});

app.listen(PORT, () => console.log(`FitTracker rodando na porta ${PORT}`));
