/* Progress tab — Peso, Semana, Records, Fotos */
let currentPgView = 'peso';

function initProgress(state) {
  // Sub-tab switching
  document.querySelectorAll('[data-pgview]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-pgview]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPgView = btn.dataset.pgview;
      showPgView(currentPgView, state);
      loadPgView(currentPgView, state);
    });
  });

  // Wire evolution period buttons (they live in pgViewPeso)
  initEvolution(state);

  // Wire photos form + lightbox (they live in pgViewFotos)
  initPhotos(state);
}

function loadProgress(state) {
  loadPgView(currentPgView, state);
}

function showPgView(view, state) {
  const views = ['peso', 'cargas', 'semana', 'records', 'fotos'];
  views.forEach(v => {
    const el = document.getElementById(`pgView${v.charAt(0).toUpperCase() + v.slice(1)}`);
    if (el) el.style.display = v === view ? '' : 'none';
  });
}

function loadPgView(view, state) {
  if (view === 'peso')    loadEvolution(state);
  if (view === 'cargas')  loadCargas();
  if (view === 'semana')  loadPgSemana(state);
  if (view === 'records') loadPgRecords(state);
  if (view === 'fotos')   loadPhotos(state);
}

// ── Semana ────────────────────────────────────────────────────────────────────
async function loadPgSemana(state) {
  const el = document.getElementById('progWeeklyReport');
  if (!el) return;
  el.innerHTML = '<span style="color:var(--text-3);font-size:.82rem">Carregando...</span>';
  try {
    const data = await api.get('/api/stats/weekly');
    renderPgWeekly(el, data);
  } catch {
    el.innerHTML = '<span style="color:var(--text-3);font-size:.82rem">Não foi possível carregar.</span>';
  }
}

function renderPgWeekly(el, data) {
  if (!data || !data.days) { el.innerHTML = '<span class="empty-state">Sem dados esta semana.</span>'; return; }
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
      <div class="weekly-stat">
        <div class="weekly-stat-val">${summary.avgCalories || '—'}</div>
        <div class="weekly-stat-label">kcal médio</div>
      </div>
      <div class="weekly-stat">
        <div class="weekly-stat-val">${summary.avgProtein || '—'}g</div>
        <div class="weekly-stat-label">prot médio</div>
      </div>
      <div class="weekly-stat">
        <div class="weekly-stat-val">${summary.trainedDays}</div>
        <div class="weekly-stat-label">treinos</div>
      </div>
      <div class="weekly-stat">
        <div class="weekly-stat-val">${summary.loggedDays}</div>
        <div class="weekly-stat-label">dias log</div>
      </div>
    </div>`;
}

// ── Records ───────────────────────────────────────────────────────────────────
async function loadPgRecords(state) {
  try {
    const [streakData, prData] = await Promise.all([
      api.get('/api/stats/streak'),
      api.get('/api/stats/prs')
    ]);
    renderPgStreak(streakData);
    renderPgPRs(prData);
  } catch (err) {
    console.error('loadPgRecords error', err);
  }
}

function renderPgStreak(data) {
  const { streak = 0, longest = 0 } = data || {};

  const flameEl = document.getElementById('progStreakFlame');
  const valEl   = document.getElementById('progStreakVal');
  const longEl  = document.getElementById('progStreakLongest');

  if (flameEl) flameEl.textContent = streak >= 30 ? '🔥🔥🔥' : streak >= 14 ? '🔥🔥' : streak >= 3 ? '🔥' : '💧';
  if (valEl)   valEl.textContent   = streak;
  if (longEl)  longEl.textContent  = longest > 0 ? `Recorde: ${longest} dias` : '';
}

function renderPgPRs(data) {
  const el = document.getElementById('progPRList');
  if (!el) return;
  const prs = data?.prs || [];
  if (!prs.length) {
    el.innerHTML = '<div class="empty-state">Nenhum record registrado ainda.<br>Complete treinos com cargas para criar seus PRs!</div>';
    return;
  }
  el.innerHTML = prs.map(pr => {
    const d = pr.date ? pr.date.split('-') : null;
    const dateStr = d ? `${d[2]}/${d[1]}/${d[0]}` : '';
    const sets = pr.sets && pr.reps ? `${pr.sets}×${pr.reps}` : '';
    return `
      <div class="pr-item">
        <div class="pr-badge">PR</div>
        <div class="pr-name">${pr.exercise_name}</div>
        <div>
          <div class="pr-stats">${pr.weight_kg}kg${sets ? ' · ' + sets : ''}</div>
          <div class="pr-date">${dateStr}</div>
        </div>
      </div>`;
  }).join('');
}

// ══════════════════════════════════════════
//  CARGAS — load evolution per exercise
// ══════════════════════════════════════════
let cargasChart = null;
let cargasNames = [];

async function loadCargas() {
  // Load exercise names if not loaded yet
  if (!cargasNames.length) {
    try {
      const data = await api.get('/api/stats/exercise-history');
      cargasNames = data.names || [];
    } catch {}
  }
}

function onCargasSearch(val) {
  const box = document.getElementById('pgCargasSuggestions');
  if (!val.trim()) { box.style.display = 'none'; return; }

  const matches = cargasNames.filter(n => n.toLowerCase().includes(val.toLowerCase())).slice(0, 8);
  if (!matches.length) { box.style.display = 'none'; return; }

  box.innerHTML = matches.map(n =>
    `<div class="cargas-suggestion" onclick="selectCargasEx(${JSON.stringify(n)})">${n}</div>`
  ).join('');
  box.style.display = '';
}
window.onCargasSearch = onCargasSearch;

async function selectCargasEx(name) {
  document.getElementById('pgCargasSearch').value = name;
  document.getElementById('pgCargasSuggestions').style.display = 'none';

  try {
    const data = await api.get(`/api/stats/exercise-history?name=${encodeURIComponent(name)}`);
    renderCargasChart(name, data.history || []);
  } catch {}
}
window.selectCargasEx = selectCargasEx;

function renderCargasChart(name, history) {
  const emptyEl  = document.getElementById('pgCargasEmpty');
  const chartWrap = document.getElementById('pgCargasChart');
  const statsEl  = document.getElementById('pgCargasStats');
  const histEl   = document.getElementById('pgCargasHistory');

  if (!history.length) {
    emptyEl.textContent = `Nenhum registro com carga encontrado para "${name}".`;
    emptyEl.style.display = '';
    chartWrap.style.display = 'none';
    histEl.innerHTML = '';
    return;
  }

  emptyEl.style.display = 'none';
  chartWrap.style.display = '';

  const labels  = history.map(h => { const d = h.date.split('-'); return `${d[2]}/${d[1]}`; });
  const weights = history.map(h => h.weight_kg);

  if (cargasChart) { cargasChart.destroy(); cargasChart = null; }
  const ctx = document.getElementById('cargasChart').getContext('2d');
  cargasChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Carga (kg)',
        data: weights,
        borderColor: '#FF6B35',
        backgroundColor: 'rgba(255,107,53,.12)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#FF6B35',
        fill: true,
        tension: 0.3,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#8E8E93' } },
        y: { grid: { color: 'rgba(0,0,0,.06)' }, ticks: { font: { size: 10 }, color: '#8E8E93', callback: v => v + ' kg' } }
      }
    }
  });

  // Stats row
  const max  = Math.max(...weights);
  const last = weights[weights.length - 1];
  const prev = weights.length > 1 ? weights[weights.length - 2] : null;
  const diff = prev !== null ? (last - prev) : null;
  const diffStr = diff !== null ? (diff >= 0 ? `+${diff}` : `${diff}`) + ' kg' : '—';
  statsEl.innerHTML = `
    <div class="stat-box"><div class="stat-label">Atual</div><div class="stat-value mono">${last} kg</div></div>
    <div class="stat-box"><div class="stat-label">Máximo</div><div class="stat-value mono">${max} kg</div></div>
    <div class="stat-box"><div class="stat-label">Variação</div><div class="stat-value mono" style="color:${diff >= 0 ? 'var(--green)' : 'var(--red)'}">${diffStr}</div></div>`;

  // History list
  histEl.innerHTML = `<div class="card"><div class="card-label">Histórico — ${name}</div>` +
    [...history].reverse().map(h => {
      const d = h.date.split('-');
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:.82rem;color:var(--text-2)">${d[2]}/${d[1]}/${d[0]}</span>
        <span style="font-size:.9rem;font-weight:700;color:var(--text)">${h.weight_kg} kg</span>
        <span style="font-size:.75rem;color:var(--text-3)">${h.sets || '?'}×${h.reps || '?'}</span>
      </div>`;
    }).join('') + '</div>';
}
