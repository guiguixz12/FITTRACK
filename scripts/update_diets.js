// Script para atualizar dietas de guixz (user 1) e anabutti (user 2)
'use strict';

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'fit.sqlite');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// day_of_week: 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb

// ─── Valores nutricionais base ───────────────────────────────────────────────
// (kcal, prot g, carbs g, fat g)

const IOGURTE_GREGO_200    = { n: 'Iogurte grego',               q: 200, c: 180, p: 18,   k: 8,    f: 8   };
const WHEY_30              = { n: 'Whey protein (1 scoop)',        q: 30,  c: 120, p: 24,   k: 3,    f: 2   };
const CANELA_2             = { n: 'Canela',                        q: 2,   c: 6,   p: 0.1,  k: 1.5,  f: 0.1 };
const BANANA_120           = { n: 'Banana (opcional)',             q: 120, c: 107, p: 1.3,  k: 27,   f: 0.4 };

const PAO_INTEGRAL_30      = { n: 'Pão integral (1 fatia)',        q: 30,  c: 75,  p: 3,    k: 13,   f: 1   };
const OVOS_75              = { n: 'Ovos (1-2 unidades)',           q: 75,  c: 117, p: 9.5,  k: 0.9,  f: 8   };
const CAFE_PRETO           = { n: 'Café',                          q: 0,   c: 2,   p: 0,    k: 0,    f: 0   };

const FRANGO_200           = { n: 'Peito de frango grelhado',      q: 200, c: 330, p: 62,   k: 0,    f: 7.2 };
const FRANGO_180           = { n: 'Peito de frango grelhado',      q: 180, c: 297, p: 55.8, k: 0,    f: 6.5 };
const FRANGO_160           = { n: 'Peito de frango grelhado',      q: 160, c: 264, p: 49.6, k: 0,    f: 5.8 };
const FRANGO_140           = { n: 'Peito de frango grelhado',      q: 140, c: 231, p: 43.4, k: 0,    f: 5   };

const ARROZ_CRU_70         = { n: 'Arroz branco cru',              q: 70,  c: 255, p: 5,    k: 56,   f: 0.4 };
const ARROZ_CRU_100        = { n: 'Arroz branco cru',              q: 100, c: 365, p: 7.1,  k: 80,   f: 0.5 };
const ARROZ_CRU_50         = { n: 'Arroz branco cru',              q: 50,  c: 183, p: 3.6,  k: 40,   f: 0.25};

const FEIJAO_80            = { n: 'Feijão cozido (1 concha)',       q: 80,  c: 73,  p: 5.3,  k: 12.7, f: 0.3 };
const SALADA_150           = { n: 'Salada variada',                 q: 150, c: 35,  p: 2,    k: 6,    f: 0.3 };
const AZEITE_8             = { n: 'Azeite',                         q: 8,   c: 70,  p: 0,    k: 0,    f: 8   };

const LOMBO_200            = { n: 'Lombo de porco grelhado',        q: 200, c: 286, p: 52,   k: 0,    f: 8   };
const LOMBO_180            = { n: 'Lombo de porco grelhado',        q: 180, c: 257, p: 46.8, k: 0,    f: 7.2 };
const LOMBO_160            = { n: 'Lombo de porco grelhado',        q: 160, c: 229, p: 41.6, k: 0,    f: 6.4 };
const LOMBO_140            = { n: 'Lombo de porco grelhado',        q: 140, c: 200, p: 36.4, k: 0,    f: 5.6 };

const BATATA_350           = { n: 'Batata cozida',                  q: 350, c: 270, p: 7,    k: 59.5, f: 0.35};
const BATATA_280           = { n: 'Batata cozida',                  q: 280, c: 216, p: 5.6,  k: 47.6, f: 0.28};
const BATATA_250           = { n: 'Batata cozida',                  q: 250, c: 193, p: 5,    k: 42.5, f: 0.25};
const BATATA_200           = { n: 'Batata cozida',                  q: 200, c: 154, p: 4,    k: 34,   f: 0.2 };

const ATUM_2LATAS          = { n: 'Atum em água (2 latas)',          q: 160, c: 188, p: 41.4, k: 0,    f: 3.2 };
const ATUM_15LATA          = { n: 'Atum em água (1,5 lata)',         q: 120, c: 141, p: 31,   k: 0,    f: 2.4 };

// misto = pão integral (2 fatias) + peito de peru + queijo light
const PAO_MISTO_60         = { n: 'Pão integral (2 fatias)',         q: 60,  c: 150, p: 6,    k: 26,   f: 2   };
const PEITO_PERU_50        = { n: 'Peito de peru fatiado',           q: 50,  c: 55,  p: 10.5, k: 0.5,  f: 1   };
const QUEIJO_LIGHT_30      = { n: 'Queijo light',                    q: 30,  c: 70,  p: 7,    k: 1.5,  f: 4   };
const FRUTA_150            = { n: 'Fruta (maçã / laranja / pera)',   q: 150, c: 78,  p: 0.4,  k: 20,   f: 0.2 };
const OVO_COZIDO           = { n: 'Ovo cozido',                      q: 50,  c: 78,  p: 6.3,  k: 0.6,  f: 5.3 };

const FRANGO_MERCADONA_200 = { n: 'Frango assado Mercadona (sem pele)', q: 200, c: 280, p: 54, k: 0,  f: 6   };
const FRANGO_ASSADO_SOBRA  = { n: 'Frango assado (sobra, sem pele)',    q: 160, c: 224, p: 43.2, k: 0, f: 4.8};
const FRANGO_MERCADONA_160 = { n: 'Frango assado Mercadona (sem pele)', q: 160, c: 224, p: 43.2, k: 0, f: 4.8};

const HAMBURGER_FRANGO     = { n: 'Hambúrguer de frango (BK/KFC simples)', q: 0, c: 420, p: 28, k: 38, f: 15 };
const BATATA_PEQUENA_FAST  = { n: 'Batata pequena (BK/KFC, opcional)',     q: 0, c: 250, p: 3,  k: 33, f: 12 };
const BEBIDA_ZERO          = { n: 'Bebida zero',                           q: 0, c: 0,   p: 0,  k: 0,  f: 0  };

// ─── Dieta Guilherme (user_id = 1) ───────────────────────────────────────────
const DIETA_GUIXZ = [
  {
    day: 1, name: 'Segunda — Treino',
    cafe_manha:  [IOGURTE_GREGO_200, WHEY_30, CANELA_2, BANANA_120],
    almoco:      [FRANGO_200, ARROZ_CRU_70, FEIJAO_80, SALADA_150, AZEITE_8],
    cafe_tarde:  [PAO_MISTO_60, PEITO_PERU_50, QUEIJO_LIGHT_30, FRUTA_150, OVO_COZIDO],
    janta:       [FRANGO_180, ARROZ_CRU_70, SALADA_150],
  },
  {
    day: 2, name: 'Terça — Treino',
    cafe_manha:  [IOGURTE_GREGO_200, WHEY_30, CANELA_2],
    almoco:      [LOMBO_200, BATATA_350, SALADA_150, AZEITE_8],
    cafe_tarde:  [PAO_MISTO_60, PEITO_PERU_50, QUEIJO_LIGHT_30, FRUTA_150, OVO_COZIDO],
    janta:       [LOMBO_180, BATATA_250, SALADA_150],
  },
  {
    day: 3, name: 'Quarta — Descanso',
    cafe_manha:  [IOGURTE_GREGO_200, WHEY_30, CANELA_2],
    almoco:      [FRANGO_200, ARROZ_CRU_100, SALADA_150, AZEITE_8],
    cafe_tarde:  [PAO_MISTO_60, PEITO_PERU_50, QUEIJO_LIGHT_30, FRUTA_150],
    janta:       [FRANGO_180, SALADA_150],
  },
  {
    day: 4, name: 'Quinta — Treino',
    cafe_manha:  [IOGURTE_GREGO_200, WHEY_30, CANELA_2],
    almoco:      [ATUM_2LATAS, BATATA_350, SALADA_150, AZEITE_8],
    cafe_tarde:  [PAO_MISTO_60, PEITO_PERU_50, QUEIJO_LIGHT_30, FRUTA_150, OVO_COZIDO],
    janta:       [ATUM_2LATAS, BATATA_250, SALADA_150],
  },
  {
    day: 5, name: 'Sexta — Treino',
    cafe_manha:  [IOGURTE_GREGO_200, WHEY_30, CANELA_2],
    almoco:      [LOMBO_200, ARROZ_CRU_70, FEIJAO_80, SALADA_150, AZEITE_8],
    cafe_tarde:  [PAO_MISTO_60, PEITO_PERU_50, QUEIJO_LIGHT_30, FRUTA_150, OVO_COZIDO],
    janta:       [LOMBO_180, ARROZ_CRU_70, SALADA_150],
  },
  {
    day: 6, name: 'Sábado — Descanso',
    cafe_manha:  [IOGURTE_GREGO_200, WHEY_30, CANELA_2],
    almoco:      [FRANGO_MERCADONA_200, ARROZ_CRU_100, SALADA_150],
    cafe_tarde:  [PAO_MISTO_60, PEITO_PERU_50, QUEIJO_LIGHT_30, FRUTA_150],
    janta:       [FRANGO_ASSADO_SOBRA, SALADA_150],
  },
  {
    day: 0, name: 'Domingo — Descanso (Hambúrguer)',
    cafe_manha:  [IOGURTE_GREGO_200, WHEY_30, CANELA_2],
    almoco:      [FRANGO_180, SALADA_150, AZEITE_8],
    cafe_tarde:  [FRUTA_150],
    janta:       [HAMBURGER_FRANGO, BATATA_PEQUENA_FAST, BEBIDA_ZERO],
  },
];

// ─── Dieta Ana (user_id = 2) ─────────────────────────────────────────────────
const DIETA_ANA = [
  {
    day: 1, name: 'Segunda — Treino',
    cafe_manha:  [PAO_INTEGRAL_30, OVOS_75, CAFE_PRETO],
    almoco:      [FRANGO_160, ARROZ_CRU_50, FEIJAO_80, SALADA_150, AZEITE_8],
    cafe_tarde:  [PAO_MISTO_60, PEITO_PERU_50, QUEIJO_LIGHT_30, FRUTA_150],
    janta:       [FRANGO_140, ARROZ_CRU_50, SALADA_150],
  },
  {
    day: 2, name: 'Terça — Treino',
    cafe_manha:  [PAO_INTEGRAL_30, OVOS_75, CAFE_PRETO],
    almoco:      [LOMBO_160, BATATA_280, SALADA_150, AZEITE_8],
    cafe_tarde:  [PAO_MISTO_60, PEITO_PERU_50, QUEIJO_LIGHT_30, FRUTA_150],
    janta:       [LOMBO_140, BATATA_200, SALADA_150],
  },
  {
    day: 3, name: 'Quarta — Descanso',
    cafe_manha:  [PAO_INTEGRAL_30, OVOS_75, CAFE_PRETO],
    almoco:      [FRANGO_160, ARROZ_CRU_70, SALADA_150, AZEITE_8],
    cafe_tarde:  [PAO_MISTO_60, PEITO_PERU_50, QUEIJO_LIGHT_30, FRUTA_150],
    janta:       [FRANGO_140, SALADA_150],
  },
  {
    day: 4, name: 'Quinta — Treino',
    cafe_manha:  [PAO_INTEGRAL_30, OVOS_75, CAFE_PRETO],
    almoco:      [ATUM_2LATAS, BATATA_280, SALADA_150, AZEITE_8],
    cafe_tarde:  [PAO_MISTO_60, PEITO_PERU_50, QUEIJO_LIGHT_30, FRUTA_150],
    janta:       [ATUM_15LATA, BATATA_200, SALADA_150],
  },
  {
    day: 5, name: 'Sexta — Treino',
    cafe_manha:  [PAO_INTEGRAL_30, OVOS_75, CAFE_PRETO],
    almoco:      [LOMBO_160, ARROZ_CRU_50, FEIJAO_80, SALADA_150, AZEITE_8],
    cafe_tarde:  [PAO_MISTO_60, PEITO_PERU_50, QUEIJO_LIGHT_30, FRUTA_150],
    janta:       [LOMBO_140, ARROZ_CRU_50, SALADA_150],
  },
  {
    day: 6, name: 'Sábado — Descanso',
    cafe_manha:  [PAO_INTEGRAL_30, OVOS_75, CAFE_PRETO],
    almoco:      [FRANGO_MERCADONA_160, ARROZ_CRU_70, SALADA_150],
    cafe_tarde:  [PAO_MISTO_60, PEITO_PERU_50, QUEIJO_LIGHT_30, FRUTA_150],
    janta:       [FRANGO_ASSADO_SOBRA, SALADA_150],
  },
  {
    day: 0, name: 'Domingo — Descanso (Dia livre)',
    cafe_manha:  [PAO_INTEGRAL_30, OVOS_75, CAFE_PRETO],
    almoco:      [FRANGO_140, SALADA_150, AZEITE_8],
    cafe_tarde:  [FRUTA_150],
    janta:       [HAMBURGER_FRANGO, BEBIDA_ZERO],
  },
];

// ─── Insert logic ─────────────────────────────────────────────────────────────

const insertTemplate = db.prepare(
  `INSERT INTO diet_templates (user_id, day_of_week, name) VALUES (?, ?, ?)
   ON CONFLICT(user_id, day_of_week) DO UPDATE SET name = excluded.name`
);

const getTemplateId = db.prepare(
  `SELECT id FROM diet_templates WHERE user_id = ? AND day_of_week = ?`
);

const deleteFoods = db.prepare(
  `DELETE FROM diet_template_foods WHERE template_id = ?`
);

const insertFood = db.prepare(
  `INSERT INTO diet_template_foods
     (template_id, name, quantity_g, calories, protein, carbs, fat, food_order, meal)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

const MEAL_ORDER = ['cafe_manha', 'almoco', 'cafe_tarde', 'janta'];

function applyDiet(userId, days) {
  for (const day of days) {
    insertTemplate.run(userId, day.day, day.name);
    const { id: tid } = getTemplateId.get(userId, day.day);
    deleteFoods.run(tid);

    for (const meal of MEAL_ORDER) {
      const foods = day[meal] || [];
      foods.forEach((f, i) => {
        insertFood.run(tid, f.n, f.q || null, f.c, f.p, f.k, f.f, i + 1, meal);
      });
    }

    const totalKcal = MEAL_ORDER
      .flatMap(m => day[m] || [])
      .reduce((s, f) => s + f.c, 0);
    console.log(`  ${day.name} → template ${tid}, ~${Math.round(totalKcal)} kcal`);
  }
}

const run = db.transaction(() => {
  console.log('\n=== Guilherme (user 1) ===');
  applyDiet(1, DIETA_GUIXZ);

  console.log('\n=== Ana (user 2) ===');
  applyDiet(2, DIETA_ANA);
});

run();
console.log('\nDietas atualizadas com sucesso!');
db.close();
