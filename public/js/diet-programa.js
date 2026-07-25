
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
      if (isToday) {
        return `${sectionLabel}
          <div class="day-card is-today">
            <div class="day-header">
              <span class="day-dow today">${DT_DAYS[dow]}</span>
              <span class="day-name-text rest">Dia livre</span>
              <button class="btn btn-ghost btn-sm" onclick="openDtEditDay(${dow})">Editar</button>
            </div>
          </div>`;
      }
      return `${sectionLabel}
        <div class="day-card day-card--compact">
          <div class="day-header">
            <span class="day-dow">${DT_DAYS[dow]}</span>
            <span class="day-name-text rest" style="flex:1">Dia livre</span>
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

    // Today: full card with macros and meal pills
    if (isToday) {
      return `${sectionLabel}
        <div class="day-card is-today">
          <div class="day-header">
            <span class="day-dow today">${DT_DAYS[dow]}</span>
            <span class="day-name-text">${escDiet(tpl.name || 'Sem nome')}</span>
            <button class="btn btn-ghost btn-sm" onclick="openDtEditDay(${dow})">Editar</button>
            <button class="btn btn-ghost btn-sm" onclick="copyDtTemplate(${dow})" title="Copiar">${ICON.copy}</button>
          </div>
          <div class="day-body">
            <div class="diet-day-macros">
              <div class="diet-day-macro cal"><div class="diet-day-macro-val">${tots.cal}</div><div class="diet-day-macro-label">kcal</div></div>
              <div class="diet-day-macro prot"><div class="diet-day-macro-val">${tots.prot}g</div><div class="diet-day-macro-label">Prot</div></div>
              <div class="diet-day-macro carb"><div class="diet-day-macro-val">${tots.carb}g</div><div class="diet-day-macro-label">Carb</div></div>
              <div class="diet-day-macro fat"><div class="diet-day-macro-val">${tots.fat}g</div><div class="diet-day-macro-label">Gord</div></div>
            </div>
            ${mealPreviews ? `<div class="dt-meal-pills">${mealPreviews}</div>` : ''}
            <div class="day-actions">
              <button class="btn btn-primary" style="flex:1" onclick="openDtTrack(${dow})">Acompanhar hoje</button>
            </div>
          </div>
        </div>`;
    }

    // Other days: compact single row
    return `${sectionLabel}
      <div class="day-card day-card--compact">
        <div class="day-header">
          <span class="day-dow">${DT_DAYS[dow]}</span>
          <span class="day-name-text" style="flex:1">${escDiet(tpl.name || 'Sem nome')}</span>
          <span class="compact-kcal">${tots.cal} kcal</span>
          <button class="btn btn-ghost btn-sm" onclick="openDtTrack(${dow})">Ver</button>
          <button class="btn btn-ghost btn-sm" onclick="openDtEditDay(${dow})">Editar</button>
          <button class="btn btn-ghost btn-sm" onclick="copyDtTemplate(${dow})" title="Copiar">${ICON.copy}</button>
        </div>
      </div>`;
  }).join('');

  const anyPlan = Object.values(dtTemplates).some(t => t && (t.name || t.foods?.length));
  const suggestEl = document.getElementById('dietPlanSuggest');
  if (suggestEl) suggestEl.style.display = anyPlan ? 'none' : '';
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
