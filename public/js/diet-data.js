/* ═══════════════════════════════════════════
   Diet — programa semanal + acompanhamento do dia
   ═══════════════════════════════════════════ */

const MEAL_ICON_SVG = {
  cafe_manha: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>`,
  almoco:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
  cafe_tarde: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`,
  janta:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
};
const MEALS = [
  { id: 'cafe_manha', label: 'Café da Manhã', icon: MEAL_ICON_SVG.cafe_manha },
  { id: 'almoco',     label: 'Almoço',        icon: MEAL_ICON_SVG.almoco },
  { id: 'cafe_tarde', label: 'Café da Tarde', icon: MEAL_ICON_SVG.cafe_tarde },
  { id: 'janta',      label: 'Jantar',        icon: MEAL_ICON_SVG.janta },
];

// ── Food Library ──────────────────────────────────────────────────────────────
const FOOD_LIBRARY = {
  proteinas: [
    { name: 'Frango (peito grelhado)', cal: 165, prot: 31,   carb: 0,    fat: 3.6 },
    { name: 'Frango (coxa s/ pele)',   cal: 180, prot: 24,   carb: 0,    fat: 9   },
    { name: 'Carne bovina (patinho)',  cal: 219, prot: 26,   carb: 0,    fat: 12  },
    { name: 'Alcatra grelhada',        cal: 182, prot: 28,   carb: 0,    fat: 7   },
    { name: 'Carne moída (patinho)',   cal: 155, prot: 22,   carb: 0,    fat: 7   },
    { name: 'Tilápia grelhada',        cal: 96,  prot: 20,   carb: 0,    fat: 1.7 },
    { name: 'Salmão grelhado',         cal: 208, prot: 20,   carb: 0,    fat: 13  },
    { name: 'Atum (lata escorrido)',   cal: 132, prot: 29,   carb: 0,    fat: 1   },
    { name: 'Sardinha (lata azeite)',  cal: 208, prot: 25,   carb: 0,    fat: 11  },
    { name: 'Camarão',                 cal: 85,  prot: 18,   carb: 0.9,  fat: 0.7 },
    { name: 'Peito de peru',           cal: 107, prot: 21,   carb: 1.3,  fat: 2.1 },
    { name: 'Presunto magro',          cal: 145, prot: 21,   carb: 2,    fat: 6   },
  ],
  carboidratos: [
    { name: 'Arroz branco (cozido)',   cal: 128, prot: 2.7,  carb: 28,   fat: 0.3 },
    { name: 'Arroz integral (cozido)', cal: 111, prot: 2.6,  carb: 23,   fat: 0.9 },
    { name: 'Batata doce (cozida)',    cal: 86,  prot: 1.6,  carb: 20,   fat: 0.1 },
    { name: 'Batata inglesa (cozida)', cal: 87,  prot: 1.9,  carb: 20,   fat: 0.1 },
    { name: 'Macarrão (cozido)',       cal: 158, prot: 5.8,  carb: 31,   fat: 0.9 },
    { name: 'Aveia (flocos)',          cal: 389, prot: 17,   carb: 66,   fat: 7   },
    { name: 'Tapioca (seca)',          cal: 344, prot: 0.2,  carb: 85,   fat: 0.3 },
    { name: 'Pão integral (fatia)',    cal: 69,  prot: 3.6,  carb: 12,   fat: 1,   serving: 30 },
    { name: 'Pão francês',             cal: 300, prot: 8,    carb: 58,   fat: 3.5, serving: 50 },
    { name: 'Mandioca (cozida)',       cal: 125, prot: 0.9,  carb: 30,   fat: 0.2 },
    { name: 'Inhame (cozido)',         cal: 118, prot: 1.5,  carb: 27,   fat: 0.2 },
    { name: 'Cuscuz',                  cal: 374, prot: 13,   carb: 77,   fat: 2.5, serving: 80  },
  ],
  ovos: [
    { name: 'Ovo inteiro',             cal: 155, prot: 13,   carb: 1.1,  fat: 11,  serving: 50  },
    { name: 'Clara de ovo (1 un)',     cal: 17,  prot: 3.6,  carb: 0.2,  fat: 0.1, serving: 33  },
    { name: 'Gema de ovo (1 un)',      cal: 55,  prot: 2.7,  carb: 0.6,  fat: 4.5, serving: 17  },
    { name: 'Omelete (2 ovos)',        cal: 154, prot: 12,   carb: 1,    fat: 11,  serving: 100 },
    { name: 'Ovos mexidos (2 ovos)',   cal: 210, prot: 14,   carb: 1,    fat: 16,  serving: 120 },
    { name: 'Ovo cozido',              cal: 155, prot: 13,   carb: 1.1,  fat: 11,  serving: 50  },
  ],
  laticinios: [
    { name: 'Leite integral',          cal: 61,  prot: 3.2,  carb: 4.8,  fat: 3.3 },
    { name: 'Leite desnatado',         cal: 35,  prot: 3.4,  carb: 4.9,  fat: 0.1 },
    { name: 'Iogurte grego natural',   cal: 59,  prot: 10,   carb: 3.6,  fat: 0.4 },
    { name: 'Iogurte natural integral',cal: 61,  prot: 3.5,  carb: 4.7,  fat: 3.3 },
    { name: 'Queijo cottage',          cal: 98,  prot: 11,   carb: 3.4,  fat: 4.3 },
    { name: 'Queijo minas frescal',    cal: 264, prot: 17,   carb: 3,    fat: 20  },
    { name: 'Queijo prato',            cal: 359, prot: 25,   carb: 1,    fat: 28,  serving: 30  },
    { name: 'Ricota',                  cal: 174, prot: 11,   carb: 3,    fat: 13  },
    { name: 'Requeijão',               cal: 253, prot: 7,    carb: 3,    fat: 24,  serving: 30  },
    { name: 'Creme de leite',          cal: 333, prot: 2.5,  carb: 2.7,  fat: 35,  serving: 20  },
  ],
  vegetais: [
    { name: 'Brócolis',                cal: 34,  prot: 2.8,  carb: 7,    fat: 0.4 },
    { name: 'Espinafre',               cal: 23,  prot: 2.9,  carb: 3.6,  fat: 0.4 },
    { name: 'Alface',                  cal: 15,  prot: 1.4,  carb: 2.9,  fat: 0.2 },
    { name: 'Tomate',                  cal: 18,  prot: 0.9,  carb: 3.9,  fat: 0.2 },
    { name: 'Cenoura',                 cal: 41,  prot: 0.9,  carb: 10,   fat: 0.2 },
    { name: 'Abobrinha',               cal: 17,  prot: 1.2,  carb: 3.1,  fat: 0.3 },
    { name: 'Couve-flor',              cal: 25,  prot: 1.9,  carb: 5,    fat: 0.3 },
    { name: 'Pepino',                  cal: 15,  prot: 0.7,  carb: 3.6,  fat: 0.1 },
    { name: 'Chuchu (cozido)',         cal: 19,  prot: 0.9,  carb: 4.5,  fat: 0.1 },
    { name: 'Vagem',                   cal: 31,  prot: 1.8,  carb: 7,    fat: 0.1 },
    { name: 'Couve (refogada)',        cal: 45,  prot: 3.1,  carb: 7.6,  fat: 0.9 },
    { name: 'Beterraba (cozida)',      cal: 44,  prot: 1.7,  carb: 10,   fat: 0.2 },
    { name: 'Berinjela',               cal: 25,  prot: 1,    carb: 5.9,  fat: 0.2 },
    { name: 'Quiabo',                  cal: 31,  prot: 2,    carb: 7.5,  fat: 0.1 },
  ],
  frutas: [
    { name: 'Banana-prata',            cal: 98,  prot: 1.3,  carb: 26,   fat: 0.1, serving: 100 },
    { name: 'Maçã',                    cal: 56,  prot: 0.3,  carb: 15,   fat: 0.2, serving: 150 },
    { name: 'Laranja',                 cal: 47,  prot: 0.9,  carb: 12,   fat: 0.1, serving: 130 },
    { name: 'Mamão papaia',            cal: 40,  prot: 0.6,  carb: 10,   fat: 0.1, serving: 150 },
    { name: 'Manga',                   cal: 60,  prot: 0.8,  carb: 15,   fat: 0.4, serving: 150 },
    { name: 'Abacate',                 cal: 160, prot: 2,    carb: 9,    fat: 15,  serving: 80  },
    { name: 'Morango',                 cal: 32,  prot: 0.7,  carb: 7.7,  fat: 0.3, serving: 100 },
    { name: 'Melancia',                cal: 30,  prot: 0.6,  carb: 7.6,  fat: 0.2, serving: 200 },
    { name: 'Uva',                     cal: 69,  prot: 0.7,  carb: 18,   fat: 0.2, serving: 100 },
    { name: 'Goiaba',                  cal: 54,  prot: 2.6,  carb: 10,   fat: 1,   serving: 100 },
    { name: 'Abacaxi',                 cal: 50,  prot: 0.9,  carb: 13,   fat: 0.1, serving: 100 },
    { name: 'Kiwi',                    cal: 61,  prot: 1.1,  carb: 15,   fat: 0.5, serving: 70  },
  ],
  gorduras: [
    { name: 'Azeite de oliva',         cal: 884, prot: 0,    carb: 0,    fat: 100, serving: 10  },
    { name: 'Manteiga',                cal: 717, prot: 0.9,  carb: 0.1,  fat: 81,  serving: 10  },
    { name: 'Pasta de amendoim',       cal: 588, prot: 25,   carb: 20,   fat: 50,  serving: 30  },
    { name: 'Amendoim torrado',        cal: 567, prot: 26,   carb: 16,   fat: 49,  serving: 30  },
    { name: 'Castanha-do-pará',        cal: 659, prot: 14,   carb: 12,   fat: 67,  serving: 20  },
    { name: 'Amêndoas',                cal: 579, prot: 21,   carb: 22,   fat: 50,  serving: 25  },
    { name: 'Caju',                    cal: 553, prot: 18,   carb: 33,   fat: 44,  serving: 25  },
    { name: 'Nozes',                   cal: 654, prot: 15,   carb: 14,   fat: 65,  serving: 20  },
    { name: 'Óleo de coco',            cal: 862, prot: 0,    carb: 0,    fat: 100, serving: 10  },
  ],
  leguminosas: [
    { name: 'Feijão carioca (cozido)', cal: 76,  prot: 4.8,  carb: 14,   fat: 0.5 },
    { name: 'Feijão preto (cozido)',   cal: 77,  prot: 4.5,  carb: 14,   fat: 0.5 },
    { name: 'Lentilha (cozida)',       cal: 116, prot: 9,    carb: 20,   fat: 0.4 },
    { name: 'Grão-de-bico (cozido)',   cal: 164, prot: 8.9,  carb: 27,   fat: 2.6 },
    { name: 'Ervilha',                 cal: 81,  prot: 5.4,  carb: 14,   fat: 0.4 },
    { name: 'Soja (cozida)',           cal: 173, prot: 17,   carb: 10,   fat: 9   },
    { name: 'Tofu',                    cal: 76,  prot: 8,    carb: 1.9,  fat: 4.8 },
  ],
  suplementos: [
    { name: 'Whey Protein (scoop)',    cal: 120, prot: 24,   carb: 3,    fat: 2,   serving: 30  },
    { name: 'Whey Isolado (scoop)',    cal: 110, prot: 26,   carb: 1,    fat: 0.5, serving: 30  },
    { name: 'Caseína (scoop)',         cal: 120, prot: 24,   carb: 3,    fat: 1,   serving: 30  },
    { name: 'Albumina (scoop)',        cal: 112, prot: 24,   carb: 1,    fat: 1,   serving: 30  },
    { name: 'Hipercalórico (scoop)',   cal: 400, prot: 15,   carb: 75,   fat: 5,   serving: 100 },
    { name: 'Barra de proteína',       cal: 200, prot: 20,   carb: 20,   fat: 5,   serving: 60  },
    { name: 'BCAA (dose)',             cal: 20,  prot: 5,    carb: 0,    fat: 0,   serving: 5   },
    { name: 'Creatina (dose)',         cal: 0,   prot: 0,    carb: 0,    fat: 0,   serving: 5   },
  ],
  fastfood: [
    { name: 'Pizza (fatia média)',     cal: 266, prot: 11,   carb: 34,   fat: 10,  serving: 107 },
    { name: 'Hambúrguer simples',      cal: 295, prot: 17,   carb: 24,   fat: 14,  serving: 150 },
    { name: 'X-Burguer',              cal: 395, prot: 22,   carb: 30,   fat: 19,  serving: 185 },
    { name: 'Batata frita (P)',        cal: 300, prot: 3.4,  carb: 39,   fat: 15,  serving: 114 },
    { name: 'Batata frita (G)',        cal: 490, prot: 5.6,  carb: 64,   fat: 24,  serving: 187 },
    { name: 'Hot Dog',                 cal: 290, prot: 11,   carb: 31,   fat: 15,  serving: 130 },
    { name: 'Frango frito (2 pc)',     cal: 494, prot: 38,   carb: 32,   fat: 23,  serving: 213 },
    { name: 'Refrigerante (lata)',     cal: 150, prot: 0,    carb: 38,   fat: 0,   serving: 350 },
    { name: 'Suco de laranja (200ml)', cal: 92,  prot: 1.3,  carb: 21,   fat: 0.2, serving: 200 },
    { name: 'Milk-shake (300ml)',      cal: 360, prot: 8,    carb: 54,   fat: 12,  serving: 300 },
    { name: 'Sorvete (bola)',          cal: 207, prot: 3.5,  carb: 24,   fat: 11,  serving: 100 },
    { name: 'Chocolate ao leite',      cal: 535, prot: 7,    carb: 60,   fat: 30,  serving: 30  },
  ],
};

const DT_DAYS      = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const DT_DAYS_FULL = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];

// ── State ─────────────────────────────────────────────────────────────────────
let dtState         = null;
let dtTemplates     = {};
let dtEditingDow    = null;
let dtplFoods       = [];
let dtActiveMeal    = null;
let dtActiveFoodCat = null;
let dtSelectedFood  = null;
// Tracking
let dtTrackDow      = null;
let dtTrackFoods    = [];   // template foods + .done flag
// Registrar food calc
let activeFoodCat   = null;
let selectedFood    = null;
// Extra panel state
let dtExtraCat  = null;
let dtExtraFood = null;

// ── Utils (moved to data file for early availability) ───────────────────────────
function computeTotals(foods) {
  const t = { cal: 0, prot: 0, carb: 0, fat: 0 };
  foods.forEach(f => {
    t.cal  += f.calories || 0;
    t.prot += f.protein  || 0;
    t.carb += f.carbs    || 0;
    t.fat  += f.fat      || 0;
  });
  return { cal: Math.round(t.cal), prot: round1(t.prot), carb: round1(t.carb), fat: round1(t.fat) };
}

function fmtDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
window.fmtDate = fmtDate;

function round1(n) { return Math.round(n * 10) / 10; }

function escDiet(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
  );
}
