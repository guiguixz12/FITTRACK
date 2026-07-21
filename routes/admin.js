const express = require('express');
const { getDB } = require('../db/init');

const router = express.Router();

// Protect with JWT_SECRET as bearer token
router.use((req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '') || req.query.token;
  if (!token || token !== (process.env.JWT_SECRET || 'dev_secret_change_me')) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  next();
});

// POST /api/admin/seed-dietas
// Seeds weekly diet templates for Guilherme (50) and Ana (51)
router.post('/seed-dietas', (req, res) => {
  const db = getDB();

  const f = (name, qty, cal, prot, carb, fat, meal, order) =>
    ({ name, quantity_g: qty, calories: cal, protein: prot, carbs: carb, fat, meal, food_order: order });

  const GUILHERME = 50;
  const ANA       = 51;

  const dietas = [
    // ── GUILHERME ────────────────────────────────────────────────────────────
    { userId: GUILHERME, dow: 1, name: 'Segunda (treino)', foods: [
      f('Aveia (flocos)',            60,  233, 10.2, 39.6,  4.2, 'cafe_manha', 0),
      f('Queijo fresco batido',     250,  250, 17.5, 15.0, 10.0, 'cafe_manha', 1),
      f('Banana',                   120,  118,  1.6, 31.0,  0.1, 'cafe_manha', 2),
      f('Canela',                     2,    5,  0.1,  1.3,  0.0, 'cafe_manha', 3),
      f('Frango grelhado',          180,  297, 55.8,  0.0,  6.5, 'almoco', 0),
      f('Arroz branco (80g cru)',   240,  307,  6.2, 68.0,  0.7, 'almoco', 1),
      f('Brócolis',                 150,   51,  4.2, 10.5,  0.6, 'almoco', 2),
      f('Azeite (fio)',              14,  124,  0.0,  0.0, 14.0, 'almoco', 3),
      f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde', 0),
      f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_tarde', 2),
      f('Tortilha de 3 ovos',       180,  279, 23.4,  3.3, 19.8, 'janta', 0),
      f('Batata cozida',            200,  174,  3.8, 40.0,  0.2, 'janta', 1),
      f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'janta', 2),
    ]},
    { userId: GUILHERME, dow: 2, name: 'Terça (treino)', foods: [
      f('Ovos mexidos (3)',          180,  279, 21.0,  3.0, 20.0, 'cafe_manha', 0),
      f('Pão integral (2 fatias)',    60,  138,  7.2, 24.0,  2.0, 'cafe_manha', 1),
      f('Tomate',                   100,   18,  0.9,  3.9,  0.2, 'cafe_manha', 2),
      f('Carne moída magra',        180,  279, 39.6,  0.0, 12.6, 'almoco', 0),
      f('Batata assada',            300,  261,  5.7, 60.0,  0.3, 'almoco', 1),
      f('Vagem',                    150,   47,  2.7, 10.5,  0.2, 'almoco', 2),
      f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde', 0),
      f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_tarde', 2),
      f('Nozes',                     30,  196,  4.6,  4.1, 19.6, 'cafe_tarde', 3),
      f('Grão-de-bico (1 lata)',    240,  394, 21.0, 65.0,  6.2, 'janta', 0),
      f('Atum (2 latas)',            170,  224, 49.3,  0.0,  1.7, 'janta', 1),
      f('Azeite (fio)',               14,  124,  0.0,  0.0, 14.0, 'janta', 2),
    ]},
    { userId: GUILHERME, dow: 3, name: 'Quarta (descanso)', foods: [
      f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_manha', 0),
      f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_manha', 1),
      f('Aveia (flocos)',             40,  156,  6.8, 26.4,  2.8, 'cafe_manha', 2),
      f('Maçã',                     150,   84,  0.5, 22.5,  0.3, 'cafe_manha', 3),
      f('Frango grelhado',          180,  297, 55.8,  0.0,  6.5, 'almoco', 0),
      f('Massa integral (70g cru)', 210,  332, 12.2, 65.1,  1.9, 'almoco', 1),
      f('Verduras refogadas',       150,   38,  3.0,  7.5,  0.5, 'almoco', 2),
      f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde', 0),
      f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Bolachas de arroz (3)',      30,  117,  2.0, 25.5,  0.9, 'cafe_tarde', 2),
      f('Ovos mexidos (3)',          180,  279, 21.0,  3.0, 20.0, 'janta', 0),
      f('Peito de peru',            100,  107, 21.0,  1.3,  2.1, 'janta', 1),
      f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'janta', 2),
    ]},
    { userId: GUILHERME, dow: 4, name: 'Quinta (treino)', foods: [
      f('Torrada integral (2)',       50,  170,  5.0, 30.0,  3.0, 'cafe_manha', 0),
      f('Atum (1 lata)',              85,  112, 24.7,  0.0,  0.9, 'cafe_manha', 1),
      f('Ovo cozido (1)',             60,   93,  7.8,  0.7,  6.6, 'cafe_manha', 2),
      f('Carne moída magra',         180,  279, 39.6,  0.0, 12.6, 'almoco', 0),
      f('Arroz branco (80g cru)',    240,  307,  6.2, 68.0,  0.7, 'almoco', 1),
      f('Espinafre',                 150,   35,  4.4,  5.4,  0.6, 'almoco', 2),
      f('Whey protein (1 scoop)',     30,  120, 24.0,  3.0,  2.0, 'cafe_tarde', 0),
      f('Creatina',                    5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Queijo fresco batido',      150,  150, 10.5,  9.0,  6.0, 'cafe_tarde', 2),
      f('Banana',                    120,  118,  1.6, 31.0,  0.1, 'cafe_tarde', 3),
      f('Frango desfiado',           150,  248, 46.5,  0.0,  5.4, 'janta', 0),
      f('Wrap integral (2)',          120,  380, 10.0, 60.0, 10.0, 'janta', 1),
      f('Pimentões',                 150,   47,  1.5, 10.5,  0.5, 'janta', 2),
    ]},
    { userId: GUILHERME, dow: 5, name: 'Sexta (treino)', foods: [
      f('Aveia (flocos)',             60,  233, 10.2, 39.6,  4.2, 'cafe_manha', 0),
      f('Whey protein (1 scoop)',     30,  120, 24.0,  3.0,  2.0, 'cafe_manha', 1),
      f('Fruta',                     150,   80,  0.8, 20.0,  0.2, 'cafe_manha', 2),
      f('Lombo de porco',            180,  414, 45.0,  0.0, 25.2, 'almoco', 0),
      f('Batata cozida',             300,  261,  5.7, 60.0,  0.3, 'almoco', 1),
      f('Salada verde',              100,   20,  1.5,  3.0,  0.3, 'almoco', 2),
      f('Creatina',                    5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 0),
      f('Ovos cozidos (2)',           120,  186, 15.6,  2.2, 13.2, 'cafe_tarde', 1),
      f('Fruta',                     150,   80,  0.8, 20.0,  0.2, 'cafe_tarde', 2),
      f('Wrap integral (1)',           60,  190,  5.0, 30.0,  5.0, 'janta', 0),
      f('Tomate',                    100,   18,  0.9,  3.9,  0.2, 'janta', 1),
      f('Atum (1 lata)',               85,  112, 24.7,  0.0,  0.9, 'janta', 2),
      f('Queijo light',               50,  100, 10.0,  3.0,  5.0, 'janta', 3),
    ]},
    { userId: GUILHERME, dow: 6, name: 'Sábado (descanso)', foods: [
      f('Aveia (flocos)',             60,  233, 10.2, 39.6,  4.2, 'cafe_manha', 0),
      f('Ovos (2)',                  120,  186, 15.6,  2.2, 13.2, 'cafe_manha', 1),
      f('Banana',                    120,  118,  1.6, 31.0,  0.1, 'cafe_manha', 2),
      f('Refeição livre (moderada)',    0,  700, 35.0, 80.0, 25.0, 'almoco', 0),
      f('Whey protein (1 scoop)',     30,  120, 24.0,  3.0,  2.0, 'cafe_tarde', 0),
      f('Creatina',                    5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Frango grelhado',           180,  297, 55.8,  0.0,  6.5, 'janta', 0),
      f('Verduras refogadas',        200,   50,  4.0, 10.0,  0.7, 'janta', 1),
    ]},
    { userId: GUILHERME, dow: 0, name: 'Domingo (descanso)', foods: [
      f('Ovos (2)',                  120,  186, 15.6,  2.2, 13.2, 'cafe_manha', 0),
      f('Pão integral (1 fatia)',     30,   69,  3.6, 12.0,  1.0, 'cafe_manha', 1),
      f('Iogurte grego natural',     200,  118, 20.0,  7.2,  0.8, 'cafe_manha', 2),
      f('Frango assado (sem pele)',  180,  297, 55.8,  0.0,  6.5, 'almoco', 0),
      f('Arroz branco (80g cru)',    240,  307,  6.2, 68.0,  0.7, 'almoco', 1),
      f('Salada verde',              100,   20,  1.5,  3.0,  0.3, 'almoco', 2),
      f('Creatina',                    5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 0),
      f('Queijo fresco batido',      150,  150, 10.5,  9.0,  6.0, 'cafe_tarde', 1),
      f('Fruta',                     150,   80,  0.8, 20.0,  0.2, 'cafe_tarde', 2),
      f('Creme de verduras',         300,   80,  3.0, 15.0,  1.0, 'janta', 0),
      f('Atum (2 latas)',            170,  224, 49.3,  0.0,  1.7, 'janta', 1),
      f('Pão integral (1 fatia)',     30,   69,  3.6, 12.0,  1.0, 'janta', 2),
    ]},

    // ── ANA ──────────────────────────────────────────────────────────────────
    { userId: ANA, dow: 1, name: 'Segunda (treino)', foods: [
      f('Aveia (flocos)',             40,  156,  6.8, 26.4,  2.8, 'cafe_manha', 0),
      f('Queijo fresco batido',      200,  200, 14.0, 12.0,  8.0, 'cafe_manha', 1),
      f('Banana (½)',                 60,   59,  0.8, 15.5,  0.1, 'cafe_manha', 2),
      f('Canela',                      2,    5,  0.1,  1.3,  0.0, 'cafe_manha', 3),
      f('Frango grelhado',           130,  215, 40.3,  0.0,  4.7, 'almoco', 0),
      f('Arroz branco (60g cru)',    180,  230,  4.7, 51.0,  0.5, 'almoco', 1),
      f('Brócolis',                  150,   51,  4.2, 10.5,  0.6, 'almoco', 2),
      f('Azeite (fio)',               14,  124,  0.0,  0.0, 14.0, 'almoco', 3),
      f('Whey protein (1 scoop)',     30,  120, 24.0,  3.0,  2.0, 'cafe_tarde', 0),
      f('Creatina',                    5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Fruta',                     150,   80,  0.8, 20.0,  0.2, 'cafe_tarde', 2),
      f('Tortilha de 2 ovos',        120,  186, 15.6,  2.2, 13.2, 'janta', 0),
      f('Batata cozida',             150,  131,  2.9, 30.0,  0.2, 'janta', 1),
      f('Salada verde',              100,   20,  1.5,  3.0,  0.3, 'janta', 2),
    ]},
    { userId: ANA, dow: 2, name: 'Terça (treino)', foods: [
      f('Ovos mexidos (2)',          120,  186, 14.0,  2.0, 13.4, 'cafe_manha', 0),
      f('Pão integral (1 fatia)',     30,   69,  3.6, 12.0,  1.0, 'cafe_manha', 1),
      f('Tomate',                    100,   18,  0.9,  3.9,  0.2, 'cafe_manha', 2),
      f('Carne moída magra',         130,  202, 28.6,  0.0,  9.1, 'almoco', 0),
      f('Batata assada',             200,  174,  3.8, 40.0,  0.2, 'almoco', 1),
      f('Vagem',                     150,   47,  2.7, 10.5,  0.2, 'almoco', 2),
      f('Creatina',                    5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 0),
      f('Iogurte grego natural',     200,  118, 20.0,  7.2,  0.8, 'cafe_tarde', 1),
      f('Nozes',                      20,  131,  3.0,  2.7, 13.0, 'cafe_tarde', 2),
      f('Grão-de-bico (½ lata)',     120,  197, 10.5, 32.5,  3.1, 'janta', 0),
      f('Atum (1,5 latas)',          128,  169, 37.2,  0.0,  1.3, 'janta', 1),
      f('Azeite (fio)',               14,  124,  0.0,  0.0, 14.0, 'janta', 2),
    ]},
    { userId: ANA, dow: 3, name: 'Quarta (descanso)', foods: [
      f('Iogurte grego natural',     200,  118, 20.0,  7.2,  0.8, 'cafe_manha', 0),
      f('Iogurte grego natural',     200,  118, 20.0,  7.2,  0.8, 'cafe_manha', 1),
      f('Aveia (flocos)',             30,  117,  5.1, 19.8,  2.1, 'cafe_manha', 2),
      f('Maçã',                      150,   84,  0.5, 22.5,  0.3, 'cafe_manha', 3),
      f('Frango grelhado',           130,  215, 40.3,  0.0,  4.7, 'almoco', 0),
      f('Massa integral (50g cru)',  150,  237,  8.7, 46.5,  1.4, 'almoco', 1),
      f('Verduras refogadas',        150,   38,  3.0,  7.5,  0.5, 'almoco', 2),
      f('Whey protein (1 scoop)',     30,  120, 24.0,  3.0,  2.0, 'cafe_tarde', 0),
      f('Creatina',                    5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Bolachas de arroz (2)',      20,   78,  1.3, 17.0,  0.6, 'cafe_tarde', 2),
      f('Ovos mexidos (2)',          120,  186, 14.0,  2.0, 13.4, 'janta', 0),
      f('Peito de peru',              80,   86, 16.8,  1.0,  1.7, 'janta', 1),
      f('Salada verde',              100,   20,  1.5,  3.0,  0.3, 'janta', 2),
    ]},
    { userId: ANA, dow: 4, name: 'Quinta (treino)', foods: [
      f('Torrada integral (1)',       25,   85,  2.5, 15.0,  1.5, 'cafe_manha', 0),
      f('Atum (1 lata)',              85,  112, 24.7,  0.0,  0.9, 'cafe_manha', 1),
      f('Ovo cozido (1)',             60,   93,  7.8,  0.7,  6.6, 'cafe_manha', 2),
      f('Carne moída magra',         130,  202, 28.6,  0.0,  9.1, 'almoco', 0),
      f('Arroz branco (60g cru)',    180,  230,  4.7, 51.0,  0.5, 'almoco', 1),
      f('Espinafre',                 150,   35,  4.4,  5.4,  0.6, 'almoco', 2),
      f('Whey protein (1 scoop)',     30,  120, 24.0,  3.0,  2.0, 'cafe_tarde', 0),
      f('Creatina',                    5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Queijo fresco batido',      100,  100,  7.0,  6.0,  4.0, 'cafe_tarde', 2),
      f('Banana (½)',                 60,   59,  0.8, 15.5,  0.1, 'cafe_tarde', 3),
      f('Frango desfiado',           120,  198, 37.2,  0.0,  4.3, 'janta', 0),
      f('Wrap integral (1,5)',        90,  285,  7.5, 45.0,  7.5, 'janta', 1),
      f('Pimentões',                 150,   47,  1.5, 10.5,  0.5, 'janta', 2),
    ]},
    { userId: ANA, dow: 5, name: 'Sexta (treino)', foods: [
      f('Aveia (flocos)',             40,  156,  6.8, 26.4,  2.8, 'cafe_manha', 0),
      f('Whey protein (1 scoop)',     30,  120, 24.0,  3.0,  2.0, 'cafe_manha', 1),
      f('Fruta',                     150,   80,  0.8, 20.0,  0.2, 'cafe_manha', 2),
      f('Lombo de porco',            140,  322, 35.0,  0.0, 19.6, 'almoco', 0),
      f('Batata cozida',             200,  174,  3.8, 40.0,  0.2, 'almoco', 1),
      f('Salada verde',              100,   20,  1.5,  3.0,  0.3, 'almoco', 2),
      f('Creatina',                    5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 0),
      f('Ovos cozidos (2)',          120,  186, 15.6,  2.2, 13.2, 'cafe_tarde', 1),
      f('Fruta',                     150,   80,  0.8, 20.0,  0.2, 'cafe_tarde', 2),
      f('Wrap integral (1)',          60,  190,  5.0, 30.0,  5.0, 'janta', 0),
      f('Tomate',                    100,   18,  0.9,  3.9,  0.2, 'janta', 1),
      f('Atum (1 lata)',              85,  112, 24.7,  0.0,  0.9, 'janta', 2),
      f('Queijo light',              30,   60,  6.0,  2.0,  3.0, 'janta', 3),
    ]},
    { userId: ANA, dow: 6, name: 'Sábado (descanso)', foods: [
      f('Aveia (flocos)',             40,  156,  6.8, 26.4,  2.8, 'cafe_manha', 0),
      f('Ovos (2)',                  120,  186, 15.6,  2.2, 13.2, 'cafe_manha', 1),
      f('Banana (½)',                 60,   59,  0.8, 15.5,  0.1, 'cafe_manha', 2),
      f('Refeição livre (moderada)',   0,  550, 25.0, 60.0, 20.0, 'almoco', 0),
      f('Whey / iogurte grego',      200,  118, 20.0,  7.2,  0.8, 'cafe_tarde', 0),
      f('Creatina',                    5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Frango grelhado',           140,  231, 43.4,  0.0,  5.0, 'janta', 0),
      f('Verduras refogadas',        200,   50,  4.0, 10.0,  0.7, 'janta', 1),
    ]},
    { userId: ANA, dow: 0, name: 'Domingo (descanso)', foods: [
      f('Ovos (2)',                  120,  186, 15.6,  2.2, 13.2, 'cafe_manha', 0),
      f('Pão integral (1 fatia)',     30,   69,  3.6, 12.0,  1.0, 'cafe_manha', 1),
      f('Iogurte grego natural',     200,  118, 20.0,  7.2,  0.8, 'cafe_manha', 2),
      f('Frango assado (sem pele)',  140,  231, 43.4,  0.0,  5.0, 'almoco', 0),
      f('Arroz branco (60g cru)',    180,  230,  4.7, 51.0,  0.5, 'almoco', 1),
      f('Salada verde',              100,   20,  1.5,  3.0,  0.3, 'almoco', 2),
      f('Creatina',                    5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 0),
      f('Queijo fresco batido',      100,  100,  7.0,  6.0,  4.0, 'cafe_tarde', 1),
      f('Fruta',                     150,   80,  0.8, 20.0,  0.2, 'cafe_tarde', 2),
      f('Creme de verduras',         300,   80,  3.0, 15.0,  1.0, 'janta', 0),
      f('Atum (1,5 latas)',          128,  169, 37.2,  0.0,  1.3, 'janta', 1),
      f('Pão integral (1 fatia)',     30,   69,  3.6, 12.0,  1.0, 'janta', 2),
    ]},
  ];

  const delTplFoods = db.prepare(`
    DELETE FROM diet_template_foods WHERE template_id IN
    (SELECT id FROM diet_templates WHERE user_id = ?)
  `);
  const delTpl  = db.prepare('DELETE FROM diet_templates WHERE user_id = ?');
  const insTpl  = db.prepare('INSERT INTO diet_templates (user_id, day_of_week, name) VALUES (?,?,?)');
  const insFood = db.prepare(`
    INSERT INTO diet_template_foods
      (template_id, name, quantity_g, calories, protein, carbs, fat, food_order, meal)
    VALUES (?,?,?,?,?,?,?,?,?)
  `);

  let totalTpl = 0, totalFood = 0;

  db.transaction(() => {
    for (const uid of [GUILHERME, ANA]) {
      delTplFoods.run(uid);
      delTpl.run(uid);
    }
    for (const day of dietas) {
      const { lastInsertRowid: tplId } = insTpl.run(day.userId, day.dow, day.name);
      totalTpl++;
      day.foods.forEach(food => {
        insFood.run(tplId, food.name, food.quantity_g,
          Math.round(food.calories),
          Math.round(food.protein * 10) / 10,
          Math.round(food.carbs   * 10) / 10,
          Math.round(food.fat     * 10) / 10,
          food.food_order, food.meal);
        totalFood++;
      });
    }
  })();

  res.json({ ok: true, templates: totalTpl, foods: totalFood });
});

module.exports = router;
