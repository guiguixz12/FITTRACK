/* ═══════════════════════════════════════════
   Workouts — programa semanal + modo ativo
   ═══════════════════════════════════════════ */

// ── Exercise Library ──────────────────────────────────────────────────────────
const EXERCISE_LIBRARY = {
  peito:   ['Supino Reto','Supino Inclinado','Supino Declinado','Supino c/ Halteres','Supino Inclinado c/ Halteres','Crucifixo Reto','Crucifixo Inclinado','Crossover','Pec Deck (Voador)','Flexão de Braço','Flexão Inclinada','Pullover'],
  costas:  ['Puxada Frontal','Puxada Fechada','Puxada Neutra','Barra Fixa','Chin-up','Remada Curvada','Remada Unilateral','Remada Cavalinho','Remada na Máquina','Remada Serrote','Remada Baixa','Levantamento Terra','Hiperextensão','Face Pull'],
  ombros:  ['Desenvolvimento c/ Barra','Desenvolvimento c/ Halteres','Arnold Press','Elevação Lateral','Elevação Frontal','Crucifixo Inverso','Remada Alta','Encolhimento de Ombros','Elevação Lateral na Polia'],
  biceps:  ['Rosca Direta','Rosca Alternada','Rosca Concentrada','Rosca Martelo','Rosca Scott','Rosca 21','Rosca no Cabo','Rosca Inclinada','Rosca Inversa'],
  triceps: ['Tríceps Pulley','Tríceps Corda','Tríceps Barra','Tríceps Testa','Tríceps Francês','Tríceps Coice','Tríceps Banco (Dips)','Extensão Unilateral','Mergulho (Dips)','Kickback'],
  pernas:  ['Agachamento Livre','Agachamento Sumô','Agachamento Hack','Leg Press','Leg Press 45°','Extensão de Pernas','Flexão de Pernas','Mesa Flexora','Stiff','Levantamento Terra Romeno','Avanço','Afundo','Passada','Cadeira Adutora','Cadeira Abdutora','Hip Thrust','Glúteo no Cabo','Elevação de Quadril','Panturrilha em Pé','Panturrilha Sentado'],
  abdomen: ['Crunch','Abdominal Infra','Oblíquo','Abdominal Bicicleta','Prancha','Prancha Lateral','Elevação de Pernas','Abdominal na Polia','Rollout (Roda)','Abdominal Remador','Russian Twist'],
  cardio:  ['Esteira','Corrida','Caminhada','Bicicleta Ergométrica','Elíptico','Escada (Stairmaster)','Pular Corda','HIIT','Circuito','Remo Ergométrico','Natação','Jump']
};

const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const DAYS_FULL = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];

// ── State ─────────────────────────────────────────────────────────────────────
let wkState      = null;   // AppState ref
let wkTemplates  = {};     // { [dow]: { id, name, exercises[] } }
let editingDow   = null;   // day being edited
let tplExList    = [];     // exercises in the template editor
let tplActiveMg  = null;   // active muscle group in template editor
let activeMg     = null;   // active muscle group in manual session
let currentWkId  = null;   // current manual session workout id

// Active workout mode
let waExercises  = [];     // [{name, sets, reps, weight_kg, done}]
let waChecked    = 0;
let waTimerInt   = null;
let waStartTime  = null;
let waWorkoutDow = null;

// Rest timer
let restTimerInt  = null;
let restTimerSecs = 0;

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
    el.innerHTML = `<p style="color:var(--red);font-size:.85rem">${err.message}</p>`;
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
  const current = document.getElementById('tplExName').value.trim();
  document.getElementById('tplExChips').innerHTML = (EXERCISE_LIBRARY[group] || []).map(ex =>
    `<button type="button" class="ex-chip${current === ex ? ' selected' : ''}"
      onclick="tplSelectChip('${escHtml(ex)}')">${escHtml(ex)}</button>`
  ).join('');
  document.getElementById('tplExChipsWrap').style.display = '';
}

function hideTplChips() {
  document.getElementById('tplExChipsWrap').style.display = 'none';
  document.getElementById('tplExChips').innerHTML = '';
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
function startActiveWorkout(dow) {
  const tpl = wkTemplates[dow];
  waWorkoutDow = dow;
  waExercises  = (tpl?.exercises || []).map(ex => ({ ...ex, done: false }));
  waChecked    = 0;
  clearInterval(restTimerInt);
  const timerEl = document.getElementById('waRestTimer');
  if (timerEl) timerEl.style.display = 'none';
  sessionPRs = [];

  document.getElementById('waTitle').textContent    = tpl?.name || DAYS_FULL[dow];
  document.getElementById('waAddExtra').style.display = 'none';
  document.getElementById('waExtraName').value = '';

  renderWaExercises();
  updateWaProgress();
  startWaTimer();

  document.getElementById('workoutActive').style.display = '';
  document.body.style.overflow = 'hidden';
}
window.startActiveWorkout = startActiveWorkout;

function renderWaExercises() {
  const body = document.getElementById('waBody');
  if (!waExercises.length) {
    body.innerHTML = '<p class="empty-state">Nenhum exercício no programa. Use "+ Extra" para adicionar.</p>';
    return;
  }

  const pending = waExercises.filter(e => !e.done);
  const done    = waExercises.filter(e =>  e.done);

  let html = '';
  if (pending.length) {
    html += pending.map((ex, ri) => {
      const i = waExercises.indexOf(ex);
      return waExCard(ex, i);
    }).join('');
  }
  if (done.length) {
    html += `<div class="wa-section-label">✓ Concluídos (${done.length})</div>`;
    html += done.map(ex => {
      const i = waExercises.indexOf(ex);
      return waExCard(ex, i);
    }).join('');
  }

  body.innerHTML = html;
}

function waExCard(ex, i) {
  const parts = [];
  if (ex.sets && ex.reps) parts.push(`${ex.sets} × ${ex.reps} reps`);
  else if (ex.sets)       parts.push(`${ex.sets} séries`);
  if (ex.weight_kg)       parts.push(`${ex.weight_kg} kg`);

  return `
    <div class="wa-ex-card${ex.done ? ' done' : ''}" onclick="toggleWaEx(${i})">
      <div class="wa-check-btn">${ex.done ? '✓' : '○'}</div>
      <div class="wa-ex-info">
        <div class="wa-ex-name">${escHtml(ex.name)}</div>
        ${parts.length ? `<div class="wa-ex-meta">${parts.join(' @ ')}</div>` : ''}
      </div>
    </div>`;
}

function toggleWaEx(i) {
  const wasDone = waExercises[i].done;
  waExercises[i].done = !wasDone;
  waChecked = waExercises.filter(e => e.done).length;
  renderWaExercises();
  updateWaProgress();
  if (!wasDone) startRestTimer(90); // start 90s rest when marking done
}
window.toggleWaEx = toggleWaEx;

function updateWaProgress() {
  const total  = waExercises.length;
  const pct    = total > 0 ? (waChecked / total) * 100 : 0;
  const done   = waExercises.filter(e => e.done);
  const volume = done.reduce((s, e) => s + (e.sets || 0) * (e.reps || 0) * (e.weight_kg || 0), 0);
  document.getElementById('waProgBar').style.width   = pct + '%';
  document.getElementById('waProgLabel').textContent = `${waChecked} / ${total} exercícios${volume > 0 ? ' · ' + Math.round(volume).toLocaleString('pt-BR') + ' kg vol.' : ''}`;
}

// ── Rest Timer ────────────────────────────────────────────────────────────────
function startRestTimer(secs) {
  clearInterval(restTimerInt);
  restTimerSecs = secs;
  const el = document.getElementById('waRestTimer');
  if (el) el.style.display = '';
  updateRestTimerDisplay();
  restTimerInt = setInterval(() => {
    restTimerSecs--;
    if (restTimerSecs <= 0) {
      skipRestTimer();
      // vibrate if supported
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    } else {
      updateRestTimerDisplay();
    }
  }, 1000);
}

function updateRestTimerDisplay() {
  const el = document.getElementById('waRestTimerCount');
  if (!el) return;
  const m  = Math.floor(Math.max(restTimerSecs, 0) / 60);
  const s  = String(Math.max(restTimerSecs, 0) % 60).padStart(2, '0');
  el.textContent = `${m}:${s}`;
  el.style.color = restTimerSecs <= 10 ? 'var(--red)' : 'var(--orange)';
}

function skipRestTimer() {
  clearInterval(restTimerInt);
  const el = document.getElementById('waRestTimer');
  if (el) el.style.display = 'none';
}
window.skipRestTimer = skipRestTimer;

function adjustRestTimer(delta) {
  restTimerSecs = Math.max(restTimerSecs + delta, 5);
  updateRestTimerDisplay();
}
window.adjustRestTimer = adjustRestTimer;

function startWaTimer() {
  clearInterval(waTimerInt);
  waStartTime = Date.now();
  waTimerInt = setInterval(() => {
    const s   = Math.floor((Date.now() - waStartTime) / 1000);
    const mm  = String(Math.floor(s / 60)).padStart(2, '0');
    const ss  = String(s % 60).padStart(2, '0');
    document.getElementById('waTimer').textContent = `${mm}:${ss}`;
  }, 1000);
}

function setupActiveMode(state) {
  // Cancel
  document.getElementById('waCancelBtn').addEventListener('click', () => {
    if (!confirm('Cancelar treino? O progresso não será salvo.')) return;
    closeActiveMode();
  });

  // Toggle extra input
  document.getElementById('waToggleExtra').addEventListener('click', () => {
    const el = document.getElementById('waAddExtra');
    const showing = el.style.display !== 'none';
    el.style.display = showing ? 'none' : '';
    if (!showing) document.getElementById('waExtraName').focus();
  });

  // Add extra exercise
  document.getElementById('waAddExtraBtn').addEventListener('click', () => {
    const name = document.getElementById('waExtraName').value.trim();
    if (!name) return;
    waExercises.push({ name, sets: null, reps: null, weight_kg: null, done: false });
    document.getElementById('waExtraName').value = '';
    document.getElementById('waAddExtra').style.display = 'none';
    updateWaProgress();
    renderWaExercises();
    // Scroll to bottom to show new exercise
    document.getElementById('waBody').scrollTo({ top: 999999, behavior: 'smooth' });
  });

  // Finish
  document.getElementById('waFinishBtn').addEventListener('click', async () => {
    await finishActiveWorkout(state);
  });
}

async function finishActiveWorkout(state) {
  const done = waExercises.filter(e => e.done);
  if (done.length === 0 && !confirm('Nenhum exercício marcado como concluído. Salvar mesmo assim?')) return;

  const today    = new Date().toISOString().slice(0, 10);
  const elapsed  = waStartTime ? Math.floor((Date.now() - waStartTime) / 1000) : 0;
  const mm       = Math.floor(elapsed / 60);
  const ss       = elapsed % 60;
  const notesStr = `Duração: ${mm}m${ss}s | ${done.length}/${waExercises.length} exercícios concluídos`;

  try {
    // Create or get workout session for today
    const wkRes = await api.post('/api/workouts', { date: today, notes: notesStr });
    const workoutId = wkRes.id;

    // Save all exercises (done ones first, then pending)
    const toSave = [
      ...waExercises.filter(e =>  e.done),
      ...waExercises.filter(e => !e.done)
    ];

    for (const ex of toSave) {
      await api.post(`/api/workouts/${workoutId}/exercises`, {
        name: ex.name, sets: ex.sets, reps: ex.reps, weight_kg: ex.weight_kg
      });
    }

    // Check PRs for done exercises that have weight
    const prResults = await Promise.all(
      done
        .filter(ex => ex.weight_kg && ex.sets && ex.reps)
        .map(ex => api.post('/api/stats/prs/check', {
          exercise_name: ex.name,
          sets:          ex.sets,
          reps:          ex.reps,
          weight_kg:     ex.weight_kg,
          date:          today,
        }))
    );
    const newPRs = prResults.filter(r => r.is_pr).length;

    closeActiveMode();
    const prMsg = newPRs > 0 ? ` 🏆 ${newPRs} PR${newPRs > 1 ? 's' : ''} novo${newPRs > 1 ? 's' : ''}!` : '';
    toast(`Treino salvo! ${mm}m${ss}s · ${done.length}/${waExercises.length} exercícios${prMsg}`);

    // Refresh dashboard if it's today
    if (state.date === today) loadDashboard(state);

  } catch (err) { toast(err.message, 'error'); }
}

function closeActiveMode() {
  clearInterval(waTimerInt);
  clearInterval(restTimerInt);
  document.body.style.overflow = '';
  document.getElementById('workoutActive').style.display = 'none';
  document.getElementById('waTimer').textContent = '00:00';
  sessionPRs = [];
}

// ══════════════════════════════════════════
//  REGISTRAR SESSÃO MANUAL
// ══════════════════════════════════════════
function setupRegistrarView(state) {
  document.getElementById('wkDate').value = state.date;

  document.getElementById('wkDate').addEventListener('change', async e => {
    await loadManualSession(e.target.value);
  });

  document.getElementById('wkSaveNotes').addEventListener('click', async () => {
    const date  = document.getElementById('wkDate').value;
    const notes = document.getElementById('wkNotes').value;
    try {
      if (currentWkId) {
        await api.put(`/api/workouts/${currentWkId}`, { notes });
      } else {
        const r = await api.post('/api/workouts', { date, notes });
        currentWkId = r.id;
      }
      toast('Notas salvas!');
    } catch (err) { toast(err.message, 'error'); }
  });

  // Muscle groups (manual session)
  document.getElementById('muscleGroups').addEventListener('click', e => {
    const btn = e.target.closest('.mg-btn');
    if (!btn) return;
    const group = btn.dataset.group;
    if (activeMg === group) {
      activeMg = null;
      btn.classList.remove('active');
      document.getElementById('exChipsWrap').style.display = 'none';
    } else {
      activeMg = group;
      document.querySelectorAll('#muscleGroups .mg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderExChips(group);
    }
  });

  // Manual exercise form
  document.getElementById('exerciseForm').addEventListener('submit', async e => {
    e.preventDefault();
    const date = document.getElementById('wkDate').value;
    const name = document.getElementById('exName').value.trim();
    if (!name) return;
    const editId = document.getElementById('exEditId').value;

    try {
      if (!currentWkId) {
        const r = await api.post('/api/workouts', { date, notes: document.getElementById('wkNotes').value });
        currentWkId = r.id;
      }
      const payload = {
        name,
        sets:      parseInt(document.getElementById('exSets').value)    || null,
        reps:      parseInt(document.getElementById('exReps').value)    || null,
        weight_kg: parseFloat(document.getElementById('exWeight').value) || null
      };
      if (editId) {
        await api.put(`/api/workouts/${currentWkId}/exercises/${editId}`, payload);
        cancelManualEdit();
      } else {
        await api.post(`/api/workouts/${currentWkId}/exercises`, payload);
      }
      resetManualExForm();
      await loadManualExercises();
      toast(editId ? 'Exercício atualizado!' : 'Exercício adicionado!');
    } catch (err) { toast(err.message, 'error'); }
  });

  document.getElementById('exCancelEdit').addEventListener('click', cancelManualEdit);
}

async function loadManualSession(date) {
  const { workout } = await api.get(`/api/workouts?date=${date}`);
  currentWkId = workout?.id || null;
  document.getElementById('wkNotes').value = workout?.notes || '';
  renderManualExercises(workout?.exercises || []);
}

async function loadManualExercises() {
  if (!currentWkId) return renderManualExercises([]);
  const { workout } = await api.get(`/api/workouts?date=${document.getElementById('wkDate').value}`);
  renderManualExercises(workout?.exercises || []);
}

function renderManualExercises(exercises) {
  const el = document.getElementById('exerciseList');
  if (!exercises.length) {
    el.innerHTML = '<div class="empty-state">Nenhum exercício adicionado</div>'; return;
  }
  el.innerHTML = exercises.map((ex, i) => {
    const parts = [];
    if (ex.sets && ex.reps) parts.push(`${ex.sets} × ${ex.reps} reps`);
    else if (ex.sets)       parts.push(`${ex.sets} séries`);
    if (ex.weight_kg)       parts.push(`${ex.weight_kg} kg`);
    return `
      <div class="exercise-item">
        <div class="exercise-num">${i + 1}</div>
        <div class="exercise-item-info">
          <div class="exercise-item-name">${escHtml(ex.name)}</div>
          ${parts.length ? `<div class="exercise-item-meta">${parts.join(' @ ')}</div>` : ''}
        </div>
        <div class="exercise-item-actions">
          <button class="btn btn-icon btn-ghost" onclick="editManualEx(${ex.id}, '${escHtml(ex.name)}', ${ex.sets ?? 'null'}, ${ex.reps ?? 'null'}, ${ex.weight_kg ?? 'null'})">${ICON.edit}</button>
          <button class="btn btn-icon btn-ghost" onclick="deleteManualEx(${ex.id})">${ICON.trash}</button>
        </div>
      </div>`;
  }).join('');
}

function editManualEx(id, name, sets, reps, weight) {
  document.getElementById('exEditId').value = id;
  document.getElementById('exName').value   = name;
  document.getElementById('exSets').value   = sets   ?? '';
  document.getElementById('exReps').value   = reps   ?? '';
  document.getElementById('exWeight').value = weight ?? '';
  document.getElementById('exFormLabel').textContent    = 'Editar Exercício';
  document.getElementById('exSubmitBtn').textContent    = 'Atualizar';
  document.getElementById('exCancelEdit').style.display = '';
  if (activeMg) renderExChips(activeMg);
  document.getElementById('exName').focus();
}
window.editManualEx = editManualEx;

async function deleteManualEx(id) {
  if (!confirm('Remover este exercício?')) return;
  try {
    await api.del(`/api/workouts/${currentWkId}/exercises/${id}`);
    await loadManualExercises();
    toast('Exercício removido');
  } catch (err) { toast(err.message, 'error'); }
}
window.deleteManualEx = deleteManualEx;

function cancelManualEdit() {
  resetManualExForm();
  document.getElementById('exFormLabel').textContent    = 'Adicionar Exercício';
  document.getElementById('exSubmitBtn').textContent    = 'Adicionar';
  document.getElementById('exCancelEdit').style.display = 'none';
  if (activeMg) renderExChips(activeMg);
}

function resetManualExForm() {
  ['exEditId','exName','exSets','exReps','exWeight'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.querySelectorAll('#exChips .ex-chip').forEach(c => c.classList.remove('selected'));
}

function renderExChips(group) {
  const current = document.getElementById('exName').value.trim();
  document.getElementById('exChips').innerHTML = (EXERCISE_LIBRARY[group] || []).map(ex =>
    `<button type="button" class="ex-chip${current === ex ? ' selected' : ''}"
      onclick="selectExChip('${escHtml(ex)}')">${escHtml(ex)}</button>`
  ).join('');
  document.getElementById('exChipsWrap').style.display = '';
}

function selectExChip(name) {
  document.getElementById('exName').value = name;
  document.querySelectorAll('#exChips .ex-chip').forEach(c =>
    c.classList.toggle('selected', c.textContent.trim() === name)
  );
  document.getElementById('exSets').focus();
}
window.selectExChip = selectExChip;

// ── Shared util ───────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
  );
}
