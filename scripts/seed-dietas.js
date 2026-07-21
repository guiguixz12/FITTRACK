/**
 * Seed das dietas semanais para Guilherme (id:50) e Ana (id:51)
 * Macros estimados por porção (não por 100g)
 * Executar: node scripts/seed-dietas.js
 */
const db = require('better-sqlite3')('./data/fit.sqlite');

const GUILHERME = 50;
const ANA       = 51;

// ── helpers ────────────────────────────────────────────────────────────────
const f = (name, qty, cal, prot, carb, fat, meal) =>
  ({ name, quantity_g: qty, calories: cal, protein: prot, carbs: carb, fat, meal, food_order: 0 });

// ── dados ──────────────────────────────────────────────────────────────────
// dow: 0=Dom 1=Seg 2=Ter 3=Qua 4=Qui 5=Sex 6=Sab

const dietas = [
  // ════════════════════════════════════════════════
  //  GUILHERME  ~2.100 kcal · 150-160g proteína
  // ════════════════════════════════════════════════
  { userId: GUILHERME, dow: 1, name: 'Segunda (treino)', foods: [
    f('Aveia (flocos)',            60,  233, 10.2, 39.6,  4.2, 'cafe_manha'),
    f('Queijo fresco batido',     250,  250, 17.5, 15.0, 10.0, 'cafe_manha'),
    f('Banana',                   120,  118,  1.6, 31.0,  0.1, 'cafe_manha'),
    f('Canela',                     2,    5,  0.1,  1.3,  0.0, 'cafe_manha'),
    f('Frango grelhado',          180,  297, 55.8,  0.0,  6.5, 'almoco'),
    f('Arroz branco (80g cru)',   240,  307,  6.2, 68.0,  0.7, 'almoco'),
    f('Brócolis',                 150,   51,  4.2, 10.5,  0.6, 'almoco'),
    f('Azeite (fio)',              14,  124,  0.0,  0.0, 14.0, 'almoco'),
    f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde'),
    f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde'),
    f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_tarde'),
    f('Tortilha de 3 ovos',       180,  279, 23.4,  3.3, 19.8, 'janta'),
    f('Batata cozida',            200,  174,  3.8, 40.0,  0.2, 'janta'),
    f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'janta'),
  ]},
  { userId: GUILHERME, dow: 2, name: 'Terça (treino)', foods: [
    f('Ovos mexidos (3)',          180,  279, 21.0,  3.0, 20.0, 'cafe_manha'),
    f('Pão integral (2 fatias)',   60,  138,  7.2, 24.0,  2.0, 'cafe_manha'),
    f('Tomate',                   100,   18,  0.9,  3.9,  0.2, 'cafe_manha'),
    f('Carne moída magra',        180,  279, 39.6,  0.0, 12.6, 'almoco'),
    f('Batata assada',            300,  261,  5.7, 60.0,  0.3, 'almoco'),
    f('Vagem',                    150,   47,  2.7, 10.5,  0.2, 'almoco'),
    f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde'),
    f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde'),
    f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_tarde'),
    f('Nozes',                     30,  196,  4.6,  4.1, 19.6, 'cafe_tarde'),
    f('Grão-de-bico (1 lata)',    240,  394, 21.0, 65.0,  6.2, 'janta'),
    f('Atum (2 latas)',            170,  224, 49.3,  0.0,  1.7, 'janta'),
    f('Azeite (fio)',              14,  124,  0.0,  0.0, 14.0, 'janta'),
  ]},
  { userId: GUILHERME, dow: 3, name: 'Quarta (descanso)', foods: [
    f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_manha'),
    f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_manha'),
    f('Aveia (flocos)',            40,  156,  6.8, 26.4,  2.8, 'cafe_manha'),
    f('Maçã',                     150,   84,  0.5, 22.5,  0.3, 'cafe_manha'),
    f('Frango grelhado',          180,  297, 55.8,  0.0,  6.5, 'almoco'),
    f('Massa integral (70g cru)', 210,  332, 12.2, 65.1,  1.9, 'almoco'),
    f('Verduras refogadas',       150,   38,  3.0,  7.5,  0.5, 'almoco'),
    f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde'),
    f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde'),
    f('Bolachas de arroz (3)',     30,  117,  2.0, 25.5,  0.9, 'cafe_tarde'),
    f('Ovos mexidos (3)',          180,  279, 21.0,  3.0, 20.0, 'janta'),
    f('Peito de peru',            100,  107, 21.0,  1.3,  2.1, 'janta'),
    f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'janta'),
  ]},
  { userId: GUILHERME, dow: 4, name: 'Quinta (treino)', foods: [
    f('Torrada integral (2)',      50,  170,  5.0, 30.0,  3.0, 'cafe_manha'),
    f('Atum (1 lata)',             85,  112, 24.7,  0.0,  0.9, 'cafe_manha'),
    f('Ovo cozido (1)',            60,   93,  7.8,  0.7,  6.6, 'cafe_manha'),
    f('Carne moída magra',        180,  279, 39.6,  0.0, 12.6, 'almoco'),
    f('Arroz branco (80g cru)',   240,  307,  6.2, 68.0,  0.7, 'almoco'),
    f('Espinafre',                150,   35,  4.4,  5.4,  0.6, 'almoco'),
    f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde'),
    f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde'),
    f('Queijo fresco batido',     150,  150, 10.5,  9.0,  6.0, 'cafe_tarde'),
    f('Banana',                   120,  118,  1.6, 31.0,  0.1, 'cafe_tarde'),
    f('Frango desfiado',          150,  248, 46.5,  0.0,  5.4, 'janta'),
    f('Wrap integral (2)',        120,  380, 10.0, 60.0, 10.0, 'janta'),
    f('Pimentões',                150,   47,  1.5, 10.5,  0.5, 'janta'),
  ]},
  { userId: GUILHERME, dow: 5, name: 'Sexta (treino)', foods: [
    f('Aveia (flocos)',            60,  233, 10.2, 39.6,  4.2, 'cafe_manha'),
    f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_manha'),
    f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_manha'),
    f('Lombo de porco',           180,  414, 45.0,  0.0, 25.2, 'almoco'),
    f('Batata cozida',            300,  261,  5.7, 60.0,  0.3, 'almoco'),
    f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'almoco'),
    f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde'),
    f('Ovos cozidos (2)',         120,  186, 15.6,  2.2, 13.2, 'cafe_tarde'),
    f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_tarde'),
    f('Wrap integral (1)',         60,  190,  5.0, 30.0,  5.0, 'janta'),
    f('Tomate',                   100,   18,  0.9,  3.9,  0.2, 'janta'),
    f('Atum (1 lata)',             85,  112, 24.7,  0.0,  0.9, 'janta'),
    f('Queijo light',              50,  100, 10.0,  3.0,  5.0, 'janta'),
  ]},
  { userId: GUILHERME, dow: 6, name: 'Sábado (descanso)', foods: [
    f('Aveia (flocos)',            60,  233, 10.2, 39.6,  4.2, 'cafe_manha'),
    f('Ovos (2)',                 120,  186, 15.6,  2.2, 13.2, 'cafe_manha'),
    f('Banana',                   120,  118,  1.6, 31.0,  0.1, 'cafe_manha'),
    f('Refeição livre (moderada)',  0,  700, 35.0, 80.0, 25.0, 'almoco'),
    f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde'),
    f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde'),
    f('Frango grelhado',          180,  297, 55.8,  0.0,  6.5, 'janta'),
    f('Verduras refogadas',       200,   50,  4.0, 10.0,  0.7, 'janta'),
  ]},
  { userId: GUILHERME, dow: 0, name: 'Domingo (descanso)', foods: [
    f('Ovos (2)',                 120,  186, 15.6,  2.2, 13.2, 'cafe_manha'),
    f('Pão integral (1 fatia)',    30,   69,  3.6, 12.0,  1.0, 'cafe_manha'),
    f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_manha'),
    f('Frango assado (sem pele)', 180,  297, 55.8,  0.0,  6.5, 'almoco'),
    f('Arroz branco (80g cru)',   240,  307,  6.2, 68.0,  0.7, 'almoco'),
    f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'almoco'),
    f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde'),
    f('Queijo fresco batido',     150,  150, 10.5,  9.0,  6.0, 'cafe_tarde'),
    f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_tarde'),
    f('Creme de verduras',        300,   80,  3.0, 15.0,  1.0, 'janta'),
    f('Atum (2 latas)',           170,  224, 49.3,  0.0,  1.7, 'janta'),
    f('Pão integral (1 fatia)',    30,   69,  3.6, 12.0,  1.0, 'janta'),
  ]},

  // ════════════════════════════════════════════════
  //  ANA  ~1.650 kcal · 110-120g proteína
  // ════════════════════════════════════════════════
  { userId: ANA, dow: 1, name: 'Segunda (treino)', foods: [
    f('Aveia (flocos)',            40,  156,  6.8, 26.4,  2.8, 'cafe_manha'),
    f('Queijo fresco batido',     200,  200, 14.0, 12.0,  8.0, 'cafe_manha'),
    f('Banana (½)',                60,   59,  0.8, 15.5,  0.1, 'cafe_manha'),
    f('Canela',                     2,    5,  0.1,  1.3,  0.0, 'cafe_manha'),
    f('Frango grelhado',          130,  215, 40.3,  0.0,  4.7, 'almoco'),
    f('Arroz branco (60g cru)',   180,  230,  4.7, 51.0,  0.5, 'almoco'),
    f('Brócolis',                 150,   51,  4.2, 10.5,  0.6, 'almoco'),
    f('Azeite (fio)',              14,  124,  0.0,  0.0, 14.0, 'almoco'),
    f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde'),
    f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde'),
    f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_tarde'),
    f('Tortilha de 2 ovos',       120,  186, 15.6,  2.2, 13.2, 'janta'),
    f('Batata cozida',            150,  131,  2.9, 30.0,  0.2, 'janta'),
    f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'janta'),
  ]},
  { userId: ANA, dow: 2, name: 'Terça (treino)', foods: [
    f('Ovos mexidos (2)',         120,  186, 14.0,  2.0, 13.4, 'cafe_manha'),
    f('Pão integral (1 fatia)',    30,   69,  3.6, 12.0,  1.0, 'cafe_manha'),
    f('Tomate',                   100,   18,  0.9,  3.9,  0.2, 'cafe_manha'),
    f('Carne moída magra',        130,  202, 28.6,  0.0,  9.1, 'almoco'),
    f('Batata assada',            200,  174,  3.8, 40.0,  0.2, 'almoco'),
    f('Vagem',                    150,   47,  2.7, 10.5,  0.2, 'almoco'),
    f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde'),
    f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_tarde'),
    f('Nozes',                     20,  131,  3.0,  2.7, 13.0, 'cafe_tarde'),
    f('Grão-de-bico (½ lata)',    120,  197, 10.5, 32.5,  3.1, 'janta'),
    f('Atum (1,5 latas)',         128,  169, 37.2,  0.0,  1.3, 'janta'),
    f('Azeite (fio)',              14,  124,  0.0,  0.0, 14.0, 'janta'),
  ]},
  { userId: ANA, dow: 3, name: 'Quarta (descanso)', foods: [
    f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_manha'),
    f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_manha'),
    f('Aveia (flocos)',            30,  117,  5.1, 19.8,  2.1, 'cafe_manha'),
    f('Maçã',                     150,   84,  0.5, 22.5,  0.3, 'cafe_manha'),
    f('Frango grelhado',          130,  215, 40.3,  0.0,  4.7, 'almoco'),
    f('Massa integral (50g cru)', 150,  237,  8.7, 46.5,  1.4, 'almoco'),
    f('Verduras refogadas',       150,   38,  3.0,  7.5,  0.5, 'almoco'),
    f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde'),
    f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde'),
    f('Bolachas de arroz (2)',     20,   78,  1.3, 17.0,  0.6, 'cafe_tarde'),
    f('Ovos mexidos (2)',         120,  186, 14.0,  2.0, 13.4, 'janta'),
    f('Peito de peru',             80,   86, 16.8,  1.0,  1.7, 'janta'),
    f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'janta'),
  ]},
  { userId: ANA, dow: 4, name: 'Quinta (treino)', foods: [
    f('Torrada integral (1)',      25,   85,  2.5, 15.0,  1.5, 'cafe_manha'),
    f('Atum (1 lata)',             85,  112, 24.7,  0.0,  0.9, 'cafe_manha'),
    f('Ovo cozido (1)',            60,   93,  7.8,  0.7,  6.6, 'cafe_manha'),
    f('Carne moída magra',        130,  202, 28.6,  0.0,  9.1, 'almoco'),
    f('Arroz branco (60g cru)',   180,  230,  4.7, 51.0,  0.5, 'almoco'),
    f('Espinafre',                150,   35,  4.4,  5.4,  0.6, 'almoco'),
    f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde'),
    f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde'),
    f('Queijo fresco batido',     100,  100,  7.0,  6.0,  4.0, 'cafe_tarde'),
    f('Banana (½)',                60,   59,  0.8, 15.5,  0.1, 'cafe_tarde'),
    f('Frango desfiado',          120,  198, 37.2,  0.0,  4.3, 'janta'),
    f('Wrap integral (1,5)',       90,  285,  7.5, 45.0,  7.5, 'janta'),
    f('Pimentões',                150,   47,  1.5, 10.5,  0.5, 'janta'),
  ]},
  { userId: ANA, dow: 5, name: 'Sexta (treino)', foods: [
    f('Aveia (flocos)',            40,  156,  6.8, 26.4,  2.8, 'cafe_manha'),
    f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_manha'),
    f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_manha'),
    f('Lombo de porco',           140,  322, 35.0,  0.0, 19.6, 'almoco'),
    f('Batata cozida',            200,  174,  3.8, 40.0,  0.2, 'almoco'),
    f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'almoco'),
    f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde'),
    f('Ovos cozidos (2)',         120,  186, 15.6,  2.2, 13.2, 'cafe_tarde'),
    f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_tarde'),
    f('Wrap integral (1)',         60,  190,  5.0, 30.0,  5.0, 'janta'),
    f('Tomate',                   100,   18,  0.9,  3.9,  0.2, 'janta'),
    f('Atum (1 lata)',             85,  112, 24.7,  0.0,  0.9, 'janta'),
    f('Queijo light',              30,   60,  6.0,  2.0,  3.0, 'janta'),
  ]},
  { userId: ANA, dow: 6, name: 'Sábado (descanso)', foods: [
    f('Aveia (flocos)',            40,  156,  6.8, 26.4,  2.8, 'cafe_manha'),
    f('Ovos (2)',                 120,  186, 15.6,  2.2, 13.2, 'cafe_manha'),
    f('Banana (½)',                60,   59,  0.8, 15.5,  0.1, 'cafe_manha'),
    f('Refeição livre (moderada)',  0,  550, 25.0, 60.0, 20.0, 'almoco'),
    f('Whey protein / iogurte grego', 200, 118, 20.0, 7.2, 0.8, 'cafe_tarde'),
    f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde'),
    f('Frango grelhado',          140,  231, 43.4,  0.0,  5.0, 'janta'),
    f('Verduras refogadas',       200,   50,  4.0, 10.0,  0.7, 'janta'),
  ]},
  { userId: ANA, dow: 0, name: 'Domingo (descanso)', foods: [
    f('Ovos (2)',                 120,  186, 15.6,  2.2, 13.2, 'cafe_manha'),
    f('Pão integral (1 fatia)',    30,   69,  3.6, 12.0,  1.0, 'cafe_manha'),
    f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_manha'),
    f('Frango assado (sem pele)', 140,  231, 43.4,  0.0,  5.0, 'almoco'),
    f('Arroz branco (60g cru)',   180,  230,  4.7, 51.0,  0.5, 'almoco'),
    f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'almoco'),
    f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde'),
    f('Queijo fresco batido',     100,  100,  7.0,  6.0,  4.0, 'cafe_tarde'),
    f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_tarde'),
    f('Creme de verduras',        300,   80,  3.0, 15.0,  1.0, 'janta'),
    f('Atum (1,5 latas)',         128,  169, 37.2,  0.0,  1.3, 'janta'),
    f('Pão integral (1 fatia)',    30,   69,  3.6, 12.0,  1.0, 'janta'),
  ]},
];

// ── inserção ───────────────────────────────────────────────────────────────
const delTplFoods = db.prepare(`
  DELETE FROM diet_template_foods WHERE template_id IN
  (SELECT id FROM diet_templates WHERE user_id = ?)
`);
const delTpl = db.prepare(
  'DELETE FROM diet_templates WHERE user_id = ?'
);
const insTpl = db.prepare(
  'INSERT INTO diet_templates (user_id, day_of_week, name) VALUES (?,?,?)'
);
const insFood = db.prepare(`
  INSERT INTO diet_template_foods
    (template_id, name, quantity_g, calories, protein, carbs, fat, food_order, meal)
  VALUES (?,?,?,?,?,?,?,?,?)
`);

const seed = db.transaction(() => {
  // Limpar templates existentes de ambos os users
  for (const uid of [GUILHERME, ANA]) {
    delTplFoods.run(uid);
    delTpl.run(uid);
  }

  let totalTpl = 0, totalFood = 0;

  for (const day of dietas) {
    const { lastInsertRowid: tplId } = insTpl.run(day.userId, day.dow, day.name);
    totalTpl++;

    day.foods.forEach((food, i) => {
      insFood.run(
        tplId,
        food.name,
        food.quantity_g,
        Math.round(food.calories),
        Math.round(food.protein * 10) / 10,
        Math.round(food.carbs * 10) / 10,
        Math.round(food.fat * 10) / 10,
        i,
        food.meal
      );
      totalFood++;
    });
  }

  console.log(`✅ ${totalTpl} templates · ${totalFood} alimentos inseridos`);
  console.log('\nResumo por usuário:');
  for (const uid of [GUILHERME, ANA]) {
    const rows = db.prepare(`
      SELECT dt.day_of_week, dt.name,
             COUNT(dtf.id) as foods,
             ROUND(SUM(dtf.calories)) as kcal,
             ROUND(SUM(dtf.protein)) as prot
      FROM diet_templates dt
      LEFT JOIN diet_template_foods dtf ON dtf.template_id = dt.id
      WHERE dt.user_id = ?
      GROUP BY dt.id
      ORDER BY dt.day_of_week
    `).all(uid);
    const nome = uid === GUILHERME ? 'Guilherme' : 'Ana';
    console.log(`\n  ${nome} (id:${uid}):`);
    rows.forEach(r => console.log(`    dow${r.day_of_week} ${r.name}: ${r.foods} alimentos · ${r.kcal} kcal · ${r.prot}g prot`));
  }
});

seed();
