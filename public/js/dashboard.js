/* Dashboard tab — weekly overview */
const WEEKDAYS_PT = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const MONTHS_PT   = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

let _dashCalChart = null;
let _dashWtChart  = null;

function initDashboard(state) {
  // Period tabs
  document.querySelectorAll('#dashPeriodTabs .period-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#dashPeriodTabs .period-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.dashPeriod = btn.dataset.period;
      loadDashboard(state);
    });
  });

  // Full water grid
  const grid = document.getElementById('dashWaterGrid');
  if (grid) {
    grid.addEventListener('click', async e => {
      const btn = e.target.closest('[data-ml]');
      if (!btn) return;
      const today = new Date().toISOString().slice(0, 10);
      await api.post('/api/water', { date: today, amount_ml: parseInt(btn.dataset.ml) });
      loadWater(today);
    });
  }

  // Mini +250ml button
  const miniBtn = document.getElementById('dashWaterMiniBtn');
  if (miniBtn) {
    miniBtn.addEventListener('click', async () => {
      const today = new Date().toISOString().slice(0, 10);
      await api.post('/api/water', { date: today, amount_ml: 250 });
      loadWater(today);
    });
  }
}

async function loadDashboard(state) {
  const today = new Date().toISOString().slice(0, 10);
  state.date = today;

  const [weeklyData, weightData, workoutData, waterData, streakData] = await Promise.all([
    api.get('/api/stats/weekly'),
    api.get('/api/diet/weight'),
    api.get(`/api/workouts?date=${today}`),
    api.get(`/api/water?date=${today}`),
    api.get('/api/stats/streak'),
  ]);

  renderCalWeek(weeklyData);
  renderWeightTrend(weightData.logs || []);
  renderWorkoutSummary(workoutData.workout);
  renderWater(waterData, today);
  renderStreak(streakData);
}

// ── Calorie bar chart ─────────────────────────────────────────────────────────
function renderCalWeek(data) {
  const { days = [], summary = {}, prevSummary = {} } = data || {};
  const today = new Date().toISOString().slice(0, 10);
  const DOW   = ['D','S','T','Q','Q','S','S'];

  // Big stat
  const avg = summary.avgCalories || 0;
  const avgEl = document.getElementById('dashCalAvg');
  if (avgEl) avgEl.textContent = avg ? avg.toLocaleString('pt-BR') : '—';

  // Delta badge
  const deltaEl = document.getElementById('dashCalDelta');
  if (deltaEl) {
    if (avg && prevSummary.avgCalories) {
      const pct  = Math.round(((avg - prevSummary.avgCalories) / prevSummary.avgCalories) * 100);
      const sign = pct >= 0 ? '+' : '';
      deltaEl.textContent     = `${sign}${pct}% vs sem. anterior`;
      deltaEl.style.color     = pct > 0 ? 'var(--accent-warm)' : 'var(--accent)';
      deltaEl.style.display   = '';
    } else {
      deltaEl.style.display = 'none';
    }
  }

  // Chart
  const ctx = document.getElementById('dashCalChart');
  if (!ctx) return;

  const labels = days.map(d => DOW[new Date(d.date + 'T12:00:00').getDay()]);
  const values = days.map(d => d.calories || 0);
  const colors = days.map(d =>
    d.date === today ? '#FF9142'
    : d.calories > 0 ? '#C4E538'
    : 'rgba(196,229,56,0.18)'
  );

  if (_dashCalChart) { _dashCalChart.destroy(); _dashCalChart = null; }
  _dashCalChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false,
        barPercentage: 0.6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 11, family: 'Manrope', weight: '600' } },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)', drawTicks: false },
          border: { display: false },
          ticks: { display: false },
          min: 0,
        }
      },
      layout: { padding: { top: 4 } }
    }
  });
}

// ── Weight trend line chart ───────────────────────────────────────────────────
function renderWeightTrend(logs) {
  const sorted = (logs || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-14);

  const latest = recent.length ? recent[recent.length - 1].weight_kg : null;
  const prev   = recent.length > 1 ? recent[recent.length - 2].weight_kg : null;

  const valEl   = document.getElementById('dashWtVal');
  const deltaEl = document.getElementById('dashWtDelta');
  if (valEl) valEl.textContent = latest ? latest.toFixed(1) : '—';
  if (deltaEl) {
    if (latest && prev) {
      const diff = +(latest - prev).toFixed(1);
      const sign = diff >= 0 ? '+' : '';
      deltaEl.textContent   = `${sign}${diff} kg`;
      deltaEl.style.color   = diff < 0 ? 'var(--accent)' : 'var(--accent-warm)';
      deltaEl.style.display = '';
    } else {
      deltaEl.style.display = 'none';
    }
  }

  const wrap = document.getElementById('dashWtChartWrap');
  const ctx  = document.getElementById('dashWtChart');
  if (!ctx) return;

  if (recent.length < 2) {
    if (wrap) wrap.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:12px;color:var(--text-faint)">Registre seu peso para ver a tendência</div>';
    return;
  }

  const labels = recent.map(l => { const [, m, d] = l.date.split('-'); return `${d}/${m}`; });
  const values = recent.map(l => l.weight_kg);

  if (_dashWtChart) { _dashWtChart.destroy(); _dashWtChart = null; }
  _dashWtChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: '#C4E538',
        backgroundColor: 'rgba(196,229,56,0.08)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#C4E538',
        fill: true,
        tension: 0.35,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 9, family: 'Manrope' }, maxTicksLimit: 7 },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          border: { display: false },
          ticks: { color: 'rgba(255,255,255,0.25)', font: { size: 9 }, callback: v => v + ' kg', maxTicksLimit: 3 },
        }
      },
      layout: { padding: { top: 4 } }
    }
  });
}

// ── Workout Summary ───────────────────────────────────────────────────────────
function renderWorkoutSummary(workout) {
  const el = document.getElementById('dashWorkout');
  if (!el) return;
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

  // Mini water card
  const miniValEl = document.getElementById('dashWaterTodayVal');
  const miniFill  = document.getElementById('dashWaterMiniBar');
  if (miniValEl) miniValEl.textContent = total_ml >= 1000 ? (total_ml / 1000).toFixed(1) + ' L' : total_ml + ' ml';
  if (miniFill)  miniFill.style.width  = pct + '%';

  // Full water card
  const goalEl    = document.getElementById('dashWaterGoal');
  const fillEl    = document.getElementById('dashWaterProgressFill');
  if (goalEl) goalEl.textContent = goal_ml >= 1000 ? (goal_ml / 1000).toFixed(1) + ' L' : goal_ml + ' ml';
  if (fillEl) fillEl.style.width = pct + '%';

  // Legacy compat
  const totalEl = document.getElementById('dashWaterTotal');
  const pctEl   = document.getElementById('dashWaterPct');
  const barEl   = document.getElementById('dashWaterBar');
  if (totalEl) totalEl.textContent = total_ml >= 1000 ? (total_ml / 1000).toFixed(1) + ' L' : total_ml + ' ml';
  if (pctEl)   pctEl.textContent   = Math.round(pct) + '%';
  if (barEl)   barEl.style.width   = pct + '%';

  const logsEl = document.getElementById('dashWaterLogs');
  if (!logsEl) return;
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
  const { streak = 0, longest = 0 } = data || {};

  const valEl    = document.getElementById('dashStreakVal');
  const flameEl  = document.getElementById('dashStreakFlame');
  const longEl   = document.getElementById('dashStreakLongest');

  if (valEl)   valEl.textContent  = streak;
  if (longEl)  longEl.textContent = longest > 0 ? `Recorde: ${longest} dias` : '';

  if (flameEl) {
    const flameSvg = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>`;
    const dropSvg  = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
    flameEl.style.color = streak >= 3 ? 'var(--accent-warm)' : 'var(--text-3)';
    flameEl.innerHTML   = streak >= 3 ? flameSvg : dropSvg;
  }
}

// ── Legacy stubs (kept for any external callers) ──────────────────────────────
function renderCalRing()     {}
function renderMacros()      {}
function renderWeight()      {}
function renderWeeklyReport(){}
