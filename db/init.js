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

  console.log('Database ready at', DB_PATH);
}

module.exports = { getDB, initDB };
