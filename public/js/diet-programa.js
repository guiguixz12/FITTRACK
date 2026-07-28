
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

    const tots    = computeTotals(tpl.foods || []);
    const calFmt  = tots.cal.toLocaleString('pt-BR');

    // meal tiles 2×2
    const mealTiles = MEALS.map(m => {
      const mf   = (tpl.foods || []).filter(f => f.meal === m.id);
      const kcal = mf.length ? computeTotals(mf).cal : 0;
      if (!kcal) return '';
      return `<div class="dt-meal-tile dt-meal-tile--${m.id}">
        <div class="dt-meal-tile-icon">${m.icon}</div>
        <div>
          <span class="dt-meal-tile-name">${m.label}</span>
          <span class="dt-meal-tile-kcal">${kcal} kcal</span>
        </div>
      </div>`;
    }).filter(Boolean).join('');

    if (isToday) {
      const RING_C    = 201.06;
      const targetCal = dtState?.target_calories || 2000;
      const dashOff   = (RING_C * (1 - Math.min(tots.cal / targetCal, 1))).toFixed(2);

      const protKcal = tots.prot * 4;
      const carbKcal = tots.carb * 4;
      const fatKcal  = tots.fat  * 9;
      const macroMax = Math.max(protKcal, carbKcal, fatKcal) || 1;
      const protPct  = Math.round(protKcal / macroMax * 100);
      const carbPct  = Math.round(carbKcal / macroMax * 100);
      const fatPct   = Math.round(fatKcal  / macroMax * 100);

      return `${sectionLabel}
        <div class="day-card is-today">
          <div class="day-header">
            <span class="day-dow today">${DT_DAYS[dow]}</span>
            <span class="day-name-text" style="flex:1">${DT_DAYS_FULL[dow]} — ${escDiet(tpl.name || 'Descanso')}</span>
            <button class="btn btn-ghost btn-sm" onclick="openDtEditDay(${dow})">Editar</button>
            <button class="btn btn-ghost btn-sm dt-icon-btn" onclick="copyDtTemplate(${dow})" title="Copiar">${ICON.copy}</button>
          </div>
          <div class="day-body">
            <div class="dt-macro-hero">
              <div class="dt-macro-ring-wrap">
                <svg class="dt-macro-ring-svg" viewBox="0 0 80 80">
                  <circle class="dt-ring-track" cx="40" cy="40" r="32"/>
                  <circle class="dt-ring-fill" cx="40" cy="40" r="32"
                    transform="rotate(-90 40 40)"
                    stroke-dasharray="${RING_C}"
                    stroke-dashoffset="${dashOff}"/>
                </svg>
                <div class="dt-ring-center">
                  <span class="dt-ring-cal">${calFmt}</span>
                  <span class="dt-ring-unit">kcal</span>
                </div>
              </div>
              <div class="dt-macro-bars">
                <div class="dt-mbar-row">
                  <span class="dt-mbar-dot dt-mbar-dot--prot"></span>
                  <span class="dt-mbar-label">Prot</span>
                  <div class="dt-mbar-track"><div class="dt-mbar-fill dt-mbar-fill--prot" style="width:${protPct}%"></div></div>
                  <span class="dt-mbar-val">${tots.prot}g</span>
                </div>
                <div class="dt-mbar-row">
                  <span class="dt-mbar-dot dt-mbar-dot--carb"></span>
                  <span class="dt-mbar-label">Carb</span>
                  <div class="dt-mbar-track"><div class="dt-mbar-fill dt-mbar-fill--carb" style="width:${carbPct}%"></div></div>
                  <span class="dt-mbar-val">${tots.carb}g</span>
                </div>
                <div class="dt-mbar-row">
                  <span class="dt-mbar-dot dt-mbar-dot--fat"></span>
                  <span class="dt-mbar-label">Gord</span>
                  <div class="dt-mbar-track"><div class="dt-mbar-fill dt-mbar-fill--fat" style="width:${fatPct}%"></div></div>
                  <span class="dt-mbar-val">${tots.fat}g</span>
                </div>
              </div>
            </div>
            ${mealTiles ? `<div class="dt-meal-grid">${mealTiles}</div>` : ''}
            <div class="day-actions">
              <button class="btn btn-primary" style="flex:1" onclick="openDtTrack(${dow})">Acompanhar hoje</button>
            </div>
          </div>
        </div>`;
    }

    const mealShorts = ['Café', 'Almoço', 'Lanche', 'Jantar'];
    const mealRows = MEALS.map((m, i) => {
      const mf   = (tpl.foods || []).filter(f => f.meal === m.id);
      const kcal = mf.length ? computeTotals(mf).cal : 0;
      return `<div class="dt-expand-meal-row">
        <div class="dt-expand-meal-icon">${m.icon}</div>
        <div class="dt-expand-meal-name">${mealShorts[i]}</div>
        <div class="dt-expand-meal-kcal">${kcal} kcal</div>
      </div>`;
    }).join('');

    return `${sectionLabel}
      <div class="day-card day-card--compact">
        <div class="day-header" onclick="toggleDtDay(${dow})">
          <span class="day-dow">${DT_DAYS[dow]}</span>
          <span class="day-name-text" style="flex:1">${DT_DAYS_FULL[dow]} — ${escDiet(tpl.name || 'Descanso')}</span>
          <span class="compact-kcal">${calFmt} kcal</span>
          <svg id="dtChevron-${dow}" class="dt-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        <div id="dtDayExpand-${dow}" class="dt-day-expand" style="display:none">
          ${mealRows}
          <div class="dt-expand-actions">
            <button class="btn btn-ghost btn-sm" onclick="openDtEditDay(${dow})">Editar</button>
            <button class="btn btn-ghost btn-sm dt-icon-btn" onclick="copyDtTemplate(${dow})" title="Copiar">${ICON.copy}</button>
          </div>
        </div>
      </div>`;
  }).join('');

  const anyPlan = Object.values(dtTemplates).some(t => t && (t.name || t.foods?.length));
  const suggestEl = document.getElementById('dietPlanSuggest');
  if (suggestEl) suggestEl.style.display = anyPlan ? 'none' : '';
}

function toggleDtDay(dow) {
  const expand  = document.getElementById('dtDayExpand-' + dow);
  const chevron = document.getElementById('dtChevron-' + dow);
  if (!expand) return;
  const isOpen = expand.style.display !== 'none';
  expand.style.display = isOpen ? 'none' : '';
  if (chevron) chevron.classList.toggle('open', !isOpen);
}
window.toggleDtDay = toggleDtDay;

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
