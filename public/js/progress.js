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
  const views = ['peso', 'semana', 'records', 'fotos'];
  views.forEach(v => {
    const el = document.getElementById(`pgView${v.charAt(0).toUpperCase() + v.slice(1)}`);
    if (el) el.style.display = v === view ? '' : 'none';
  });
}

function loadPgView(view, state) {
  if (view === 'peso')    loadEvolution(state);
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
