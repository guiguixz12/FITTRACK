/* ═══════════════════════════════════════════
   Diet — programa semanal + acompanhamento do dia
   ═══════════════════════════════════════════ */

const MEALS = [
  { id: 'cafe_manha', label: 'Café da Manhã', icon: '🌅' },
  { id: 'almoco',     label: 'Almoço',        icon: '🍽️' },
  { id: 'cafe_tarde', label: 'Café da Tarde', icon: '☕' },
  { id: 'janta',      label: 'Jantar',        icon: '🌙' },
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

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
function initDiet(state) {
  dtState = state;
  document.querySelectorAll('#tab-diet .sub-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.dtview === 'registrar') switchDtView('registrar');
      else switchDtView('programa');
    });
  });
  setupDtEditDay();
  setupDtFoodCalc();
  setupDtTrack(state);
  setupDtTrackExtraPanel();
  setupRegistrar(state);
  initFoodCalc();
}

function switchDtView(view) {
  ['programa','editDay','track','registrar'].forEach(v => {
    const id = { programa:'dtViewPrograma', editDay:'dtViewEditDay', track:'dtViewTrack', registrar:'dtViewRegistrar' }[v];
    document.getElementById(id).style.display = v === view ? '' : 'none';
  });
  document.querySelectorAll('#tab-diet .sub-tab').forEach(b => {
    b.classList.toggle('active',
      (b.dataset.dtview === 'programa'  && ['programa','editDay','track'].includes(view)) ||
      (b.dataset.dtview === 'registrar' && view === 'registrar')
    );
  });
}

// ══════════════════════════════════════════
//  PROGRAMA SEMANAL
// ══════════════════════════════════════════
async function loadDiet(state) {
  dtState = state;
  switchDtView('programa');
  await loadDietWeekGrid();
}

async function loadDietWeekGrid() {
  const { templates } = await api.get('/api/diet-templates');
  dtTemplates = {};
  (templates || []).forEach(t => { dtTemplates[t.day_of_week] = t; });
  renderDietWeekGrid();
}

function renderDietWeekGrid() {
  const today = new Date().getDay();
  const order = Array.from({ length: 7 }, (_, i) => (today + i) % 7);
  const grid  = document.getElementById('dietWeekGrid');

  grid.innerHTML = order.map((dow, idx) => {
    const tpl     = dtTemplates[dow];
    const isToday = dow === today;
    const hasPlan = tpl && (tpl.name || tpl.foods?.length);

    // Section dividers
    const sectionLabel = isToday
      ? `<div class="week-section-label today-label">— Hoje —</div>`
      : idx === 1
        ? `<div class="week-section-label">Próximos dias</div>`
        : '';

    if (!hasPlan) {
      return `${sectionLabel}
        <div class="day-card${isToday ? ' is-today' : ''}">
          <div class="day-header">
            <span class="day-dow${isToday ? ' today' : ''}">${DT_DAYS[dow]}</span>
            <span class="day-name-text rest">Dia livre</span>
            <button class="btn btn-ghost btn-sm" onclick="openDtEditDay(${dow})">Editar</button>
          </div>
        </div>`;
    }

    const tots  = computeTotals(tpl.foods || []);
    const mealPreviews = MEALS.map(m => {
      const mf = (tpl.foods || []).filter(f => f.meal === m.id);
      if (!mf.length) return '';
      return `<span class="dt-meal-pill">${m.icon} ${computeTotals(mf).cal} kcal</span>`;
    }).join('');

    const trackBtn = isToday
      ? `<button class="btn btn-primary" style="flex:1" onclick="openDtTrack(${dow})">Acompanhar hoje</button>`
      : `<button class="btn btn-secondary btn-sm" onclick="openDtTrack(${dow})">Ver plano</button>`;

    return `${sectionLabel}
      <div class="day-card${isToday ? ' is-today' : ''}">
        <div class="day-header">
          <span class="day-dow${isToday ? ' today' : ''}">${DT_DAYS[dow]}</span>
          <span class="day-name-text">${escDiet(tpl.name || 'Sem nome')}</span>
          <button class="btn btn-ghost btn-sm" onclick="openDtEditDay(${dow})">Editar</button>
          <button class="btn btn-ghost btn-sm" onclick="copyDtTemplate(${dow})" title="Copiar para outro dia">${ICON.copy}</button>
        </div>
        <div class="day-body">
          <div class="diet-day-macros">
            <div class="diet-day-macro cal"><div class="diet-day-macro-val">${tots.cal}</div><div class="diet-day-macro-label">kcal</div></div>
            <div class="diet-day-macro prot"><div class="diet-day-macro-val">${tots.prot}g</div><div class="diet-day-macro-label">Prot</div></div>
            <div class="diet-day-macro carb"><div class="diet-day-macro-val">${tots.carb}g</div><div class="diet-day-macro-label">Carb</div></div>
            <div class="diet-day-macro fat"><div class="diet-day-macro-val">${tots.fat}g</div><div class="diet-day-macro-label">Gord</div></div>
          </div>
          ${mealPreviews ? `<div class="dt-meal-pills">${mealPreviews}</div>` : ''}
          <div class="day-actions">${trackBtn}</div>
        </div>
      </div>`;
  }).join('');
}

async function copyDtTemplate(fromDow) {
  const src = dtTemplates[fromDow];
  if (!src) return;

  const otherDays = DT_DAYS_FULL
    .map((label, dow) => dow !== fromDow ? { dow, label, hasTemplate: !!dtTemplates[dow] } : null)
    .filter(Boolean);

  const selected = await showDayCopyModal(src.name || DT_DAYS_FULL[fromDow], otherDays);
  if (!selected || !selected.length) return;

  try {
    await Promise.all(selected.map(toDow =>
      api.put(`/api/diet-templates/${toDow}`, {
        name:  src.name,
        foods: (src.foods || []).map(f => ({
          meal:       f.meal,
          name:       f.name,
          quantity_g: f.quantity_g,
          calories:   f.calories,
          protein:    f.protein,
          carbs:      f.carbs,
          fat:        f.fat,
        }))
      })
    ));
    toast(`Programa copiado para ${selected.length} dia(s)!`);
    await loadDietWeekGrid();
  } catch (err) { toast(err.message, 'error'); }
}
window.copyDtTemplate = copyDtTemplate;

// ══════════════════════════════════════════
//  ACOMPANHAR DIA (checklist persistente)
// ══════════════════════════════════════════
function openDtTrack(dow) {
  dtTrackDow = dow;
  const tpl  = dtTemplates[dow];
  const isToday = dow === new Date().getDay();
  const date    = getDateForDow(dow);

  // Build food list with done state restored from localStorage
  const saved = loadTrackState(date);
  dtTrackFoods = (tpl?.foods || []).map((f, i) => ({ ...f, done: saved.includes(i) }));

  // Header
  document.getElementById('dtTrackTitle').textContent = tpl?.name || DT_DAYS_FULL[dow];
  document.getElementById('dtTrackDate').textContent  = isToday
    ? 'Hoje — ' + new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    : DT_DAYS_FULL[dow] + ' — plano semanal';

  // Save button label
  const saveBtn = document.getElementById('dtTrackSaveBtn');
  saveBtn.textContent = isToday
    ? 'Salvar no diário de hoje'
    : `Registrar em ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`;

  renderDtTrackMeals();
  switchDtView('track');
}
window.openDtTrack = openDtTrack;

function renderDtTrackMeals() {
  const done      = dtTrackFoods.filter(f => f.done);
  const doneTots  = computeTotals(done);
  const totalTots = computeTotals(dtTrackFoods);
  const pct       = totalTots.cal > 0
    ? Math.min(Math.round((doneTots.cal / totalTots.cal) * 100), 100)
    : 0;

  // Progress card
  document.getElementById('dtTrackCalEaten').textContent = doneTots.cal;
  document.getElementById('dtTrackCalTotal').textContent  = totalTots.cal;
  document.getElementById('dtTrackBar').style.width       = pct + '%';
  document.getElementById('dtTrackFoodCount').textContent = `${done.length} / ${dtTrackFoods.length} alimentos`;
  document.getElementById('dtTrackMacros').textContent    = done.length
    ? `${doneTots.prot}g prot · ${doneTots.carb}g carb · ${doneTots.fat}g gord`
    : '';

  // Meal sections
  const el = document.getElementById('dtTrackMeals');
  el.innerHTML = MEALS.map(meal => {
    const foods = dtTrackFoods.filter(f => f.meal === meal.id);
    if (!foods.length) return '';

    const mealDone = computeTotals(foods.filter(f => f.done));
    const mealTot  = computeTotals(foods);
    const allDone  = foods.every(f => f.done);

    const foodsHtml = foods.map(f => {
      const gi        = dtTrackFoods.indexOf(f);
      const extraBadge = f.extra ? `<span class="dt-extra-badge">extra</span>` : '';
      return `
        <div class="dt-track-food${f.done ? ' done' : ''}${f.extra ? ' extra' : ''}" onclick="toggleDtTrackFood(${gi})">
          <div class="dt-track-check">${f.done ? '✓' : ''}</div>
          <div class="dt-track-food-info">
            <div class="dt-track-food-name">${escDiet(f.name)}${extraBadge}</div>
            <div class="dt-track-food-meta">${f.quantity_g}g · P: ${f.protein}g · C: ${f.carbs}g · G: ${f.fat}g</div>
          </div>
          <div class="dt-track-food-kcal">${f.calories} kcal</div>
        </div>`;
    }).join('');

    const kcalStr = allDone
      ? `<span class="meal-kcal all-done">${mealTot.cal} kcal ✓</span>`
      : `<span class="meal-kcal">${mealDone.cal} / ${mealTot.cal} kcal</span>`;

    return `
      <div class="meal-section">
        <div class="meal-header">
          <span class="meal-icon">${meal.icon}</span>
          <span class="meal-label${allDone ? ' all-done' : ''}">${meal.label}</span>
          ${kcalStr}
        </div>
        <div class="meal-foods">${foodsHtml}</div>
      </div>`;
  }).join('') || '<p class="empty-state">Nenhum alimento neste plano.</p>';

  // Auto-persist to localStorage
  const date  = getDateForDow(dtTrackDow);
  const doneIdxs = dtTrackFoods.map((f, i) => f.done ? i : -1).filter(i => i >= 0);
  saveTrackState(date, doneIdxs);
}

function toggleDtTrackFood(gi) {
  dtTrackFoods[gi].done = !dtTrackFoods[gi].done;
  renderDtTrackMeals();
}
window.toggleDtTrackFood = toggleDtTrackFood;

function setupDtTrack(state) {
  document.getElementById('dtTrackBackBtn').addEventListener('click', () => switchDtView('programa'));

  document.getElementById('dtTrackSaveBtn').addEventListener('click', async () => {
    await saveDtTrackToDiary(state);
  });
}

async function saveDtTrackToDiary(state) {
  const done  = dtTrackFoods.filter(f => f.done);
  const tots  = computeTotals(done);
  const today = new Date().toISOString().slice(0, 10);
  const name  = document.getElementById('dtTrackTitle').textContent;

  if (done.length === 0) {
    const ok = await showConfirmModal({
      title: 'Nenhum alimento marcado',
      body:  'Você não marcou nenhum alimento como comido. Quer salvar <strong>0 kcal</strong> no diário mesmo assim?',
      actions: [
        { label: 'Sim, salvar zerado', value: 'ok',     cls: 'btn-ghost'   },
        { label: 'Cancelar',           value: 'cancel', cls: 'btn-primary'  },
      ]
    });
    if (ok !== 'ok') return;
  }

  // Check for existing record first
  const notes = `${name} — ${done.length}/${dtTrackFoods.length} alimentos`;
  let mode = 'replace';

  try {
    const check = await api.post('/api/diet/logs', { date: today, mode: 'check' });

    if (check.existing && (check.existing.calories > 0 || check.existing.protein > 0)) {
      const ex = check.existing;
      const updatedAt = ex.updated_at
        ? new Date(ex.updated_at).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
        : 'anteriormente';

      mode = await showConfirmModal({
        title: 'Já existe um registro para hoje',
        body:  `Registro existente (salvo em ${updatedAt}):<br>
                <strong>${ex.calories} kcal · ${ex.protein}g prot · ${ex.carbs}g carb · ${ex.fat}g gord</strong><br><br>
                Novos valores do tracking:<br>
                <strong>${tots.cal} kcal · ${tots.prot}g prot · ${tots.carb}g carb · ${tots.fat}g gord</strong>`,
        actions: [
          { label: '➕ Somar ao registro anterior', value: 'merge',   cls: 'btn-primary' },
          { label: '♻️ Substituir pelo tracking',   value: 'replace', cls: 'btn-ghost'   },
          { label: 'Cancelar',                       value: 'cancel',  cls: 'btn-ghost'   },
        ]
      });

      if (mode === 'cancel') return;
    }

    await api.post('/api/diet/logs', {
      date:     today,
      calories: tots.cal,
      protein:  tots.prot,
      carbs:    tots.carb,
      fat:      tots.fat,
      notes,
      mode,
    });

    const label = mode === 'merge' ? 'somados ao diário' : 'salvos no diário';
    toast(`${tots.cal} kcal ${label}!`);
    if (state.date === today) loadDashboard(state);
  } catch (err) { toast(err.message, 'error'); }
}

// Generic promise-based modal. Returns the value of the clicked action button.
function showConfirmModal({ title, body, actions }) {
  return new Promise(resolve => {
    let bg = document.getElementById('_confirmModalBg');
    if (!bg) {
      bg = document.createElement('div');
      bg.id = '_confirmModalBg';
      bg.className = 'confirm-modal-bg';
      bg.innerHTML = `
        <div class="confirm-modal">
          <div class="confirm-modal-title" id="_cmTitle"></div>
          <div class="confirm-modal-body"  id="_cmBody"></div>
          <div class="confirm-modal-actions" id="_cmActions"></div>
        </div>`;
      document.body.appendChild(bg);
    }

    document.getElementById('_cmTitle').textContent = title;
    document.getElementById('_cmBody').innerHTML    = body;

    const actionsEl = document.getElementById('_cmActions');
    actionsEl.innerHTML = '';
    actions.forEach(({ label, value, cls }) => {
      const btn = document.createElement('button');
      btn.className   = `btn ${cls}`;
      btn.textContent = label;
      btn.onclick = () => {
        bg.classList.remove('open');
        resolve(value);
      };
      actionsEl.appendChild(btn);
    });

    bg.classList.add('open');
  });
}

// ── Extra food panel (Track view) ────────────────────────────────────────────
function setupDtTrackExtraPanel() {
  const panel     = document.getElementById('dtTrackAddPanel');
  const toggleBtn = document.getElementById('dtTrackAddExtraBtn');

  toggleBtn.addEventListener('click', () => {
    const open = panel.style.display !== 'none';
    panel.style.display = open ? 'none' : '';
    toggleBtn.textContent = open ? '+ Alimento extra' : '✕ Fechar';
    if (!open) {
      // reset state on open
      dtExtraCat  = null;
      dtExtraFood = null;
      document.querySelectorAll('#dtTrackExtraCats .mg-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('dtTrackExtraChipsWrap').style.display = 'none';
      document.getElementById('dtTrackExtraQtyRow').style.display    = 'none';
      document.getElementById('dtTrackExtraQtyPreview').innerHTML    = '';
    }
  });

  document.getElementById('dtTrackExtraCats').addEventListener('click', e => {
    const btn = e.target.closest('.mg-btn');
    if (!btn) return;
    const cat = btn.dataset.ecat;
    if (dtExtraCat === cat) {
      dtExtraCat  = null;
      dtExtraFood = null;
      btn.classList.remove('active');
      document.getElementById('dtTrackExtraChipsWrap').style.display = 'none';
      document.getElementById('dtTrackExtraQtyRow').style.display    = 'none';
    } else {
      dtExtraCat = cat;
      document.querySelectorAll('#dtTrackExtraCats .mg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderDtExtraChips(cat);
    }
  });

  document.getElementById('dtTrackExtraQty').addEventListener('input', updateDtExtraPreview);

  document.getElementById('dtTrackExtraAddBtn').addEventListener('click', () => {
    if (!dtExtraFood) { toast('Selecione um alimento', 'error'); return; }
    const qty  = parseFloat(document.getElementById('dtTrackExtraQty').value) || 0;
    if (qty <= 0) { toast('Informe a quantidade em gramas', 'error'); return; }
    const meal = document.getElementById('dtTrackExtraMeal').value;
    const f    = qty / 100;

    dtTrackFoods.push({
      meal,
      name:       dtExtraFood.name,
      quantity_g: qty,
      calories:   Math.round(dtExtraFood.cal  * f),
      protein:    round1(dtExtraFood.prot * f),
      carbs:      round1(dtExtraFood.carb * f),
      fat:        round1(dtExtraFood.fat  * f),
      done:       true,   // auto-marked as eaten
      extra:      true,   // visually flagged
    });

    renderDtTrackMeals();
    toast(`${dtExtraFood.name} adicionado!`);

    // reset chip selection
    dtExtraFood = null;
    document.querySelectorAll('#dtTrackExtraChips .food-chip').forEach(c => c.classList.remove('selected'));
    document.getElementById('dtTrackExtraQtyRow').style.display    = 'none';
    document.getElementById('dtTrackExtraQtyPreview').innerHTML    = '';
  });

  document.getElementById('dtTrackExtraCancelBtn').addEventListener('click', () => {
    dtExtraFood = null;
    document.getElementById('dtTrackExtraQtyRow').style.display    = 'none';
    document.querySelectorAll('#dtTrackExtraChips .food-chip').forEach(c => c.classList.remove('selected'));
  });
}

function renderDtExtraChips(cat) {
  document.getElementById('dtTrackExtraChips').innerHTML = (FOOD_LIBRARY[cat] || []).map((food, i) => {
    const ref = food.serving
      ? `${Math.round(food.cal * food.serving / 100)} kcal/porção (${food.serving}g)`
      : `${food.cal} kcal/100g`;
    return `
      <button type="button" class="food-chip" onclick="selectDtExtraChip(${i},'${cat}')">
        <span class="food-chip-name">${escDiet(food.name)}</span>
        <span class="food-chip-cal">${ref}</span>
      </button>`;
  }).join('');
  document.getElementById('dtTrackExtraChipsWrap').style.display = '';
  document.getElementById('dtTrackExtraQtyRow').style.display    = 'none';
  dtExtraFood = null;
}

function selectDtExtraChip(idx, cat) {
  dtExtraFood = FOOD_LIBRARY[cat][idx];
  document.querySelectorAll('#dtTrackExtraChips .food-chip').forEach((c, i) =>
    c.classList.toggle('selected', i === idx)
  );
  document.getElementById('dtTrackExtraQtyInfo').innerHTML =
    `<strong>${escDiet(dtExtraFood.name)}</strong><span class="food-qty-ref">· ${dtExtraFood.cal} kcal / ${dtExtraFood.serving ? dtExtraFood.serving + 'g (porção)' : '100g'}</span>`;
  document.getElementById('dtTrackExtraQty').value = dtExtraFood.serving || 100;
  document.getElementById('dtTrackExtraQtyRow').style.display = '';
  updateDtExtraPreview();
}
window.selectDtExtraChip = selectDtExtraChip;

function updateDtExtraPreview() {
  if (!dtExtraFood) return;
  const qty = parseFloat(document.getElementById('dtTrackExtraQty').value) || 0;
  const f   = qty / 100;
  document.getElementById('dtTrackExtraQtyPreview').innerHTML = qty > 0
    ? `${qty}g → <b style="color:var(--orange)">${Math.round(dtExtraFood.cal*f)} kcal</b> · <span style="color:var(--green)">${round1(dtExtraFood.prot*f)}g prot</span> · <span style="color:var(--blue)">${round1(dtExtraFood.carb*f)}g carb</span> · <span style="color:var(--yellow)">${round1(dtExtraFood.fat*f)}g gord</span>`
    : '';
}

// localStorage persistence (sobrevive a fechar o app)
function trackStorageKey(date) {
  return `dt_${dtState?.user?.id || '0'}_${date}`;
}
function saveTrackState(date, doneIdxs) {
  try { localStorage.setItem(trackStorageKey(date), JSON.stringify(doneIdxs)); } catch {}
}
function loadTrackState(date) {
  try { return JSON.parse(localStorage.getItem(trackStorageKey(date))) || []; } catch { return []; }
}

// Returns the ISO date for the current or most recent occurrence of a given DOW
function getDateForDow(dow) {
  const today = new Date();
  const diff  = (today.getDay() - dow + 7) % 7;
  const d     = new Date(today);
  d.setDate(today.getDate() - (diff === 0 ? 0 : diff));
  return d.toISOString().slice(0, 10);
}

// ══════════════════════════════════════════
//  EDITAR DIA (template por refeição)
// ══════════════════════════════════════════
function openDtEditDay(dow) {
  dtEditingDow    = dow;
  const tpl       = dtTemplates[dow];
  dtplFoods       = tpl ? JSON.parse(JSON.stringify(tpl.foods || [])) : [];
  dtActiveMeal    = null;
  dtActiveFoodCat = null;
  dtSelectedFood  = null;

  document.getElementById('dtEditDayTitle').textContent      = DT_DAYS_FULL[dow];
  document.getElementById('dtplName').value                  = tpl?.name || '';
  document.getElementById('dtFoodCalcCard').style.display    = 'none';
  document.getElementById('dtFoodChipsWrap').style.display   = 'none';
  document.getElementById('dtFoodQtyRow').style.display      = 'none';

  renderDtplMealSections();
  switchDtView('editDay');
}
window.openDtEditDay = openDtEditDay;

function renderDtplMealSections() {
  document.getElementById('dtplMealSections').innerHTML = MEALS.map(meal => {
    const foods    = dtplFoods.filter(f => f.meal === meal.id);
    const tots     = computeTotals(foods);
    const isActive = dtActiveMeal === meal.id;

    const foodsHtml = foods.length
      ? foods.map(f => {
          const gi = dtplFoods.indexOf(f);
          return `
            <div class="diet-food-item">
              <div class="diet-food-info">
                <div class="diet-food-name">${escDiet(f.name)}</div>
                <div class="diet-food-meta">${f.quantity_g}g · ${f.protein}g prot · ${f.carbs}g carb · ${f.fat}g gord</div>
              </div>
              <div class="diet-food-kcal">${f.calories} kcal</div>
              <button class="btn btn-icon btn-ghost" onclick="dtplRemoveFood(${gi})">${ICON.trash}</button>
            </div>`;
        }).join('')
      : `<div style="color:var(--text-faint);font-size:.8rem;padding:6px 0;text-align:center">Nenhum alimento</div>`;

    return `
      <div class="meal-section">
        <div class="meal-header">
          <span class="meal-icon">${meal.icon}</span>
          <span class="meal-label">${meal.label}</span>
          <span class="meal-kcal">${tots.cal > 0 ? tots.cal + ' kcal' : ''}</span>
          <button class="btn btn-ghost btn-sm" style="flex-shrink:0${isActive ? ';color:var(--orange)' : ''}"
            onclick="openMealAdd('${meal.id}')">
            ${isActive ? '▲ Fechar' : '+ Add'}
          </button>
        </div>
        <div class="meal-foods">${foodsHtml}</div>
      </div>`;
  }).join('');

  const tots = computeTotals(dtplFoods);
  const totEl = document.getElementById('dtplTotals');
  if (dtplFoods.length) {
    totEl.style.display = '';
    totEl.innerHTML = `
      <div class="dtpl-totals-row">
        <span class="dtpl-total-chip cal">${tots.cal} kcal total</span>
        <span class="dtpl-total-chip prot">${tots.prot}g prot</span>
        <span class="dtpl-total-chip carb">${tots.carb}g carb</span>
        <span class="dtpl-total-chip fat">${tots.fat}g gord</span>
      </div>`;
  } else {
    totEl.style.display = 'none';
  }
}

function openMealAdd(mealId) {
  const calcCard = document.getElementById('dtFoodCalcCard');
  if (dtActiveMeal === mealId && calcCard.style.display !== 'none') {
    dtActiveMeal = null;
    calcCard.style.display = 'none';
    renderDtplMealSections();
    return;
  }
  dtActiveMeal = mealId;
  const meal   = MEALS.find(m => m.id === mealId);
  document.getElementById('dtFoodCalcMealLabel').textContent = `${meal.icon} ${meal.label}`;

  dtSelectedFood  = null;
  dtActiveFoodCat = null;
  document.querySelectorAll('#dtFoodCats .mg-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('dtFoodChipsWrap').style.display = 'none';
  document.getElementById('dtFoodQtyRow').style.display    = 'none';
  document.getElementById('dtFoodChips').innerHTML         = '';

  calcCard.style.display = '';
  calcCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  renderDtplMealSections();
}
window.openMealAdd = openMealAdd;

function setupDtEditDay() {
  document.getElementById('dtBackBtn').addEventListener('click', () => {
    dtActiveMeal = null;
    document.getElementById('dtFoodCalcCard').style.display = 'none';
    switchDtView('programa');
  });

  document.getElementById('dtplSaveBtn').addEventListener('click', async () => {
    const name = document.getElementById('dtplName').value.trim();
    if (!name && dtplFoods.length === 0) { toast('Adicione um nome ou alimentos', 'error'); return; }
    try {
      await api.put(`/api/diet-templates/${dtEditingDow}`, { name, foods: dtplFoods });
      toast('Programa salvo!');
      dtActiveMeal = null;
      document.getElementById('dtFoodCalcCard').style.display = 'none';
      await loadDietWeekGrid();
      switchDtView('programa');
    } catch (err) { toast(err.message, 'error'); }
  });

  document.getElementById('dtplFreeDayBtn').addEventListener('click', async () => {
    if (!confirm('Marcar este dia como dia livre?')) return;
    try {
      await api.del(`/api/diet-templates/${dtEditingDow}`);
      toast('Marcado como dia livre');
      await loadDietWeekGrid();
      switchDtView('programa');
    } catch (err) { toast(err.message, 'error'); }
  });
}

// ── Template food calculator ──────────────────────────────────────────────────
function setupDtFoodCalc() {
  document.getElementById('dtFoodCats').addEventListener('click', e => {
    const btn = e.target.closest('.mg-btn');
    if (!btn) return;
    const cat = btn.dataset.cat;
    if (dtActiveFoodCat === cat) {
      dtActiveFoodCat = null;
      btn.classList.remove('active');
      document.getElementById('dtFoodChipsWrap').style.display = 'none';
      document.getElementById('dtFoodQtyRow').style.display    = 'none';
      dtSelectedFood = null;
    } else {
      dtActiveFoodCat = cat;
      document.querySelectorAll('#dtFoodCats .mg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderDtFoodChips(cat);
    }
  });

  document.getElementById('dtFoodQty').addEventListener('input', updateDtFoodPreview);

  document.getElementById('dtFoodAddBtn').addEventListener('click', () => {
    if (!dtActiveMeal)    { toast('Selecione uma refeição', 'error'); return; }
    if (!dtSelectedFood)  { toast('Selecione um alimento', 'error'); return; }
    const qty = parseFloat(document.getElementById('dtFoodQty').value) || 0;
    if (qty <= 0)         { toast('Informe a quantidade em gramas', 'error'); return; }

    const f = qty / 100;
    dtplFoods.push({
      meal:       dtActiveMeal,
      name:       dtSelectedFood.name,
      quantity_g: qty,
      calories:   Math.round(dtSelectedFood.cal  * f),
      protein:    round1(dtSelectedFood.prot * f),
      carbs:      round1(dtSelectedFood.carb * f),
      fat:        round1(dtSelectedFood.fat  * f),
    });

    dtSelectedFood = null;
    document.getElementById('dtFoodQtyRow').style.display = 'none';
    document.querySelectorAll('#dtFoodChips .food-chip').forEach(c => c.classList.remove('selected'));
    document.getElementById('dtFoodQtyPreview').innerHTML = '';
    renderDtplMealSections();
    toast('Adicionado!');
  });

  document.getElementById('dtFoodCancelBtn').addEventListener('click', () => {
    dtSelectedFood = null;
    document.getElementById('dtFoodQtyRow').style.display = 'none';
    document.querySelectorAll('#dtFoodChips .food-chip').forEach(c => c.classList.remove('selected'));
  });
}

function renderDtFoodChips(cat) {
  document.getElementById('dtFoodChips').innerHTML = (FOOD_LIBRARY[cat] || []).map((food, i) => {
    const ref = food.serving
      ? `${Math.round(food.cal * food.serving / 100)} kcal/porção (${food.serving}g)`
      : `${food.cal} kcal/100g`;
    return `
      <button type="button" class="food-chip" onclick="selectDtFoodChip(${i},'${cat}')">
        <span class="food-chip-name">${escDiet(food.name)}</span>
        <span class="food-chip-cal">${ref}</span>
      </button>`;
  }).join('');
  document.getElementById('dtFoodChipsWrap').style.display = '';
  document.getElementById('dtFoodQtyRow').style.display    = 'none';
  dtSelectedFood = null;
}

function selectDtFoodChip(idx, cat) {
  dtSelectedFood = FOOD_LIBRARY[cat][idx];
  document.querySelectorAll('#dtFoodChips .food-chip').forEach((c, i) =>
    c.classList.toggle('selected', i === idx)
  );
  document.getElementById('dtFoodQtyInfo').innerHTML =
    `<strong>${escDiet(dtSelectedFood.name)}</strong><span class="food-qty-ref">· ${dtSelectedFood.cal} kcal / ${dtSelectedFood.serving ? dtSelectedFood.serving + 'g (porção)' : '100g'}</span>`;
  document.getElementById('dtFoodQty').value = dtSelectedFood.serving || 100;
  document.getElementById('dtFoodQtyRow').style.display = '';
  updateDtFoodPreview();
}
window.selectDtFoodChip = selectDtFoodChip;

function updateDtFoodPreview() {
  if (!dtSelectedFood) return;
  const qty = parseFloat(document.getElementById('dtFoodQty').value) || 0;
  const f   = qty / 100;
  document.getElementById('dtFoodQtyPreview').innerHTML = qty > 0
    ? `${qty}g → <b style="color:var(--orange)">${Math.round(dtSelectedFood.cal*f)} kcal</b> &nbsp;|&nbsp; <span style="color:var(--green)">${round1(dtSelectedFood.prot*f)}g prot</span> &nbsp;|&nbsp; <span style="color:var(--blue)">${round1(dtSelectedFood.carb*f)}g carb</span> &nbsp;|&nbsp; <span style="color:var(--yellow)">${round1(dtSelectedFood.fat*f)}g gord</span>`
    : '';
}

function dtplRemoveFood(gi) {
  dtplFoods.splice(gi, 1);
  renderDtplMealSections();
}
window.dtplRemoveFood = dtplRemoveFood;

// ══════════════════════════════════════════
//  REGISTRAR (manual)
// ══════════════════════════════════════════
function setupRegistrar(state) {
  document.getElementById('dietDate').value = state.date;
  document.getElementById('dietDate').addEventListener('change', async e => {
    await prefillDietForm(e.target.value);
  });
  document.getElementById('dietForm').addEventListener('submit', async e => {
    e.preventDefault();
    const date   = document.getElementById('dietDate').value;
    const weight = parseFloat(document.getElementById('dietWeight').value);
    if (!date) return;
    try {
      await api.post('/api/diet/logs', {
        date,
        calories: parseInt(document.getElementById('dietCalories').value) || 0,
        protein:  parseFloat(document.getElementById('dietProt').value)   || 0,
        carbs:    parseFloat(document.getElementById('dietCarb').value)   || 0,
        fat:      parseFloat(document.getElementById('dietFat').value)    || 0,
        notes:    document.getElementById('dietNotes').value
      });
      if (!isNaN(weight) && weight > 0)
        await api.post('/api/diet/weight', { date, weight_kg: weight });
      toast('Dieta salva!');
      await loadDietHistory();
    } catch (err) { toast(err.message, 'error'); }
  });
}

// ── Registrar food calculator ─────────────────────────────────────────────────
function initFoodCalc() {
  document.getElementById('foodCats').addEventListener('click', e => {
    const btn = e.target.closest('.mg-btn');
    if (!btn) return;
    const cat = btn.dataset.cat;
    if (activeFoodCat === cat) {
      activeFoodCat = null;
      btn.classList.remove('active');
      hideFoodChips();
    } else {
      activeFoodCat = cat;
      document.querySelectorAll('#foodCats .mg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFoodChips(cat);
    }
  });
  document.getElementById('foodQty').addEventListener('input', updateFoodPreview);
  document.getElementById('foodAddBtn').addEventListener('click', addFoodToForm);
  document.getElementById('foodCancelBtn').addEventListener('click', () => {
    selectedFood = null;
    document.getElementById('foodQtyRow').style.display = 'none';
    document.querySelectorAll('#foodChips .food-chip').forEach(c => c.classList.remove('selected'));
  });
}

function renderFoodChips(cat) {
  document.getElementById('foodChips').innerHTML = (FOOD_LIBRARY[cat] || []).map((food, i) => {
    const ref = food.serving
      ? `${Math.round(food.cal * food.serving / 100)} kcal/porção (${food.serving}g)`
      : `${food.cal} kcal/100g`;
    return `
      <button type="button" class="food-chip" onclick="selectFoodChip(${i},'${cat}')">
        <span class="food-chip-name">${escDiet(food.name)}</span>
        <span class="food-chip-cal">${ref}</span>
      </button>`;
  }).join('');
  document.getElementById('foodChipsWrap').style.display = '';
  document.getElementById('foodQtyRow').style.display    = 'none';
  selectedFood = null;
}

function hideFoodChips() {
  document.getElementById('foodChipsWrap').style.display = 'none';
  document.getElementById('foodQtyRow').style.display    = 'none';
  selectedFood = null;
}

function selectFoodChip(idx, cat) {
  selectedFood = FOOD_LIBRARY[cat][idx];
  document.querySelectorAll('#foodChips .food-chip').forEach((c, i) =>
    c.classList.toggle('selected', i === idx)
  );
  document.getElementById('foodQtyInfo').innerHTML =
    `<strong>${escDiet(selectedFood.name)}</strong><span class="food-qty-ref">· ${selectedFood.cal} kcal / ${selectedFood.serving ? selectedFood.serving + 'g (porção)' : '100g'}</span>`;
  document.getElementById('foodQty').value = selectedFood.serving || 100;
  document.getElementById('foodQtyRow').style.display = '';
  updateFoodPreview();
  document.getElementById('foodQtyRow').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
window.selectFoodChip = selectFoodChip;

function updateFoodPreview() {
  if (!selectedFood) return;
  const qty = parseFloat(document.getElementById('foodQty').value) || 0;
  const f   = qty / 100;
  document.getElementById('foodQtyPreview').innerHTML = qty > 0
    ? `${qty}g → <b style="color:var(--orange)">${Math.round(selectedFood.cal*f)} kcal</b> &nbsp;|&nbsp; <span style="color:var(--green)">${round1(selectedFood.prot*f)}g prot</span> &nbsp;|&nbsp; <span style="color:var(--blue)">${round1(selectedFood.carb*f)}g carb</span> &nbsp;|&nbsp; <span style="color:var(--yellow)">${round1(selectedFood.fat*f)}g gord</span>`
    : '';
}

function addFoodToForm() {
  if (!selectedFood) return;
  const qty = parseFloat(document.getElementById('foodQty').value) || 0;
  if (qty <= 0) { toast('Informe a quantidade em gramas', 'error'); return; }
  const f = qty / 100;
  document.getElementById('dietCalories').value = (parseInt(document.getElementById('dietCalories').value) || 0) + Math.round(selectedFood.cal * f);
  document.getElementById('dietProt').value     = round1((parseFloat(document.getElementById('dietProt').value) || 0) + round1(selectedFood.prot * f));
  document.getElementById('dietCarb').value     = round1((parseFloat(document.getElementById('dietCarb').value) || 0) + round1(selectedFood.carb * f));
  document.getElementById('dietFat').value      = round1((parseFloat(document.getElementById('dietFat').value)  || 0) + round1(selectedFood.fat  * f));
  toast(`+${Math.round(selectedFood.cal * f)} kcal · ${selectedFood.name}`);
  selectedFood = null;
  document.getElementById('foodQtyRow').style.display = 'none';
  document.querySelectorAll('#foodChips .food-chip').forEach(c => c.classList.remove('selected'));
}

// ── Diet history ──────────────────────────────────────────────────────────────
async function prefillDietForm(date) {
  const [dietData, weightData] = await Promise.all([
    api.get(`/api/diet/logs?date=${date}`),
    api.get(`/api/diet/weight?date=${date}`)
  ]);
  const log = dietData.log;
  const w   = weightData.log;
  document.getElementById('dietCalories').value = log?.calories || '';
  document.getElementById('dietProt').value     = log?.protein  || '';
  document.getElementById('dietCarb').value     = log?.carbs    || '';
  document.getElementById('dietFat').value      = log?.fat      || '';
  document.getElementById('dietNotes').value    = log?.notes    || '';
  document.getElementById('dietWeight').value   = w?.weight_kg  || '';
}

async function loadDietHistory() {
  const [dietResp, weightResp] = await Promise.all([
    api.get('/api/diet/logs'),
    api.get('/api/diet/weight')
  ]);
  const logs      = dietResp.logs  || [];
  const weightMap = Object.fromEntries((weightResp.logs || []).map(w => [w.date, w]));
  const tbody = document.getElementById('dietHistoryBody');
  if (!logs.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Nenhum registro</td></tr>';
    return;
  }
  tbody.innerHTML = logs.map(log => {
    const w = weightMap[log.date];
    return `
      <tr>
        <td class="date-col">${fmtDate(log.date)}</td>
        <td>${log.calories || 0}</td>
        <td>${log.protein  || 0}g</td>
        <td>${log.carbs    || 0}g</td>
        <td>${log.fat      || 0}g</td>
        <td>${w ? w.weight_kg + 'kg' : '—'}</td>
        <td><button class="btn btn-icon btn-ghost" onclick="deleteDietLog(${log.id},'${log.date}',${w?.id || 'null'})">${ICON.trash}</button></td>
      </tr>`;
  }).join('');
}

async function deleteDietLog(id, date, weightId) {
  if (!confirm(`Deletar registro de ${fmtDate(date)}?`)) return;
  try {
    await api.del(`/api/diet/logs/${id}`);
    if (weightId) await api.del(`/api/diet/weight/${weightId}`);
    toast('Registro removido');
    await loadDietHistory();
  } catch (err) { toast(err.message, 'error'); }
}
window.deleteDietLog = deleteDietLog;

// ── Utils ─────────────────────────────────────────────────────────────────────
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
