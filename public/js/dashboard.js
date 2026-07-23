/* Dashboard tab */
const RING_CIRC = 2 * Math.PI * 54; // 339.29 (r=54 for 120x120 svg)

const WEEKDAYS_PT = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const MONTHS_PT   = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

function renderDateDisplay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const dayEl  = document.getElementById('dashDateDay');
  const textEl = document.getElementById('dashDateText');
  if (dayEl)  dayEl.textContent  = WEEKDAYS_PT[d.getDay()];
  if (textEl) textEl.textContent = `${d.getDate()} de ${MONTHS_PT[d.getMonth()]}, ${d.getFullYear()}`;
}

function initDashboard(state) {
  const dateInput = document.getElementById('dashDate');

  document.getElementById('dashPrevDay').addEventListener('click', () => {
    const d = new Date(dateInput.value + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    state.date = dateInput.value = d.toISOString().slice(0, 10);
    renderDateDisplay(state.date);
    loadDashboard(state);
  });

  document.getElementById('dashNextDay').addEventListener('click', () => {
    const d = new Date(dateInput.value + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    state.date = dateInput.value = d.toISOString().slice(0, 10);
    renderDateDisplay(state.date);
    loadDashboard(state);
  });

  dateInput.addEventListener('change', () => {
    state.date = dateInput.value;
    renderDateDisplay(state.date);
    loadDashboard(state);
  });

  // Water quick-add buttons
  document.getElementById('dashWaterGrid').addEventListener('click', async e => {
    const btn = e.target.closest('[data-ml]');
    if (!btn) return;
    const ml   = parseInt(btn.dataset.ml);
    const date = state.date;
    await api.post('/api/water', { date, amount_ml: ml });
    loadWater(date);
  });
}

async function loadDashboard(state) {
  const date = state.date;
  document.getElementById('dashDate').value = date;
  renderDateDisplay(date);

  const [dietData, weightData, workoutData, allWeights, waterData, streakData] = await Promise.all([
    api.get(`/api/diet/logs?date=${date}`),
    api.get(`/api/diet/weight?date=${date}`),
    api.get(`/api/workouts?date=${date}`),
    api.get('/api/diet/weight'),
    api.get(`/api/water?date=${date}`),
    api.get('/api/stats/streak'),
  ]);

  renderCalRing(dietData.log, state.user);
  renderMacros(dietData.log, state.user);
  renderWeight(weightData.log, allWeights.logs, date);
  renderWorkoutSummary(workoutData.workout);
  renderWater(waterData, date);
  renderStreak(streakData);

  // Load weekly report only on today
  const today = new Date().toISOString().slice(0, 10);
  if (date === today) {
    const weekly = await api.get('/api/stats/weekly');
    renderWeeklyReport(weekly);
  }
}

// ── Calorie Ring ──────────────────────────────────────────────────────────────
function renderCalRing(log, user) {
  const consumed = log?.calories || 0;
  const target   = user?.target_calories || 2000;
  const pct      = Math.min(consumed / target, 1);
  const offset   = RING_CIRC * (1 - pct);
  const ring     = document.getElementById('calRing');

  ring.style.strokeDasharray  = RING_CIRC.toFixed(2);
  ring.style.strokeDashoffset = offset.toFixed(2);

  document.getElementById('dashCalories').textContent = consumed;
  document.getElementById('dashCalTarget').textContent = target;
  ring.classList.toggle('complete', consumed >= target);

  const remain   = target - consumed;
  const remainEl = document.getElementById('dashCalRemain');
  if (remain > 0) {
    remainEl.textContent = `Faltam ${remain} kcal`;
    remainEl.style.color = 'var(--text-muted)';
  } else if (remain < 0) {
    remainEl.textContent = `${Math.abs(remain)} kcal acima da meta`;
    remainEl.style.color = 'var(--red)';
  } else {
    remainEl.textContent = 'Meta atingida!';
    remainEl.style.color = 'var(--green)';
  }
}

// ── Macros ────────────────────────────────────────────────────────────────────
function renderMacros(log, user) {
  const items = [
    ['Prot', log?.protein || 0, user?.target_protein || 150],
    ['Carb', log?.carbs   || 0, user?.target_carbs   || 200],
    ['Fat',  log?.fat     || 0, user?.target_fat     || 65]
  ];
  for (const [key, consumed, target] of items) {
    const pct = Math.min((consumed / target) * 100, 100).toFixed(1);
    document.getElementById(`bar${key}`).style.width = `${pct}%`;
    document.getElementById(`val${key}`).innerHTML   = `<strong>${consumed}</strong>/${target}g`;
  }
}

// ── Weight ────────────────────────────────────────────────────────────────────
function renderWeight(todayLog, allLogs, date) {
  const logs   = (allLogs || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const prev   = logs.filter(l => l.date < date).at(-1);
  const recent = logs.slice(-30);

  const weightEl    = document.getElementById('dashWeight');
  const noDataEl    = document.getElementById('dashWeightNoData');
  const changeRowEl = document.getElementById('dashWeightChangeRow');
  const changeEl    = document.getElementById('dashWeightChange');
  const vsEl        = document.getElementById('dashWeightVs');
  const sparkEl     = document.getElementById('dashWeightSparkline');
  const rangeRowEl  = document.getElementById('dashWeightRangeRow');
  const hintEl      = document.getElementById('dashWeightHint');

  noDataEl.style.display    = 'none';
  changeRowEl.style.display = 'none';
  sparkEl.style.display     = 'none';
  rangeRowEl.style.display  = 'none';
  hintEl.style.display      = 'none';

  const displayLog = todayLog || prev;
  if (!displayLog) {
    weightEl.textContent = '—';
    hintEl.style.display = '';
    return;
  }

  weightEl.textContent = displayLog.weight_kg.toFixed(1) + 'kg';

  if (!todayLog) {
    const d = displayLog.date.split('-');
    noDataEl.textContent   = `Último: ${d[2]}/${d[1]}/${d[0]}`;
    noDataEl.style.display = '';
    hintEl.style.display   = '';
  }

  const compareLog = todayLog ? prev : logs.filter(l => l.date < displayLog.date).at(-1);
  if (compareLog) {
    const diff    = +(displayLog.weight_kg - compareLog.weight_kg).toFixed(1);
    const d       = compareLog.date.split('-');
    const dateStr = `${d[2]}/${d[1]}`;
    if (diff > 0) {
      changeEl.textContent = `▲ +${diff} kg`;
      changeEl.className   = 'weight-change up';
    } else if (diff < 0) {
      changeEl.textContent = `▼ ${diff} kg`;
      changeEl.className   = 'weight-change down';
    } else {
      changeEl.textContent = '= sem variação';
      changeEl.className   = 'weight-change same';
    }
    vsEl.textContent          = `vs. ${dateStr}`;
    changeRowEl.style.display = '';
  }

  const spark7 = logs.slice(-7);
  if (spark7.length >= 2) {
    const vals  = spark7.map(l => l.weight_kg);
    const sMin  = Math.min(...vals);
    const sMax  = Math.max(...vals);
    const range = sMax - sMin || 1;
    sparkEl.style.display = '';
    sparkEl.innerHTML = spark7.map(l => {
      const pct     = Math.round(((l.weight_kg - sMin) / range) * 80 + 15);
      const isToday = l.date === date;
      return `<div class="weight-spark-bar${isToday ? ' today-bar' : ''}" style="height:${pct}%" title="${l.weight_kg.toFixed(1)} kg"></div>`;
    }).join('');
  }

  if (recent.length >= 2) {
    const vals = recent.map(l => l.weight_kg);
    document.getElementById('dashWeightMin').textContent   = Math.min(...vals).toFixed(1) + ' kg';
    document.getElementById('dashWeightMax').textContent   = Math.max(...vals).toFixed(1) + ' kg';
    document.getElementById('dashWeightCount').textContent = logs.length;
    rangeRowEl.style.display = '';
  }
}

// ── Workout Summary ───────────────────────────────────────────────────────────
function renderWorkoutSummary(workout) {
  const el = document.getElementById('dashWorkout');
  if (!workout || !workout.exercises?.length) {
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;padding:14px 0;gap:10px">
        <div style="width:42px;height:42px;border-radius:50%;background:var(--orange-dim);display:flex;align-items:center;justify-content:center">
          <svg width="20" height="14" viewBox="0 0 22 14"><rect x="7" y="5.5" width="8" height="3" rx="1.5" fill="var(--orange)"/><circle cx="4" cy="7" r="4" fill="var(--orange)"/><circle cx="18" cy="7" r="4" fill="var(--orange)"/></svg>
        </div>
        <div style="font-size:13px;color:var(--text-3)">Nenhum treino registrado</div>
        <button onclick="switchTab('workouts')" class="btn btn-primary btn-sm">Ver programa</button>
      </div>`;
    return;
  }
  const volume = workout.exercises.reduce((s, e) => s + (e.sets || 0) * (e.reps || 0) * (e.weight_kg || 0), 0);
  el.innerHTML = workout.exercises.map(ex => {
    const meta = [
      ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : '',
      ex.weight_kg       ? `${ex.weight_kg}kg`      : ''
    ].filter(Boolean).join(' @ ');
    return `<span class="workout-exercise-chip">${ex.name}${meta ? ' · ' + meta : ''}</span>`;
  }).join('');
  if (volume > 0) {
    el.innerHTML += `<div style="margin-top:10px;font-size:.78rem;color:var(--text-muted)">Volume total: <b style="color:var(--orange)">${Math.round(volume).toLocaleString('pt-BR')} kg</b></div>`;
  }
  if (workout.notes) {
    el.innerHTML += `<p style="margin-top:6px;font-size:.82rem;color:var(--text-muted);line-height:1.5">${workout.notes}</p>`;
  }
}

// ── Water ─────────────────────────────────────────────────────────────────────
async function loadWater(date) {
  const data = await api.get(`/api/water?date=${date}`);
  renderWater(data, date);
}

function renderWater(data, date) {
  const { total_ml = 0, goal_ml = 2000, logs = [] } = data;
  const pct = Math.min((total_ml / goal_ml) * 100, 100);

  document.getElementById('dashWaterTotal').textContent  = total_ml >= 1000 ? (total_ml / 1000).toFixed(1) + ' L' : total_ml + ' ml';
  document.getElementById('dashWaterGoal').textContent   = goal_ml >= 1000 ? (goal_ml / 1000).toFixed(1) + ' L' : goal_ml + ' ml';
  document.getElementById('dashWaterPct').textContent    = Math.round(pct) + '%';
  const progressFill = document.getElementById('dashWaterProgressFill');
  if (progressFill) progressFill.style.width = pct + '%';
  const barEl = document.getElementById('dashWaterBar');
  if (barEl) barEl.style.width = pct + '%';

  // Render log dots
  const logsEl = document.getElementById('dashWaterLogs');
  if (logs.length) {
    logsEl.innerHTML = logs.map(l =>
      `<span class="water-log-dot" onclick="deleteWaterLog(${l.id},'${date}')" title="Remover ${l.amount_ml}ml">
        ${l.amount_ml >= 1000 ? (l.amount_ml/1000).toFixed(1)+'L' : l.amount_ml+'ml'}
      </span>`
    ).join('');
  } else {
    logsEl.innerHTML = '<span style="font-size:.75rem;color:var(--text-faint)">Nenhum registro ainda</span>';
  }
}

async function deleteWaterLog(id, date) {
  await api.del(`/api/water/${id}`);
  loadWater(date);
}
window.deleteWaterLog = deleteWaterLog;

// ── Streak ────────────────────────────────────────────────────────────────────
function renderStreak(data) {
  const { streak = 0, longest = 0 } = data;
  const el = document.getElementById('dashStreakVal');
  if (!el) return;
  el.textContent = streak;
  const longestEl = document.getElementById('dashStreakLongest');
  if (longestEl) longestEl.textContent = `Recorde: ${longest} dias`;

  // Fire emoji milestones
  const flameEl = document.getElementById('dashStreakFlame');
  if (flameEl) {
    flameEl.textContent = streak >= 30 ? '🔥🔥🔥' : streak >= 14 ? '🔥🔥' : streak >= 3 ? '🔥' : '💧';
  }
}

// ── Weekly Report ─────────────────────────────────────────────────────────────
function renderWeeklyReport(data) {
  const el = document.getElementById('dashWeeklyReport');
  if (!el || !data) return;

  const { summary, days } = data;
  const DAY_ABBR = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  const maxCal = Math.max(...days.map(d => d.calories), 1);

  el.innerHTML = `
    <div class="weekly-bars">
      ${days.map(d => {
        const dow = new Date(d.date + 'T12:00:00').getDay();
        const h   = Math.max(Math.round((d.calories / maxCal) * 52), d.calories > 0 ? 4 : 0);
        return `
          <div class="weekly-bar-col">
            <div class="weekly-bar-wrap">
              <div class="weekly-bar${d.trained ? ' trained' : ''}" style="height:${h}px" title="${d.calories} kcal"></div>
            </div>
            <div class="weekly-bar-label">${DAY_ABBR[dow]}</div>
          </div>`;
      }).join('')}
    </div>
    <div class="weekly-stats">
      <div class="weekly-stat"><div class="weekly-stat-val">${summary.avgCalories || '—'}</div><div class="weekly-stat-label">kcal médio</div></div>
      <div class="weekly-stat"><div class="weekly-stat-val">${summary.avgProtein || '—'}g</div><div class="weekly-stat-label">prot médio</div></div>
      <div class="weekly-stat"><div class="weekly-stat-val">${summary.trainedDays}</div><div class="weekly-stat-label">treinos</div></div>
      <div class="weekly-stat"><div class="weekly-stat-val">${summary.loggedDays}</div><div class="weekly-stat-label">dias log</div></div>
    </div>
  `;
}
