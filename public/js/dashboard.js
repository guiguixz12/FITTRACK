/* Dashboard tab — daily view with calorie ring + macros */

const WEEKDAYS_PT = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const MONTHS_PT   = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const CAL_CIRC    = 2 * Math.PI * 54; // ring circumference (r=54)

async function checkDashBanner() {
  try {
    const { templates } = await api.get('/api/diet-templates');
    const hasPlan = (templates || []).some(t => t && (t.name || (t.foods && t.foods.length)));
    const banner = document.getElementById('dashAiBanner');
    if (banner) banner.style.display = hasPlan ? 'none' : '';
  } catch {}
}

function initDashboard(state) {
  checkDashBanner();
  document.getElementById('dashPrevDay')?.addEventListener('click', () => {
    const d = new Date(state.date + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    state.date = d.toISOString().slice(0, 10);
    loadDashboard(state);
  });

  document.getElementById('dashNextDay')?.addEventListener('click', () => {
    const today = new Date().toISOString().slice(0, 10);
    if (state.date >= today) return;
    const d = new Date(state.date + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    state.date = d.toISOString().slice(0, 10);
    loadDashboard(state);
  });

}

async function loadDashboard(state) {
  const date  = state.date || new Date().toISOString().slice(0, 10);
  state.date  = date;
  updateDateDisplay(date);

  const [dietData, weightData, workoutData, waterData, streakData] = await Promise.all([
    api.get(`/api/diet/logs?date=${date}`),
    api.get('/api/diet/weight'),
    api.get(`/api/workouts?date=${date}`),
    api.get(`/api/water?date=${date}`),
    api.get('/api/stats/streak'),
  ]);

  const log  = dietData.log || {};
  const user = state.user  || {};

  renderCalRing(log, user);
  renderMacros(log, user);
  renderWeight(weightData.logs || []);
  renderWorkoutSummary(workoutData.workout);
  renderWater(waterData, date);
  renderStreak(streakData);
}

// ── Date display ──────────────────────────────────────────────────────────────
function updateDateDisplay(date) {
  const d     = new Date(date + 'T12:00:00');
  const today = new Date().toISOString().slice(0, 10);
  const labelEl = document.getElementById('dashDateLabel');
  const subEl   = document.getElementById('dashDateSub');
  const nextBtn = document.getElementById('dashNextDay');

  if (labelEl) {
    if (date === today) {
      labelEl.textContent = 'Hoje';
    } else {
      labelEl.textContent = `${d.getDate()} de ${MONTHS_PT[d.getMonth()]}`;
    }
  }
  if (subEl) subEl.textContent = WEEKDAYS_PT[d.getDay()];
  if (nextBtn) nextBtn.disabled = date >= today;
}

// ── Calorie ring ──────────────────────────────────────────────────────────────
function renderCalRing(log, user) {
  const consumed = log.calories || 0;
  const target   = user.target_calories || 2000;
  const remain   = Math.max(target - consumed, 0);
  const pct      = Math.min(consumed / target, 1);

  const ring    = document.getElementById('calRing');
  const calEl   = document.getElementById('dashCalories');
  const tgtEl   = document.getElementById('dashCalTarget');
  const remEl   = document.getElementById('dashCalRemain');

  if (ring)  ring.setAttribute('stroke-dasharray', `${pct * CAL_CIRC} ${CAL_CIRC}`);
  if (calEl) calEl.textContent = consumed.toLocaleString('pt-BR');
  if (tgtEl) tgtEl.textContent = `${target.toLocaleString('pt-BR')} kcal`;
  if (remEl) remEl.textContent = consumed >= target
    ? `Meta atingida!`
    : `Faltam ${remain.toLocaleString('pt-BR')} kcal`;
}

// ── Macros ────────────────────────────────────────────────────────────────────
function renderMacros(log, user) {
  const macros = [
    { fill: 'barProt', val: 'valProt', got: log.protein || 0, target: user.target_protein || 150, unit: 'g' },
    { fill: 'barCarb', val: 'valCarb', got: log.carbs   || 0, target: user.target_carbs   || 250, unit: 'g' },
    { fill: 'barFat',  val: 'valFat',  got: log.fat     || 0, target: user.target_fat     || 70,  unit: 'g' },
  ];

  for (const m of macros) {
    const pct    = Math.min((m.got / m.target) * 100, 100);
    const fillEl = document.getElementById(m.fill);
    const valEl  = document.getElementById(m.val);
    if (fillEl) fillEl.style.width = pct + '%';
    if (valEl)  valEl.textContent  = `${Math.round(m.got)}${m.unit}`;
  }
}

// ── Weight stat card ──────────────────────────────────────────────────────────
function renderWeight(logs) {
  const sorted = (logs || []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0]?.weight_kg;
  const el = document.getElementById('dashWeight');
  if (el) el.textContent = latest ? `${parseFloat(latest).toFixed(1)}kg` : '—';
}

// ── Workout summary ───────────────────────────────────────────────────────────
function renderWorkoutSummary(workout) {
  const el = document.getElementById('dashWorkout');
  if (!el) return;

  if (!workout?.exercises?.length) {
    el.innerHTML = `
      <div class="v2-workout-empty">
        <div class="v2-workout-icon-wrap">
          <svg width="20" height="14" viewBox="0 0 22 14" fill="none">
            <rect x="7" y="5.5" width="8" height="3" rx="1.5" fill="#FF9142"/>
            <circle cx="4"  cy="7" r="4" fill="#FF9142"/>
            <circle cx="18" cy="7" r="4" fill="#FF9142"/>
          </svg>
        </div>
        <div class="v2-workout-empty-txt">Nenhum treino registrado</div>
        <button class="v2-workout-btn" onclick="switchTab('workouts')">Ver programa</button>
      </div>`;
    return;
  }

  const volume = workout.exercises.reduce((s, e) => s + (e.sets || 0) * (e.reps || 0) * (e.weight_kg || 0), 0);
  let html = '<div class="v2-workout-chips">';
  html += workout.exercises.map(ex => {
    const meta = [
      ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : '',
      ex.weight_kg       ? `${ex.weight_kg}kg`      : '',
    ].filter(Boolean).join(' @ ');
    return `<span class="v2-workout-chip">${ex.name}${meta ? ' · ' + meta : ''}</span>`;
  }).join('');
  html += '</div>';
  if (volume > 0) {
    html += `<div class="v2-workout-volume">Volume: <b>${Math.round(volume).toLocaleString('pt-BR')} kg</b></div>`;
  }
  if (workout.estimated_kcal) {
    html += `<div class="v2-workout-kcal-info">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/>
      </svg>
      ~${workout.estimated_kcal} kcal queimadas no treino
      <span class="v2-workout-kcal-sub">(já na meta de atividade)</span>
    </div>`;
  }
  el.innerHTML = html;
}

// ── Water ─────────────────────────────────────────────────────────────────────
async function loadWater(date) {
  const data = await api.get(`/api/water?date=${date}`);
  renderWater(data, date);
}

function renderWater(data, date) {
  const { total_ml = 0, goal_ml = 2000, logs = [] } = data;
  const pct = Math.min((total_ml / goal_ml) * 100, 100);
  const fmt = ml => ml >= 1000 ? (ml / 1000).toFixed(1) + ' L' : ml + ' ml';

  // Stat card (top row)
  const totalEl = document.getElementById('dashWaterTotal');
  const pctEl   = document.getElementById('dashWaterPct');
  if (totalEl) totalEl.textContent = fmt(total_ml);
  if (pctEl)   pctEl.textContent   = `${Math.round(pct)}% água`;

  // Water card
  const fillEl = document.getElementById('dashWaterProgressFill');
  const fracEl = document.getElementById('dashWaterFrac');
  if (fillEl) fillEl.style.width = pct + '%';
  if (fracEl) fracEl.textContent = `${fmt(total_ml)} / ${fmt(goal_ml)}`;

  // Logs
  const logsEl = document.getElementById('dashWaterLogs');
  if (!logsEl) return;
  if (logs.length) {
    logsEl.innerHTML = logs.map(l =>
      `<button class="v2-water-log-dot" onclick="deleteWaterLog(${l.id},'${date}')" title="Remover">
        ${fmt(l.amount_ml)}
      </button>`
    ).join('');
  } else {
    logsEl.innerHTML = `<span style="font-size:11px;color:var(--v2-faint)">Nenhum registro ainda</span>`;
  }
}

async function deleteWaterLog(id, date) {
  await api.del(`/api/water/${id}`);
  loadWater(date);
}
window.deleteWaterLog = deleteWaterLog;

async function dashAddWater(ml) {
  const date = AppState?.date || new Date().toISOString().slice(0, 10);
  await api.post('/api/water', { date, amount_ml: ml });
  loadWater(date);
}
window.dashAddWater = dashAddWater;

// ── Streak ────────────────────────────────────────────────────────────────────
function renderStreak(data) {
  const { streak = 0 } = data || {};
  const valEl  = document.getElementById('dashStreakVal');
  const longEl = document.getElementById('dashStreakLongest');
  if (valEl)  valEl.textContent  = streak;
  if (longEl) longEl.textContent = '';
}

// renderWeeklyReport: kept as no-op for any legacy external caller
function renderWeeklyReport() {}
