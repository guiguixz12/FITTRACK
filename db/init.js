const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'fit.sqlite');

let db;

function getDB() {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDB() {
  const database = getDB();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      target_calories INTEGER DEFAULT 2000,
      target_protein INTEGER DEFAULT 150,
      target_carbs INTEGER DEFAULT 200,
      target_fat INTEGER DEFAULT 65,
      height_cm REAL,
      age INTEGER,
      sex TEXT
    );

    CREATE TABLE IF NOT EXISTS weight_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      weight_kg REAL NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, date)
    );

    CREATE TABLE IF NOT EXISTS diet_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      calories INTEGER DEFAULT 0,
      protein REAL DEFAULT 0,
      carbs REAL DEFAULT 0,
      fat REAL DEFAULT 0,
      notes TEXT DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, date)
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      notes TEXT DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, date)
    );

    CREATE TABLE IF NOT EXISTS workout_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      sets INTEGER,
      reps INTEGER,
      weight_kg REAL,
      exercise_order INTEGER DEFAULT 0,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS progress_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      filename TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS workout_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, day_of_week)
    );

    CREATE TABLE IF NOT EXISTS workout_template_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      sets INTEGER,
      reps INTEGER,
      weight_kg REAL,
      exercise_order INTEGER DEFAULT 0,
      FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS diet_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, day_of_week)
    );

    CREATE TABLE IF NOT EXISTS diet_template_foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity_g REAL,
      calories REAL DEFAULT 0,
      protein REAL DEFAULT 0,
      carbs REAL DEFAULT 0,
      fat REAL DEFAULT 0,
      fiber REAL DEFAULT 0,
      sodium REAL DEFAULT 0,
      sugar REAL DEFAULT 0,
      food_order INTEGER DEFAULT 0,
      FOREIGN KEY (template_id) REFERENCES diet_templates(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS water_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      amount_ml INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS exercise_prs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      weight_kg REAL,
      reps INTEGER,
      sets INTEGER,
      volume REAL,
      date TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, exercise_name)
    );
  `);

  const seedUsers = [
    {
      name: 'Guilherme',
      password: 'guilherme123',
      target_calories: 2500,
      target_protein: 180,
      target_carbs: 250,
      target_fat: 70,
      height_cm: 175,
      age: 25,
      sex: 'M'
    },
    {
      name: 'Ana',
      password: 'ana123',
      target_calories: 1800,
      target_protein: 130,
      target_carbs: 180,
      target_fat: 55,
      height_cm: 162,
      age: 23,
      sex: 'F'
    }
  ];

  const insertUser = database.prepare(`
    INSERT OR IGNORE INTO users
      (name, password_hash, target_calories, target_protein, target_carbs, target_fat, height_cm, age, sex)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of seedUsers) {
    const hash = bcrypt.hashSync(u.password, 10);
    insertUser.run(u.name, hash, u.target_calories, u.target_protein, u.target_carbs, u.target_fat, u.height_cm, u.age, u.sex);
  }

  // Migrations — add columns if upgrading from earlier versions
  const migrations = [
    "ALTER TABLE diet_template_foods ADD COLUMN meal TEXT DEFAULT 'almoco'",
    "ALTER TABLE diet_logs ADD COLUMN created_at TEXT DEFAULT (datetime('now'))",
    "ALTER TABLE diet_logs ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))",
    "ALTER TABLE users ADD COLUMN target_weight REAL",
    "ALTER TABLE diet_logs ADD COLUMN fiber REAL DEFAULT 0",
    "ALTER TABLE diet_logs ADD COLUMN sodium REAL DEFAULT 0",
    "ALTER TABLE diet_logs ADD COLUMN sugar REAL DEFAULT 0",
    "ALTER TABLE diet_template_foods ADD COLUMN fiber REAL DEFAULT 0",
    "ALTER TABLE diet_template_foods ADD COLUMN sodium REAL DEFAULT 0",
    "ALTER TABLE diet_template_foods ADD COLUMN sugar REAL DEFAULT 0",
    "ALTER TABLE users ADD COLUMN water_goal_ml INTEGER DEFAULT 2000",
    "ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'dark'",
  ];
  for (const sql of migrations) {
    try { database.exec(sql); } catch (_) { /* column already exists */ }
  }

  // Seed diet and workout templates for guixz and anabutti
  seedDietTemplates(database);
  seedWorkoutTemplates(database);

  console.log('Database ready at', DB_PATH);
}

function seedDietTemplates(database) {
  const f = (name, qty, cal, prot, carb, fat, meal, order) =>
    ({ name, quantity_g: qty, calories: cal, protein: prot, carbs: carb, fat, meal, food_order: order });

  const NAMES = ['guixz', 'anabutti'];

  // For each named user, seed only if they have 0 templates
  for (const userName of NAMES) {
    const user = database.prepare('SELECT id FROM users WHERE name = ?').get(userName);
    if (!user) continue;

    const isAna = userName === 'anabutti';
    const uid   = user.id;

    const days = isAna ? getDiasAna(f, uid) : getDiasGuilherme(f, uid);

    const insTpl = database.prepare('INSERT INTO diet_templates (user_id, day_of_week, name) VALUES (?,?,?)');
    const insFood = database.prepare(`
      INSERT INTO diet_template_foods
        (template_id, name, quantity_g, calories, protein, carbs, fat, food_order, meal)
      VALUES (?,?,?,?,?,?,?,?,?)
    `);

    const delFoods = database.prepare(`
      DELETE FROM diet_template_foods WHERE template_id IN
        (SELECT id FROM diet_templates WHERE user_id = ?)
    `);
    const delTpls = database.prepare('DELETE FROM diet_templates WHERE user_id = ?');

    database.transaction(() => {
      delFoods.run(uid);
      delTpls.run(uid);
      for (const day of days) {
        const { lastInsertRowid: tplId } = insTpl.run(uid, day.dow, day.name);
        for (const food of day.foods) {
          insFood.run(tplId, food.name, food.quantity_g,
            Math.round(food.calories),
            Math.round(food.protein * 10) / 10,
            Math.round(food.carbs   * 10) / 10,
            Math.round(food.fat     * 10) / 10,
            food.food_order, food.meal);
        }
      }
    })();

    console.log(`Diet templates seeded for ${userName} (id:${uid})`);
  }
}

function getDiasGuilherme(f, uid) {
  return [
    { userId: uid, dow: 1, name: 'Segunda (treino)', foods: [
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
    { userId: uid, dow: 2, name: 'Terça (treino)', foods: [
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
      f('Azeite (fio)',              14,  124,  0.0,  0.0, 14.0, 'janta', 2),
    ]},
    { userId: uid, dow: 3, name: 'Quarta (descanso)', foods: [
      f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_manha', 0),
      f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_manha', 1),
      f('Aveia (flocos)',            40,  156,  6.8, 26.4,  2.8, 'cafe_manha', 2),
      f('Maçã',                     150,   84,  0.5, 22.5,  0.3, 'cafe_manha', 3),
      f('Frango grelhado',          180,  297, 55.8,  0.0,  6.5, 'almoco', 0),
      f('Massa integral (70g cru)', 210,  332, 12.2, 65.1,  1.9, 'almoco', 1),
      f('Verduras refogadas',       150,   38,  3.0,  7.5,  0.5, 'almoco', 2),
      f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde', 0),
      f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Bolachas de arroz (3)',     30,  117,  2.0, 25.5,  0.9, 'cafe_tarde', 2),
      f('Ovos mexidos (3)',          180,  279, 21.0,  3.0, 20.0, 'janta', 0),
      f('Peito de peru',            100,  107, 21.0,  1.3,  2.1, 'janta', 1),
      f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'janta', 2),
    ]},
    { userId: uid, dow: 4, name: 'Quinta (treino)', foods: [
      f('Torrada integral (2)',      50,  170,  5.0, 30.0,  3.0, 'cafe_manha', 0),
      f('Atum (1 lata)',             85,  112, 24.7,  0.0,  0.9, 'cafe_manha', 1),
      f('Ovo cozido (1)',            60,   93,  7.8,  0.7,  6.6, 'cafe_manha', 2),
      f('Carne moída magra',        180,  279, 39.6,  0.0, 12.6, 'almoco', 0),
      f('Arroz branco (80g cru)',   240,  307,  6.2, 68.0,  0.7, 'almoco', 1),
      f('Espinafre',                150,   35,  4.4,  5.4,  0.6, 'almoco', 2),
      f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde', 0),
      f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Queijo fresco batido',     150,  150, 10.5,  9.0,  6.0, 'cafe_tarde', 2),
      f('Banana',                   120,  118,  1.6, 31.0,  0.1, 'cafe_tarde', 3),
      f('Frango desfiado',          150,  248, 46.5,  0.0,  5.4, 'janta', 0),
      f('Wrap integral (2)',         120,  380, 10.0, 60.0, 10.0, 'janta', 1),
      f('Pimentões',                150,   47,  1.5, 10.5,  0.5, 'janta', 2),
    ]},
    { userId: uid, dow: 5, name: 'Sexta (treino)', foods: [
      f('Aveia (flocos)',            60,  233, 10.2, 39.6,  4.2, 'cafe_manha', 0),
      f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_manha', 1),
      f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_manha', 2),
      f('Lombo de porco',           180,  414, 45.0,  0.0, 25.2, 'almoco', 0),
      f('Batata cozida',            300,  261,  5.7, 60.0,  0.3, 'almoco', 1),
      f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'almoco', 2),
      f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 0),
      f('Ovos cozidos (2)',          120,  186, 15.6,  2.2, 13.2, 'cafe_tarde', 1),
      f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_tarde', 2),
      f('Wrap integral (1)',          60,  190,  5.0, 30.0,  5.0, 'janta', 0),
      f('Tomate',                   100,   18,  0.9,  3.9,  0.2, 'janta', 1),
      f('Atum (1 lata)',              85,  112, 24.7,  0.0,  0.9, 'janta', 2),
      f('Queijo light',              50,  100, 10.0,  3.0,  5.0, 'janta', 3),
    ]},
    { userId: uid, dow: 6, name: 'Sábado (descanso)', foods: [
      f('Aveia (flocos)',            60,  233, 10.2, 39.6,  4.2, 'cafe_manha', 0),
      f('Ovos (2)',                  120,  186, 15.6,  2.2, 13.2, 'cafe_manha', 1),
      f('Banana',                   120,  118,  1.6, 31.0,  0.1, 'cafe_manha', 2),
      f('Refeição livre (moderada)',   0,  700, 35.0, 80.0, 25.0, 'almoco', 0),
      f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde', 0),
      f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Frango grelhado',          180,  297, 55.8,  0.0,  6.5, 'janta', 0),
      f('Verduras refogadas',       200,   50,  4.0, 10.0,  0.7, 'janta', 1),
    ]},
    { userId: uid, dow: 0, name: 'Domingo (descanso)', foods: [
      f('Ovos (2)',                  120,  186, 15.6,  2.2, 13.2, 'cafe_manha', 0),
      f('Pão integral (1 fatia)',    30,   69,  3.6, 12.0,  1.0, 'cafe_manha', 1),
      f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_manha', 2),
      f('Frango assado (sem pele)', 180,  297, 55.8,  0.0,  6.5, 'almoco', 0),
      f('Arroz branco (80g cru)',   240,  307,  6.2, 68.0,  0.7, 'almoco', 1),
      f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'almoco', 2),
      f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 0),
      f('Queijo fresco batido',     150,  150, 10.5,  9.0,  6.0, 'cafe_tarde', 1),
      f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_tarde', 2),
      f('Creme de verduras',        300,   80,  3.0, 15.0,  1.0, 'janta', 0),
      f('Atum (2 latas)',           170,  224, 49.3,  0.0,  1.7, 'janta', 1),
      f('Pão integral (1 fatia)',    30,   69,  3.6, 12.0,  1.0, 'janta', 2),
    ]},
  ];
}

function getDiasAna(f, uid) {
  return [
    { userId: uid, dow: 1, name: 'Segunda (treino)', foods: [
      f('Aveia (flocos)',            40,  156,  6.8, 26.4,  2.8, 'cafe_manha', 0),
      f('Queijo fresco batido',     200,  200, 14.0, 12.0,  8.0, 'cafe_manha', 1),
      f('Banana (½)',                60,   59,  0.8, 15.5,  0.1, 'cafe_manha', 2),
      f('Canela',                     2,    5,  0.1,  1.3,  0.0, 'cafe_manha', 3),
      f('Frango grelhado',          130,  215, 40.3,  0.0,  4.7, 'almoco', 0),
      f('Arroz branco (60g cru)',   180,  230,  4.7, 51.0,  0.5, 'almoco', 1),
      f('Brócolis',                 150,   51,  4.2, 10.5,  0.6, 'almoco', 2),
      f('Azeite (fio)',              14,  124,  0.0,  0.0, 14.0, 'almoco', 3),
      f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde', 0),
      f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_tarde', 2),
      f('Tortilha de 2 ovos',       120,  186, 15.6,  2.2, 13.2, 'janta', 0),
      f('Batata cozida',            150,  131,  2.9, 30.0,  0.2, 'janta', 1),
      f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'janta', 2),
    ]},
    { userId: uid, dow: 2, name: 'Terça (treino)', foods: [
      f('Ovos mexidos (2)',          120,  186, 14.0,  2.0, 13.4, 'cafe_manha', 0),
      f('Pão integral (1 fatia)',    30,   69,  3.6, 12.0,  1.0, 'cafe_manha', 1),
      f('Tomate',                   100,   18,  0.9,  3.9,  0.2, 'cafe_manha', 2),
      f('Carne moída magra',        130,  202, 28.6,  0.0,  9.1, 'almoco', 0),
      f('Batata assada',            200,  174,  3.8, 40.0,  0.2, 'almoco', 1),
      f('Vagem',                    150,   47,  2.7, 10.5,  0.2, 'almoco', 2),
      f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 0),
      f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_tarde', 1),
      f('Nozes',                     20,  131,  3.0,  2.7, 13.0, 'cafe_tarde', 2),
      f('Grão-de-bico (½ lata)',    120,  197, 10.5, 32.5,  3.1, 'janta', 0),
      f('Atum (1,5 latas)',         128,  169, 37.2,  0.0,  1.3, 'janta', 1),
      f('Azeite (fio)',              14,  124,  0.0,  0.0, 14.0, 'janta', 2),
    ]},
    { userId: uid, dow: 3, name: 'Quarta (descanso)', foods: [
      f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_manha', 0),
      f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_manha', 1),
      f('Aveia (flocos)',            30,  117,  5.1, 19.8,  2.1, 'cafe_manha', 2),
      f('Maçã',                     150,   84,  0.5, 22.5,  0.3, 'cafe_manha', 3),
      f('Frango grelhado',          130,  215, 40.3,  0.0,  4.7, 'almoco', 0),
      f('Massa integral (50g cru)', 150,  237,  8.7, 46.5,  1.4, 'almoco', 1),
      f('Verduras refogadas',       150,   38,  3.0,  7.5,  0.5, 'almoco', 2),
      f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde', 0),
      f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Bolachas de arroz (2)',     20,   78,  1.3, 17.0,  0.6, 'cafe_tarde', 2),
      f('Ovos mexidos (2)',          120,  186, 14.0,  2.0, 13.4, 'janta', 0),
      f('Peito de peru',             80,   86, 16.8,  1.0,  1.7, 'janta', 1),
      f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'janta', 2),
    ]},
    { userId: uid, dow: 4, name: 'Quinta (treino)', foods: [
      f('Torrada integral (1)',      25,   85,  2.5, 15.0,  1.5, 'cafe_manha', 0),
      f('Atum (1 lata)',             85,  112, 24.7,  0.0,  0.9, 'cafe_manha', 1),
      f('Ovo cozido (1)',            60,   93,  7.8,  0.7,  6.6, 'cafe_manha', 2),
      f('Carne moída magra',        130,  202, 28.6,  0.0,  9.1, 'almoco', 0),
      f('Arroz branco (60g cru)',   180,  230,  4.7, 51.0,  0.5, 'almoco', 1),
      f('Espinafre',                150,   35,  4.4,  5.4,  0.6, 'almoco', 2),
      f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_tarde', 0),
      f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Queijo fresco batido',     100,  100,  7.0,  6.0,  4.0, 'cafe_tarde', 2),
      f('Banana (½)',                60,   59,  0.8, 15.5,  0.1, 'cafe_tarde', 3),
      f('Frango desfiado',          120,  198, 37.2,  0.0,  4.3, 'janta', 0),
      f('Wrap integral (1,5)',       90,  285,  7.5, 45.0,  7.5, 'janta', 1),
      f('Pimentões',                150,   47,  1.5, 10.5,  0.5, 'janta', 2),
    ]},
    { userId: uid, dow: 5, name: 'Sexta (treino)', foods: [
      f('Aveia (flocos)',            40,  156,  6.8, 26.4,  2.8, 'cafe_manha', 0),
      f('Whey protein (1 scoop)',    30,  120, 24.0,  3.0,  2.0, 'cafe_manha', 1),
      f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_manha', 2),
      f('Lombo de porco',           140,  322, 35.0,  0.0, 19.6, 'almoco', 0),
      f('Batata cozida',            200,  174,  3.8, 40.0,  0.2, 'almoco', 1),
      f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'almoco', 2),
      f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 0),
      f('Ovos cozidos (2)',          120,  186, 15.6,  2.2, 13.2, 'cafe_tarde', 1),
      f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_tarde', 2),
      f('Wrap integral (1)',          60,  190,  5.0, 30.0,  5.0, 'janta', 0),
      f('Tomate',                   100,   18,  0.9,  3.9,  0.2, 'janta', 1),
      f('Atum (1 lata)',              85,  112, 24.7,  0.0,  0.9, 'janta', 2),
      f('Queijo light',              30,   60,  6.0,  2.0,  3.0, 'janta', 3),
    ]},
    { userId: uid, dow: 6, name: 'Sábado (descanso)', foods: [
      f('Aveia (flocos)',            40,  156,  6.8, 26.4,  2.8, 'cafe_manha', 0),
      f('Ovos (2)',                  120,  186, 15.6,  2.2, 13.2, 'cafe_manha', 1),
      f('Banana (½)',                60,   59,  0.8, 15.5,  0.1, 'cafe_manha', 2),
      f('Refeição livre (moderada)',   0,  550, 25.0, 60.0, 20.0, 'almoco', 0),
      f('Whey / iogurte grego',     200,  118, 20.0,  7.2,  0.8, 'cafe_tarde', 0),
      f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 1),
      f('Frango grelhado',          140,  231, 43.4,  0.0,  5.0, 'janta', 0),
      f('Verduras refogadas',       200,   50,  4.0, 10.0,  0.7, 'janta', 1),
    ]},
    { userId: uid, dow: 0, name: 'Domingo (descanso)', foods: [
      f('Ovos (2)',                  120,  186, 15.6,  2.2, 13.2, 'cafe_manha', 0),
      f('Pão integral (1 fatia)',    30,   69,  3.6, 12.0,  1.0, 'cafe_manha', 1),
      f('Iogurte grego natural',    200,  118, 20.0,  7.2,  0.8, 'cafe_manha', 2),
      f('Frango assado (sem pele)', 140,  231, 43.4,  0.0,  5.0, 'almoco', 0),
      f('Arroz branco (60g cru)',   180,  230,  4.7, 51.0,  0.5, 'almoco', 1),
      f('Salada verde',             100,   20,  1.5,  3.0,  0.3, 'almoco', 2),
      f('Creatina',                   5,    0,  0.0,  0.0,  0.0, 'cafe_tarde', 0),
      f('Queijo fresco batido',     100,  100,  7.0,  6.0,  4.0, 'cafe_tarde', 1),
      f('Fruta',                    150,   80,  0.8, 20.0,  0.2, 'cafe_tarde', 2),
      f('Creme de verduras',        300,   80,  3.0, 15.0,  1.0, 'janta', 0),
      f('Atum (1,5 latas)',         128,  169, 37.2,  0.0,  1.3, 'janta', 1),
      f('Pão integral (1 fatia)',    30,   69,  3.6, 12.0,  1.0, 'janta', 2),
    ]},
  ];
}

function seedWorkoutTemplates(database) {
  const e = (name, sets, reps, order) =>
    ({ name, sets, reps, weight_kg: 0, exercise_order: order });

  const plans = {
    guixz: [
      { dow: 1, name: 'Upper A — Força', exercises: [
        e('Supino reto',                       4,  8, 0),
        e('Remada curvada',                    4,  8, 1),
        e('Desenvolvimento militar halteres',  3, 10, 2),
        e('Puxada na frente / barra fixa',     3, 10, 3),
        e('Rosca direta',                      3, 12, 4),
        e('Tríceps corda',                     3, 12, 5),
      ]},
      { dow: 2, name: 'Lower A — Força', exercises: [
        e('Agachamento livre',                 4,  8, 0),
        e('Terra romeno',                      3, 10, 1),
        e('Leg press',                         3, 12, 2),
        e('Cadeira flexora',                   3, 12, 3),
        e('Panturrilha em pé',                 4, 15, 4),
        e('Prancha (40s)',                      3, 40, 5),
      ]},
      { dow: 4, name: 'Upper B — Volume', exercises: [
        e('Supino inclinado halteres',         4, 12, 0),
        e('Remada baixa cabo',                 4, 12, 1),
        e('Elevação lateral',                  4, 15, 2),
        e('Puxada neutra / pull-over',         3, 12, 3),
        e('Rosca martelo',                     3, 12, 4),
        e('Tríceps francês',                   3, 12, 5),
      ]},
      { dow: 5, name: 'Lower B — Volume', exercises: [
        e('Hip thrust / agachamento búlgaro',  4, 12, 0),
        e('Cadeira extensora',                 3, 15, 1),
        e('Stiff com halteres',                3, 12, 2),
        e('Afundo caminhando (por perna)',      3, 10, 3),
        e('Panturrilha sentado',               4, 15, 4),
        e('Abdominal com carga',               3, 15, 5),
      ]},
    ],
    anabutti: [
      { dow: 1, name: 'Lower A — Glúteo/Força', exercises: [
        e('Hip thrust',                                    4, 10, 0),
        e('Agachamento livre / smith',                     4, 10, 1),
        e('Terra romeno com halteres',                     3, 12, 2),
        e('Cadeira abdutora',                              3, 15, 3),
        e('Panturrilha em pé',                             3, 15, 4),
        e('Prancha (35s)',                                  3, 35, 5),
      ]},
      { dow: 2, name: 'Upper A', exercises: [
        e('Puxada na frente',                              4, 12, 0),
        e('Supino com halteres',                           3, 12, 1),
        e('Remada baixa',                                  3, 12, 2),
        e('Desenvolvimento com halteres',                  3, 12, 3),
        e('Elevação lateral',                              3, 15, 4),
        e('Tríceps corda',                                 3, 15, 5),
      ]},
      { dow: 4, name: 'Lower B — Glúteo/Volume', exercises: [
        e('Agachamento búlgaro (por perna)',                3, 10, 0),
        e('Leg press (pés altos)',                          4, 12, 1),
        e('Cadeira flexora',                               3, 15, 2),
        e('Elevação pélvica unilateral / coice no cabo',   3, 15, 3),
        e('Cadeira extensora',                             3, 15, 4),
        e('Abdominal',                                     3, 15, 5),
      ]},
      { dow: 5, name: 'Upper B + Core', exercises: [
        e('Remada curvada com halteres',                   4, 12, 0),
        e('Supino inclinado halteres',                     3, 12, 1),
        e('Puxada neutra',                                 3, 12, 2),
        e('Elevação lateral',                              3, 15, 3),
        e('Rosca direta',                                  3, 12, 4),
        e('Abdominal com carga',                           3, 12, 5),
        e('Prancha lateral (20s por lado)',                 3, 20, 6),
      ]},
    ],
  };

  const delEx  = database.prepare(`
    DELETE FROM workout_template_exercises WHERE template_id IN
      (SELECT id FROM workout_templates WHERE user_id = ?)
  `);
  const delTpl = database.prepare('DELETE FROM workout_templates WHERE user_id = ?');
  const insTpl = database.prepare('INSERT INTO workout_templates (user_id, day_of_week, name) VALUES (?,?,?)');
  const insEx  = database.prepare(`
    INSERT INTO workout_template_exercises
      (template_id, name, sets, reps, weight_kg, exercise_order)
    VALUES (?,?,?,?,?,?)
  `);

  for (const [userName, days] of Object.entries(plans)) {
    const user = database.prepare('SELECT id FROM users WHERE name = ?').get(userName);
    if (!user) continue;

    database.transaction(() => {
      delEx.run(user.id);
      delTpl.run(user.id);
      for (const day of days) {
        const { lastInsertRowid: tplId } = insTpl.run(user.id, day.dow, day.name);
        for (const ex of day.exercises) {
          insEx.run(tplId, ex.name, ex.sets, ex.reps, ex.weight_kg, ex.exercise_order);
        }
      }
    })();

    console.log(`Workout templates seeded for ${userName} (id:${user.id})`);
  }
}

module.exports = { getDB, initDB };
