const express  = require('express');
const multer   = require('multer');
const sharp    = require('sharp');
const path     = require('path');
const fs       = require('fs');
const { getDB }       = require('../db/init');
const { requireAuth, requireVerified } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);
router.use(requireVerified);

const MAX_MB      = 10;
const MAX_SIDE    = 1280;
const QUALITY     = 75;
const UPLOADS_DIR = path.join(__dirname, '..', 'private-uploads');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_MB * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (/^image\/(jpeg|jpg|png|gif|webp)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WEBP)'), { code: 'INVALID_TYPE' }));
    }
  }
});

function handleMulterError(err, req, res, next) {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ error: `Arquivo muito grande. Limite: ${MAX_MB}MB` });
    if (err.code === 'INVALID_TYPE')
      return res.status(400).json({ error: err.message });
    return res.status(400).json({ error: err.message });
  }
  next();
}

// ── List photos ───────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const photos = getDB()
    .prepare('SELECT * FROM progress_photos WHERE user_id=? ORDER BY date DESC')
    .all(req.user.id);
  res.json({ photos });
});

// ── Serve a photo file — authenticated, ownership-verified, traversal-safe ───
router.get('/file/:userId/:filename', (req, res) => {
  const { userId, filename } = req.params;

  // Reject path traversal: block slashes and ".." sequences; single dots (extensions) are fine
  if (!/^\d+$/.test(userId) || /[/\\]|\.\./.test(filename)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // The stored filename in DB is "<userId>/<filename>", e.g. "3/1234567890.jpg"
  const storedName = `${userId}/${filename}`;

  // Verify via DB that this photo belongs to the authenticated user
  const photo = getDB()
    .prepare('SELECT id FROM progress_photos WHERE filename=? AND user_id=?')
    .get(storedName, req.user.id);

  if (!photo) return res.status(403).json({ error: 'Acesso negado' });

  // Build absolute path and confirm it stays inside UPLOADS_DIR
  const filePath = path.resolve(UPLOADS_DIR, String(userId), filename);
  if (!filePath.startsWith(UPLOADS_DIR + path.sep)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  res.sendFile(filePath, err => {
    if (err && !res.headersSent) res.status(404).json({ error: 'Arquivo não encontrado' });
  });
});

// ── Upload a photo ────────────────────────────────────────────────────────────
router.post('/', (req, res, next) => {
  upload.single('photo')(req, res, err => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: 'Data obrigatória' });

  const dir = path.join(UPLOADS_DIR, String(req.user.id));
  fs.mkdirSync(dir, { recursive: true });

  const filename = `${Date.now()}.jpg`;
  const outPath  = path.join(dir, filename);

  try {
    await sharp(req.file.buffer)
      .rotate()
      .resize(MAX_SIDE, MAX_SIDE, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY })
      .toFile(outPath);
  } catch {
    return res.status(500).json({ error: 'Erro ao processar imagem' });
  }

  const storedName = `${req.user.id}/${filename}`;
  const r = getDB()
    .prepare('INSERT INTO progress_photos (user_id, date, filename) VALUES (?,?,?)')
    .run(req.user.id, date, storedName);

  res.json({ id: r.lastInsertRowid, filename: storedName });
});

// ── Delete a photo ────────────────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const db    = getDB();
  const photo = db.prepare('SELECT * FROM progress_photos WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!photo) return res.status(404).json({ error: 'Foto não encontrada' });

  const filepath = path.join(UPLOADS_DIR, photo.filename);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

  db.prepare('DELETE FROM progress_photos WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

module.exports = router;
