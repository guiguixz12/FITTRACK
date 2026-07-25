/* Progress tab — period tabs (Semana / Mês / 3 Meses / Ano) */
let pgPeriodDays    = 7;
let pgWeightChartInst = null;
let pgState         = null;

function initProgress(state) {
  pgState = state;
  document.querySelectorAll('[data-pgperiod]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-pgperiod]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      pgPeriodDays = parseInt(btn.dataset.pgperiod);
      loadProgress(state);
    });
  });
}

async function loadProgress(state) {
  pgState = state;
  const today = new Date().toISOString().slice(0, 10);
  try {
    const [statsData, weightData, waterData] = await Promise.all([
      api.get(`/api/stats/range?days=${pgPeriodDays}`),
      api.get(`/api/diet/weight?days=${pgPeriodDays}`),
      api.get(`/api/water?date=${today}`),
    ]);
    renderPgCalories(statsData);
    renderPgWater(waterData);
    renderPgWeight(weightData);
  } catch (err) {
    console.error('loadProgress error', err);
  }
}

// ── Calories bar chart ────────────────────────────────────────────────────────

function renderPgCalories(data) {
  const { days, summary, prevSummary } = data;
  const avg = summary.avgCalories;

  document.getElementById('pgCalAvg').textContent =
    avg > 0 ? avg.toLocaleString('pt-BR') : '—';

  const badge   = document.getElementById('pgCalBadge');
  const cmpText = document.getElementById('pgCalCompareText');
  if (avg > 0 && prevSummary.avgCalories > 0) {
    const pct = Math.round((avg - prevSummary.avgCalories) / prevSummary.avgCalories * 100);
    badge.textContent = (pct >= 0 ? '↑' : '↓') + Math.abs(pct) + '%';
    badge.className = 'pg-badge ' + (pct <= 0 ? 'pg-badge--good' : 'pg-badge--warn');
    badge.style.display  = '';
    cmpText.textContent  = pgPeriodDays === 7 ? 'vs sem. passada' : pgPeriodDays === 30 ? 'vs mês passado' : 'vs período ant.';
    cmpText.style.display = '';
  } else {
    badge.style.display   = 'none';
    cmpText.style.display = 'none';
  }

  const container = document.getElementById('pgCalBars');
  if (!days || !days.length) {
    container.innerHTML = '<div class="pg-bars-loading">Nenhum dado ainda</div>';
    return;
  }

  let bars;
  if (pgPeriodDays <= 30) {
    bars = days.map(d => ({ ...d }));
  } else if (pgPeriodDays <= 90) {
    bars = pgAggregateByWeek(days);
  } else {
    bars = pgAggregateByMonth(days);
  }

  const maxCal = Math.max(...bars.map(b => b.calories), 1);
  const today  = new Date().toISOString().slice(0, 10);
  const DOW_ABBR = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const barsHtml = bars.map(b => {
    const pct     = b.calories > 0 ? Math.max(Math.round(b.calories / maxCal * 100), 5) : 0;
    const isToday = b.date === today;
    const color   = isToday ? 'var(--orange)' : 'var(--accent)';
    const opacity = b.calories === 0 ? '0.15' : '1';
    let label;
    if (pgPeriodDays <= 7) {
      label = DOW_ABBR[new Date(b.date + 'T12:00:00').getDay()];
    } else if (pgPeriodDays <= 30) {
      const d = new Date(b.date + 'T12:00:00').getDate();
      label = (d === 1 || d % 5 === 0) ? d : '';
    } else {
      label = b.label || '';
    }
    return `<div class="pg-bar-col">
      <div class="pg-bar-wrap">
        <div class="pg-bar" style="height:${pct}%;background:${color};opacity:${opacity}"></div>
      </div>
      <div class="pg-bar-label">${label}</div>
    </div>`;
  }).join('');

  const avgPct = avg > 0 ? Math.round(avg / maxCal * 100) : 0;

  container.innerHTML = `<div class="pg-bars-inner" style="--avg-top:${100 - avgPct}%">${barsHtml}</div>`;
}

function pgAggregateByWeek(days) {
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    const chunk  = days.slice(i, i + 7);
    const logged = chunk.filter(d => d.calories > 0);
    const avg    = logged.length
      ? Math.round(logged.reduce((s, d) => s + d.calories, 0) / logged.length)
      : 0;
    const today = new Date().toISOString().slice(0, 10);
    weeks.push({
      label: `S${weeks.length + 1}`,
      calories: avg,
      date: chunk[chunk.length - 1].date,
      isToday: chunk.some(d => d.date === today),
    });
  }
  return weeks;
}

function pgAggregateByMonth(days) {
  const MO  = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const map = {};
  days.forEach(d => {
    const m = d.date.slice(0, 7);
    if (!map[m]) map[m] = { cals: [], lastDate: d.date };
    if (d.calories > 0) map[m].cals.push(d.calories);
    map[m].lastDate = d.date;
  });
  return Object.entries(map).map(([m, v]) => ({
    label:    MO[parseInt(m.slice(5, 7)) - 1],
    calories: v.cals.length
      ? Math.round(v.cals.reduce((s, c) => s + c, 0) / v.cals.length)
      : 0,
    date:    v.lastDate,
    isToday: false,
  }));
}

// ── Water card ────────────────────────────────────────────────────────────────

function renderPgWater(data) {
  const total = data.total_ml || 0;
  const goal  = data.goal_ml  || 2000;
  const pct   = Math.min(Math.round(total / goal * 100), 100);

  document.getElementById('pgWaterFrac').textContent = `${(total / 1000).toFixed(1)}L / ${(goal / 1000).toFixed(1)}L`;
  document.getElementById('pgWaterFill').style.width = pct + '%';
}

async function pgAddWater() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    await api.post('/api/water', { date: today, amount_ml: 250 });
    const data = await api.get(`/api/water?date=${today}`);
    renderPgWater(data);
    if (typeof renderWater === 'function') renderWater(data, today);
  } catch (e) { toast(e.message, 'error'); }
}
window.pgAddWater = pgAddWater;

// ── Weight trend chart ────────────────────────────────────────────────────────

function renderPgWeight(logs) {
  const canvas = document.getElementById('pgWeightChart');
  if (!canvas) return;
  if (pgWeightChartInst) { pgWeightChartInst.destroy(); pgWeightChartInst = null; }

  const weights = (logs || []).filter(l => l.weight_kg > 0);
  const badge   = document.getElementById('pgWeightBadge');
  const cmpText = document.getElementById('pgWeightCompareText');

  if (!weights.length) {
    document.getElementById('pgWeightAvg').textContent = '—';
    badge.style.display   = 'none';
    cmpText.style.display = 'none';
    return;
  }

  const avg = (weights.reduce((s, l) => s + l.weight_kg, 0) / weights.length).toFixed(1);
  document.getElementById('pgWeightAvg').textContent = avg;

  // Compare first vs second half for trend
  const half = Math.floor(weights.length / 2);
  if (half > 0 && weights.length > 1) {
    const avgFirst = weights.slice(0, half).reduce((s, l) => s + l.weight_kg, 0) / half;
    const avgSec   = weights.slice(half).reduce((s, l) => s + l.weight_kg, 0) / (weights.length - half);
    const diff     = +(avgSec - avgFirst).toFixed(1);
    if (Math.abs(diff) >= 0.1) {
      badge.textContent = (diff >= 0 ? '↑' : '↓') + Math.abs(diff) + ' kg';
      badge.className   = 'pg-badge ' + (diff <= 0 ? 'pg-badge--good' : 'pg-badge--warn');
      badge.style.display   = '';
      cmpText.textContent   = 'tendência do período';
      cmpText.style.display = '';
    } else {
      badge.style.display = 'none'; cmpText.style.display = 'none';
    }
  } else {
    badge.style.display = 'none'; cmpText.style.display = 'none';
  }

  const ctx = canvas.getContext('2d');
  pgWeightChartInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels: weights.map(() => ''),
      datasets: [{
        data:               weights.map(l => l.weight_kg),
        borderColor:        '#C4E538',
        backgroundColor:    'transparent',
        borderWidth:        2.5,
        pointBackgroundColor: '#C4E538',
        pointRadius:        weights.length > 20 ? 0 : 4,
        pointHoverRadius:   5,
        tension:            0.4,
      }],
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales:  { x: { display: false }, y: { display: false } },
    },
  });
}
