/* Evolution tab — weight chart */
let weightChart = null;
let currentPeriod = 30;

function initEvolution(state) {
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPeriod = btn.dataset.days === 'all' ? 'all' : parseInt(btn.dataset.days);
      loadEvolution(state);
    });
  });
}

async function loadEvolution(state) {
  const url = currentPeriod === 'all'
    ? '/api/diet/weight'
    : `/api/diet/weight?days=${currentPeriod}`;

  const [weightResp, userResp] = await Promise.all([
    api.get(url),
    api.get('/api/auth/me')
  ]);

  const { logs }      = weightResp;
  const targetWeight  = userResp?.user?.target_weight || null;

  if (!logs || logs.length === 0) {
    renderEmptyChart(targetWeight);
    document.getElementById('statCurrent').textContent = '—';
    document.getElementById('statMin').textContent = '—';
    document.getElementById('statMax').textContent = '—';
    return;
  }

  const labels = logs.map(l => fmtDate(l.date));
  const data   = logs.map(l => l.weight_kg);

  const current = data[data.length - 1];
  const min     = Math.min(...data);
  const max     = Math.max(...data);

  document.getElementById('statCurrent').textContent = current.toFixed(1) + ' kg';
  document.getElementById('statMin').textContent     = min.toFixed(1) + ' kg';
  document.getElementById('statMax').textContent     = max.toFixed(1) + ' kg';

  renderChart(labels, data, targetWeight);
}

function renderChart(labels, data, targetWeight) {
  const ctx = document.getElementById('weightChart').getContext('2d');

  if (weightChart) weightChart.destroy();

  const gradient = ctx.createLinearGradient(0, 0, 0, 220);
  gradient.addColorStop(0, 'rgba(255, 107, 53, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 107, 53, 0)');

  const datasets = [{
    label: 'Peso (kg)',
    data,
    borderColor: '#FF6B35',
    backgroundColor: gradient,
    borderWidth: 2,
    pointBackgroundColor: '#FF6B35',
    pointRadius: data.length > 30 ? 2 : 4,
    pointHoverRadius: 6,
    tension: 0.3,
    fill: true,
    order: 1,
  }];

  if (targetWeight) {
    datasets.push({
      label: `Meta: ${targetWeight} kg`,
      data: Array(labels.length).fill(targetWeight),
      borderColor: 'rgba(80,200,120,0.7)',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderDash: [6, 4],
      pointRadius: 0,
      pointHoverRadius: 0,
      tension: 0,
      fill: false,
      order: 2,
    });
  }

  weightChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: !!targetWeight,
          labels: {
            color: '#888',
            font: { size: 11 },
            boxWidth: 20,
            usePointStyle: true,
            filter: item => item.text.startsWith('Meta'),
          }
        },
        tooltip: {
          backgroundColor: '#2D2F31',
          borderColor: '#3A3C3E',
          borderWidth: 1,
          titleColor: '#888',
          bodyColor: '#fff',
          bodyFont: { family: 'JetBrains Mono', size: 13 },
          callbacks: {
            label: (ctx) => ctx.dataset.label.startsWith('Meta')
              ? ` ${ctx.dataset.label}`
              : ` ${ctx.parsed.y.toFixed(1)} kg`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#888', font: { size: 10 }, maxTicksLimit: 8, maxRotation: 0 },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        y: {
          ticks: { color: '#888', font: { family: 'JetBrains Mono', size: 11 }, callback: v => v + ' kg' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
}

function renderEmptyChart(targetWeight) {
  const ctx = document.getElementById('weightChart').getContext('2d');
  if (weightChart) weightChart.destroy();
  weightChart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ data: [] }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Nenhum dado de peso registrado',
          color: '#888',
          font: { size: 14 }
        }
      },
      scales: { x: { display: false }, y: { display: false } }
    }
  });
}
