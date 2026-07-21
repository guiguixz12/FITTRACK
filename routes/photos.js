const express  = require('express');
const multer   = require('multer');
const sharp    = require('sharp');
const path     = require('path');
const fs       = require('fs');
const { getDB }       = require('../db/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const MAX_MB   = 10;
const MAX_SIDE = 1280;
const QUALITY  = 75;

// Keep file in memory so sharp can process it before writing to disk
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

// Multer error handler middleware
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

router.get('/', (req, res) => {
  const photos = getDB()
    .prepare('SELECT * FROM progress_photos WHERE user_id=? ORDER BY date DESC')
    .all(req.user.id);
  res.json({ photos });
});

router.post('/', (req, res, next) => {
  upload.single('photo')(req, res, err => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: 'Data obrigatória' });

  const dir      = path.join(__dirname, '..', 'uploads', String(req.user.id));
  fs.mkdirSync(dir, { recursive: true });

  const filename = `${Date.now()}.jpg`;
  const outPath  = path.join(dir, filename);

  try {
    await sharp(req.file.buffer)
      .rotate()                          // auto-orient from EXIF
      .resize(MAX_SIDE, MAX_SIDE, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: QUALITY })
      .toFile(outPath);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao processar imagem' });
  }

  const storedName = `${req.user.id}/${filename}`;
  const r = getDB()
    .prepare('INSERT INTO progress_photos (user_id, date, filename) VALUES (?,?,?)')
    .run(req.user.id, date, storedName);

  res.json({ id: r.lastInsertRowid, filename: storedName });
});

router.delete('/:id', (req, res) => {
  const db = getDB();
  const photo = db.prepare('SELECT * FROM progress_photos WHERE id=? AND user_id=?').get(req.params.id, req.user.id);
  if (!photo) return res.status(404).json({ error: 'Foto não encontrada' });

  const filepath = path.join(__dirname, '..', 'uploads', photo.filename);
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

  db.prepare('DELETE FROM progress_photos WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
