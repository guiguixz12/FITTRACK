const express    = require('express');
const { getDB }  = require('../db/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const db = getDB();
  const templates = db.prepare(
    'SELECT * FROM diet_templates WHERE user_id = ? ORDER BY day_of_week'
  ).all(req.user.id);

  for (const t of templates) {
    t.foods = db.prepare(
      'SELECT * FROM diet_template_foods WHERE template_id = ? ORDER BY food_order'
    ).all(t.id);
  }

  res.json({ templates });
});

router.put('/:dow', (req, res) => {
  const dow = parseInt(req.params.dow);
  if (dow < 0 || dow > 6) return res.status(400).json({ error: 'Dia inválido (0–6)' });

  const { name, foods = [] } = req.body;
  const db = getDB();

  const upsert = db.transaction(() => {
    db.prepare(`
      INSERT INTO diet_templates (user_id, day_of_week, name)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, day_of_week) DO UPDATE SET name = excluded.name
    `).run(req.user.id, dow, name || '');

    const tpl = db.prepare(
      'SELECT id FROM diet_templates WHERE user_id = ? AND day_of_week = ?'
    ).get(req.user.id, dow);

    db.prepare('DELETE FROM diet_template_foods WHERE template_id = ?').run(tpl.id);

    const ins = db.prepare(`
      INSERT INTO diet_template_foods
        (template_id, meal, name, quantity_g, calories, protein, carbs, fat, food_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    foods.forEach((f, i) => {
      ins.run(tpl.id, f.meal || 'almoco', f.name,
              f.quantity_g || null, f.calories || 0,
              f.protein || 0, f.carbs || 0, f.fat || 0, i + 1);
    });

    return tpl.id;
  });

  res.json({ id: upsert() });
});

router.delete('/:dow', (req, res) => {
  const dow = parseInt(req.params.dow);
  const db  = getDB();
  const tpl = db.prepare(
    'SELECT id FROM diet_templates WHERE user_id = ? AND day_of_week = ?'
  ).get(req.user.id, dow);
  if (tpl) db.prepare('DELETE FROM diet_templates WHERE id = ?').run(tpl.id);
  res.json({ success: true });
});

module.exports = router;
