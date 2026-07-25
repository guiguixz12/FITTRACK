
// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
function initDiet(state) {
  dtState = state;
  document.querySelectorAll('#tab-diet .sub-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.dtview === 'registrar') switchDtView('registrar');
      else if (btn.dataset.dtview === 'historico') switchDtView('historico');
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
  ['programa','editDay','track','registrar','historico'].forEach(v => {
    const id = { programa:'dtViewPrograma', editDay:'dtViewEditDay', track:'dtViewTrack', registrar:'dtViewRegistrar', historico:'dtViewHistorico' }[v];
    const el = document.getElementById(id);
    if (el) el.style.display = v === view ? '' : 'none';
  });
  document.querySelectorAll('#tab-diet .sub-tab').forEach(b => {
    b.classList.toggle('active',
      (b.dataset.dtview === 'programa'  && ['programa','editDay','track'].includes(view)) ||
      (b.dataset.dtview === 'registrar' && view === 'registrar') ||
      (b.dataset.dtview === 'historico' && view === 'historico')
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
  const chevron = `<svg class="dt-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

  grid.innerHTML = order.map((dow, idx) => {
    const tpl     = dtTemplates[dow];
    const isToday = dow === today;
    const hasPlan = tpl && (tpl.name || tpl.foods?.length);

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
              <span class="day-name-text rest" style="flex:1">${DT_DAYS_FULL[dow]} — Descanso</span>
              <button class="btn btn-ghost btn-sm" onclick="openDtEditDay(${dow})">Editar</button>
            </div>
          </div>`;
      }
      return `${sectionLabel}
        <div class="day-card day-card--compact" onclick="openDtEditDay(${dow})">
          <div class="day-header">
            <span class="day-dow">${DT_DAYS[dow]}</span>
            <span class="day-name-text rest" style="flex:1">${DT_DAYS_FULL[dow]} — Descanso</span>
            ${chevron}
          </div>
        </div>`;
    }

    const tots = computeTotals(tpl.foods || []);
    const calFmt = tots.cal.toLocaleString('pt-BR');

    const mealCards = MEALS.map(m => {
      const mf   = (tpl.foods || []).filter(f => f.meal === m.id);
      const kcal = mf.length ? computeTotals(mf).cal : 0;
      return `<div class="dt-meal-card">
        <div class="dt-meal-card-icon">${m.icon}</div>
        <div class="dt-meal-card-kcal">${kcal} kcal</div>
      </div>`;
    }).join('');

    if (isToday) {
      return `${sectionLabel}
        <div class="day-card is-today">
          <div class="day-header">
            <span class="day-dow today">${DT_DAYS[dow]}</span>
            <span class="day-name-text" style="flex:1">${DT_DAYS_FULL[dow]} — ${escDiet(tpl.name || 'Descanso')}</span>
            <button class="btn btn-ghost btn-sm" onclick="openDtEditDay(${dow})">Editar</button>
            <button class="btn btn-ghost btn-sm dt-icon-btn" onclick="copyDtTemplate(${dow})" title="Copiar">${ICON.copy}</button>
          </div>
          <div class="day-body">
            <div class="diet-day-macros">
              <div class="diet-day-macro cal"><div class="diet-day-macro-val">${calFmt}</div><div class="diet-day-macro-label">kcal</div></div>
              <div class="diet-day-macro prot"><div class="diet-day-macro-val">${tots.prot}g</div><div class="diet-day-macro-label">Prot</div></div>
              <div class="diet-day-macro carb"><div class="diet-day-macro-val">${tots.carb}g</div><div class="diet-day-macro-label">Carb</div></div>
              <div class="diet-day-macro fat"><div class="diet-day-macro-val">${tots.fat}g</div><div class="diet-day-macro-label">Gord</div></div>
            </div>
            <div class="dt-meal-cards">${mealCards}</div>
            <div class="day-actions">
              <button class="btn btn-primary" style="flex:1" onclick="openDtTrack(${dow})">Acompanhar hoje</button>
            </div>
          </div>
        </div>`;
    }

    return `${sectionLabel}
      <div class="day-card day-card--compact" onclick="openDtTrack(${dow})">
        <div class="day-header">
          <span class="day-dow">${DT_DAYS[dow]}</span>
          <span class="day-name-text" style="flex:1">${DT_DAYS_FULL[dow]} — ${escDiet(tpl.name || 'Descanso')}</span>
          <span class="compact-kcal">${calFmt} kcal</span>
          ${chevron}
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
