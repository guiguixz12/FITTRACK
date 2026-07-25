// ── State ─────────────────────────────────────────────────────────────────────
let wkState      = null;   // AppState ref
let wkTemplates  = {};     // { [dow]: { id, name, exercises[] } }
let editingDow   = null;   // day being edited
let tplExList    = [];     // exercises in the template editor
let tplActiveMg  = null;   // active muscle group in template editor
let activeMg     = null;   // active muscle group in manual session
let currentWkId  = null;   // current manual session workout id

// Active workout mode


let waExercises    = [];
let waChecked      = 0;
let waTimerInt     = null;
let waStartTime    = null;
let waWorkoutDow   = null;
let waCurrentExIdx = 0;
let waPhase        = 'working'; // 'working' | 'resting'
let waNextLabel    = 'Próxima série';

// Rest timer
let restTimerInt   = null;
let restTimerSecs  = 0;
let waRestTotalSecs = 90;

const WA_RING_R    = 86;
const WA_RING_CIRC = +(2 * Math.PI * WA_RING_R).toFixed(2); // 540.35
const WA_STORE_KEY = 'ft_wk_session';

function waPersist() {
  if (!waStartTime || !waExercises.length) return;
  try {
    localStorage.setItem(WA_STORE_KEY, JSON.stringify({
      startTime:  waStartTime,
      dow:        waWorkoutDow,
      name:       document.getElementById('waTitle')?.textContent || '',
      exercises:  waExercises,
      exIdx:      waCurrentExIdx,
      phase:      waPhase,
    }));
  } catch {}
}

function waClearPersist() {
  localStorage.removeItem(WA_STORE_KEY);
}

function waLoadPersist() {
  try {
    const raw = localStorage.getItem(WA_STORE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (new Date(d.startTime).toISOString().slice(0, 10) !== today) {
      waClearPersist();
      return null;
    }
    return d;
  } catch { return null; }
}

function resumeWaTimerInterval() {
  clearInterval(waTimerInt);
  waTimerInt = setInterval(() => {
    const s  = Math.floor((Date.now() - waStartTime) / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    const el = document.getElementById('waTimer');
    if (el) el.textContent = `${mm}:${ss}`;
  }, 1000);
}

// PR cache for current session [{exercise_name, volume}]
let sessionPRs = [];

// ── Init ──────────────────────────────────────────────────────────────────────
function initWorkouts(state) {
  wkState = state;

  // Sub-tab switching
  document.querySelectorAll('[data-view]').forEach(btn => {
    if (!btn.closest('#tab-workouts')) return;
    btn.addEventListener('click', () => switchWkView(btn.dataset.view));
  });

  setupProgramaView();
  setupEditDayView();
  setupRegistrarView(state);
  setupActiveMode(state);

  // Restore workout if page reloaded mid-session
  const saved = waLoadPersist();
  if (saved) restoreWorkoutSession(saved, state);

  // Restart timer interval when returning from another app
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !waStartTime) return;
    if (document.getElementById('workoutActive')?.style.display === 'none') return;
    resumeWaTimerInterval();
  });
}

function restoreWorkoutSession(saved, state) {
  waWorkoutDow    = saved.dow;
  waExercises     = saved.exercises;
  waCurrentExIdx  = saved.exIdx;
  waPhase         = 'working'; // always return to working phase
  waChecked       = waExercises.filter(e => e.done).length;
  waRestTotalSecs = 90;

  clearInterval(restTimerInt);
  sessionPRs = [];

  document.getElementById('waTitle').textContent      = saved.name;
  document.getElementById('waAddExtra').style.display = 'none';
  document.getElementById('waExtraName').value        = '';

  renderWaFocus();
  updateWaProgress();

  // Resume elapsed timer from saved start time
  waStartTime = saved.startTime;
  resumeWaTimerInterval();

  document.getElementById('workoutActive').style.display = '';
  document.body.style.overflow = 'hidden';

  toast('Treino retomado de onde parou!');
}

function switchWkView(view) {
  document.getElementById('wkViewPrograma').style.display   = view === 'programa'   ? '' : 'none';
  document.getElementById('wkViewEditDay').style.display    = view === 'editDay'    ? '' : 'none';
  document.getElementById('wkViewRegistrar').style.display  = view === 'registrar'  ? '' : 'none';
  document.getElementById('wkViewHistorico').style.display  = view === 'historico'  ? '' : 'none';

  document.querySelectorAll('#tab-workouts .sub-tab').forEach(b => {
    b.classList.toggle('active',
      b.dataset.view === view ||
      (view === 'editDay' && b.dataset.view === 'programa')
    );
  });

  if (view === 'historico') loadWorkoutHistory();
}

// ══════════════════════════════════════════
//  PROGRAMA SEMANAL
// ══════════════════════════════════════════
function setupProgramaView() {
  // no extra listeners needed, render is called on load
}

async function loadWorkouts(state) {
  wkState = state;
  switchWkView('programa');
  await loadWeekGrid();
}

async function loadWeekGrid() {
  const { templates } = await api.get('/api/workout-templates');
  wkTemplates = {};
  (templates || []).forEach(t => { wkTemplates[t.day_of_week] = t; });
  renderWeekGrid();
}

function renderWeekGrid() {
  const today = new Date().getDay();
  const grid  = document.getElementById('weekGrid');

  // Order: today first, then rest of week
  const order = Array.from({length: 7}, (_, i) => (today + i) % 7);

  grid.innerHTML = order.map((dow, idx) => {
    const tpl     = wkTemplates[dow];
    const isToday = dow === today;
    const hasWk   = tpl && tpl.name;

    const sectionLabel = isToday
      ? `<div class="week-section-label today-label">— Hoje —</div>`
      : idx === 1
        ? `<div class="week-section-label">Próximos dias</div>`
        : '';

    if (!hasWk) {
      return `${sectionLabel}
        <div class="day-card${isToday ? ' is-today' : ''}">
          <div class="day-header">
            <span class="day-dow${isToday ? ' today' : ''}">${DAYS[dow]}</span>
            <span class="day-name-text rest">Descanso</span>
            <button class="btn btn-ghost btn-sm" onclick="openEditDay(${dow})">Editar</button>
          </div>
        </div>`;
    }

    const exCount = tpl.exercises?.length || 0;
    const chips   = (tpl.exercises || []).map(ex => {
      const meta = [
        ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : '',
        ex.weight_kg       ? `${ex.weight_kg}kg`      : ''
      ].filter(Boolean).join(' @ ');
      return `<div class="wk-ex-row">
        <span class="wk-ex-name">${escHtml(ex.name)}</span>
        ${meta ? `<span class="wk-ex-meta">${meta}</span>` : ''}
      </div>`;
    }).join('');

    const startBtn = isToday
      ? `<button class="btn btn-primary" style="flex:1" onclick="startActiveWorkout(${dow})">▶ Iniciar Treino</button>`
      : `<button class="btn btn-secondary btn-sm" onclick="startActiveWorkout(${dow})">▶ Iniciar</button>`;

    // Today starts expanded; other days start collapsed
    const startExpanded = isToday;

    return `${sectionLabel}
      <div class="day-card${isToday ? ' is-today' : ''}" id="wk-card-${dow}">
        <div class="day-header" onclick="toggleWkCard(${dow})" style="cursor:pointer">
          <span class="day-dow${isToday ? ' today' : ''}">${DAYS[dow]}</span>
          <span class="day-name-text">${escHtml(tpl.name)}</span>
          <span class="wk-ex-count" id="wk-count-${dow}">${exCount} exercício${exCount !== 1 ? 's' : ''}</span>
          <span class="wk-chevron" id="wk-chevron-${dow}">${startExpanded ? '▲' : '▼'}</span>
        </div>
        <div class="day-body" id="wk-body-${dow}" style="${startExpanded ? '' : 'display:none'}">
          ${chips ? `<div class="wk-ex-list">${chips}</div>` : ''}
          <div class="day-actions" style="margin-top:10px">
            ${startBtn}
            <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openEditDay(${dow})">Editar</button>
            <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();copyWkTemplate(${dow})" title="Copiar">${ICON.copy}</button>
          </div>
        </div>
      </div>`;
  }).join('');

  const anyPlan = Object.values(wkTemplates).some(t => t && t.name);
  const suggestEl = document.getElementById('wkPlanSuggest');
  if (suggestEl) suggestEl.style.display = anyPlan ? 'none' : '';
}

function toggleWkCard(dow) {
  const body    = document.getElementById(`wk-body-${dow}`);
  const chevron = document.getElementById(`wk-chevron-${dow}`);
  if (!body) return;
  const opening = body.style.display === 'none';
  body.style.display  = opening ? '' : 'none';
  chevron.textContent = opening ? '▲' : '▼';
}
window.toggleWkCard = toggleWkCard;

// ══════════════════════════════════════════
//  HISTÓRICO DE TREINOS
// ══════════════════════════════════════════
async function loadWorkoutHistory() {
  const el = document.getElementById('wkHistoricoList');
  el.innerHTML = '<p style="color:var(--text-faint);font-size:.85rem;padding:12px 0">Carregando...</p>';
  try {
    const { workouts } = await api.get('/api/workouts');
    renderWorkoutHistory(workouts || []);
  } catch (err) {
    el.innerHTML = `<p style="color:var(--accent-warm);font-size:.85rem">${err.message}</p>`;
  }
}

function renderWorkoutHistory(workouts) {
  const el = document.getElementById('wkHistoricoList');
  if (!workouts.length) {
    el.innerHTML = '<p class="empty-state">Nenhum treino registrado ainda.</p>';
    return;
  }

  el.innerHTML = workouts.map(w => {
    const d       = w.date.split('-');
    const dateStr = `${d[2]}/${d[1]}/${d[0]}`;
    const exs     = w.exercises || [];
    const volume  = exs.reduce((s, e) => s + (e.sets || 0) * (e.reps || 0) * (e.weight_kg || 0), 0);

    const chipsHtml = exs.slice(0, 5).map(ex => {
      const meta = [
        ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : '',
        ex.weight_kg       ? `${ex.weight_kg}kg`      : ''
      ].filter(Boolean).join('@');
      return `<span class="hist-chip">${escHtml(ex.name)}${meta ? ' · ' + meta : ''}</span>`;
    }).join('');
    const more = exs.length > 5 ? `<span class="hist-chip hist-more">+${exs.length - 5}</span>` : '';

    return `
      <div class="hist-card">
        <div class="hist-card-head">
          <div>
            <div class="hist-date">${dateStr}</div>
            ${w.notes ? `<div class="hist-notes">${escHtml(w.notes)}</div>` : ''}
          </div>
          <div class="hist-stats">
            <span class="hist-stat">${exs.length} ex.</span>
            ${volume > 0 ? `<span class="hist-stat vol">${Math.round(volume).toLocaleString('pt-BR')} kg</span>` : ''}
          </div>
        </div>
        ${exs.length ? `<div class="hist-chips">${chipsHtml}${more}</div>` : ''}
      </div>`;
  }).join('');
}

async function copyWkTemplate(fromDow) {
  const src = wkTemplates[fromDow];
  if (!src) return;

  const otherDays = DAYS_FULL
    .map((label, dow) => dow !== fromDow ? { dow, label, hasTemplate: !!wkTemplates[dow] } : null)
    .filter(Boolean);

  const selected = await showDayCopyModal(src.name || DAYS_FULL[fromDow], otherDays);
  if (!selected || !selected.length) return;

  try {
    await Promise.all(selected.map(toDow =>
      api.put(`/api/workout-templates/${toDow}`, {
        name:      src.name,
        exercises: (src.exercises || []).map(ex => ({
          name:      ex.name,
          sets:      ex.sets,
          reps:      ex.reps,
          weight_kg: ex.weight_kg,
        }))
      })
    ));
    toast(`Treino copiado para ${selected.length} dia(s)!`);
    await loadWeekGrid();
  } catch (err) { toast(err.message, 'error'); }
}
window.copyWkTemplate = copyWkTemplate;

// ══════════════════════════════════════════
//  EDITAR DIA DO PROGRAMA
// ══════════════════════════════════════════
function openEditDay(dow) {
  editingDow = dow;
  const tpl  = wkTemplates[dow];
  tplExList  = tpl ? JSON.parse(JSON.stringify(tpl.exercises || [])) : [];
  tplActiveMg = null;

  document.getElementById('wkEditDayTitle').textContent = DAYS_FULL[dow];
  document.getElementById('tplName').value = tpl?.name || '';

  resetTplExForm();
  renderTplExList();
  hideTplChips();
  switchWkView('editDay');
}
window.openEditDay = openEditDay;

function setupEditDayView() {
  document.getElementById('wkBackBtn').addEventListener('click', () => switchWkView('programa'));

  // Muscle group chips for template editor
  document.getElementById('tplMuscleGroups').addEventListener('click', e => {
    const btn = e.target.closest('.mg-btn');
    if (!btn) return;
    const group = btn.dataset.group;
    if (tplActiveMg === group) {
      tplActiveMg = null;
      btn.classList.remove('active');
      hideTplChips();
    } else {
      tplActiveMg = group;
      document.querySelectorAll('#tplMuscleGroups .mg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTplChips(group);
    }
  });

  // Template exercise form
  document.getElementById('tplExForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('tplExName').value.trim();
    if (!name) return;
    const editIdx = document.getElementById('tplExEditIdx').value;
    const ex = {
      name,
      sets:      parseInt(document.getElementById('tplExSets').value)    || null,
      reps:      parseInt(document.getElementById('tplExReps').value)    || null,
      weight_kg: parseFloat(document.getElementById('tplExWeight').value) || null
    };

    if (editIdx !== '') {
      tplExList[parseInt(editIdx)] = ex;
    } else {
      tplExList.push(ex);
    }

    resetTplExForm();
    renderTplExList();
    if (tplActiveMg) renderTplChips(tplActiveMg);
  });

  document.getElementById('tplExCancelEdit').addEventListener('click', resetTplExForm);

  // Save
  document.getElementById('tplSaveBtn').addEventListener('click', async () => {
    const name = document.getElementById('tplName').value.trim();
    if (!name && tplExList.length === 0) {
      toast('Preencha o nome ou adicione exercícios', 'error'); return;
    }
    try {
      await api.put(`/api/workout-templates/${editingDow}`, { name, exercises: tplExList });
      toast('Programa salvo!');
      await loadWeekGrid();
      switchWkView('programa');
    } catch (err) { toast(err.message, 'error'); }
  });

  // Rest day
  document.getElementById('tplRestDayBtn').addEventListener('click', async () => {
    if (!confirm('Marcar este dia como descanso (remove o programa)?')) return;
    try {
      await api.del(`/api/workout-templates/${editingDow}`);
      toast('Marcado como descanso');
      await loadWeekGrid();
      switchWkView('programa');
    } catch (err) { toast(err.message, 'error'); }
  });
}

function renderTplChips(group) {
  const current  = document.getElementById('tplExName').value.trim();
  const muscles  = MG_MUSCLES[group] || [];
  const view     = MG_VIEW[group] || 'front';

  const diagramEl = document.getElementById('tplBodyDiagram');
  if (diagramEl && typeof renderChipMap === 'function') {
    renderChipMap(diagramEl, muscles, view);
  }

  document.getElementById('tplExChips').innerHTML = (EXERCISE_LIBRARY[group] || []).map(ex =>
    `<div class="ex-chip-row">
      <button type="button" class="ex-chip${current === ex ? ' selected' : ''}"
        onclick="tplSelectChip('${escHtml(ex)}')">${escHtml(ex)}</button>
      ${EX_META[ex] ? `<button type="button" class="ex-info-btn" onclick="showExerciseInfo('${escHtml(ex)}')" title="Ver músculos">ⓘ</button>` : ''}
    </div>`
  ).join('');
  document.getElementById('tplExChipsWrap').style.display = '';
}

function hideTplChips() {
  document.getElementById('tplExChipsWrap').style.display = 'none';
  document.getElementById('tplExChips').innerHTML = '';
  const d = document.getElementById('tplBodyDiagram');
  if (d) { d.innerHTML = ''; d.style.display = 'none'; }
}

function tplSelectChip(name) {
  document.getElementById('tplExName').value = name;
  document.querySelectorAll('#tplExChips .ex-chip').forEach(c =>
    c.classList.toggle('selected', c.textContent.trim() === name)
  );
  document.getElementById('tplExSets').focus();
}
window.tplSelectChip = tplSelectChip;

function renderTplExList() {
  const el = document.getElementById('tplExerciseList');
  if (!tplExList.length) {
    el.innerHTML = '<div class="empty-state">Nenhum exercício</div>'; return;
  }
  el.innerHTML = tplExList.map((ex, i) => {
    const parts = [];
    if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`);
    else if (ex.sets)       parts.push(`${ex.sets} séries`);
    if (ex.weight_kg)       parts.push(`${ex.weight_kg}kg`);
    return `
      <div class="exercise-item">
        <div class="exercise-num">${i + 1}</div>
        <div class="exercise-item-info">
          <div class="exercise-item-name">${escHtml(ex.name)}</div>
          ${parts.length ? `<div class="exercise-item-meta">${parts.join(' @ ')}</div>` : ''}
        </div>
        <div class="exercise-item-actions">
          <button class="btn btn-icon btn-ghost" onclick="tplEditEx(${i})" title="Editar">${ICON.edit}</button>
          <button class="btn btn-icon btn-ghost" onclick="tplRemoveEx(${i})" title="Remover">${ICON.trash}</button>
        </div>
      </div>`;
  }).join('');
}

function tplEditEx(i) {
  const ex = tplExList[i];
  document.getElementById('tplExEditIdx').value = i;
  document.getElementById('tplExName').value     = ex.name;
  document.getElementById('tplExSets').value     = ex.sets      ?? '';
  document.getElementById('tplExReps').value     = ex.reps      ?? '';
  document.getElementById('tplExWeight').value   = ex.weight_kg ?? '';
  document.getElementById('tplExFormLabel').textContent      = 'Editar Exercício';
  document.getElementById('tplExSubmitBtn').textContent      = 'Atualizar';
  document.getElementById('tplExCancelEdit').style.display   = '';
  document.getElementById('tplExName').focus();
  if (tplActiveMg) renderTplChips(tplActiveMg);
}
window.tplEditEx = tplEditEx;

function tplRemoveEx(i) {
  tplExList.splice(i, 1);
  renderTplExList();
  if (tplActiveMg) renderTplChips(tplActiveMg);
}
window.tplRemoveEx = tplRemoveEx;

function resetTplExForm() {
  document.getElementById('tplExEditIdx').value  = '';
  document.getElementById('tplExName').value     = '';
  document.getElementById('tplExSets').value     = '';
  document.getElementById('tplExReps').value     = '';
  document.getElementById('tplExWeight').value   = '';
  document.getElementById('tplExFormLabel').textContent     = 'Adicionar Exercício';
  document.getElementById('tplExSubmitBtn').textContent     = 'Adicionar';
  document.getElementById('tplExCancelEdit').style.display  = 'none';
  document.querySelectorAll('#tplExChips .ex-chip').forEach(c => c.classList.remove('selected'));
}

// ══════════════════════════════════════════
//  MODO DE TREINO ATIVO
// ══════════════════════════════════════════
