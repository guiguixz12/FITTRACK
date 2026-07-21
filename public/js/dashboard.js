/* Dashboard tab */
const RING_CIRC = 2 * Math.PI * 69.4; // 435.84

function initDashboard(state) {
  const dateInput = document.getElementById('dashDate');

  document.getElementById('dashPrevDay').addEventListener('click', () => {
    const d = new Date(dateInput.value + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    state.date = dateInput.value = d.toISOString().slice(0, 10);
    loadDashboard(state);
  });

  document.getElementById('dashNextDay').addEventListener('click', () => {
    const d = new Date(dateInput.value + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    state.date = dateInput.value = d.toISOString().slice(0, 10);
    loadDashboard(state);
  });

  dateInput.addEventListener('change', () => {
    state.date = dateInput.value;
    loadDashboard(state);
  });
}

async function loadDashboard(state) {
  const date = state.date;
  document.getElementById('dashDate').value = date;

  const [dietData, weightData, workoutData, allWeights] = await Promise.all([
    api.get(`/api/diet/logs?date=${date}`),
    api.get(`/api/diet/weight?date=${date}`),
    api.get(`/api/workouts?date=${date}`),
    api.get('/api/diet/weight')
  ]);

  renderCalRing(dietData.log, state.user);
  renderMacros(dietData.log, state.user);
  renderWeight(weightData.log, allWeights.logs, date);
  renderWorkoutSummary(workoutData.workout);
}

function renderCalRing(log, user) {
  const consumed = log?.calories || 0;
  const target   = user?.target_calories || 2000;
  const pct      = Math.min(consumed / target, 1);
  const offset   = RING_CIRC * (1 - pct);
  const ring     = document.getElementById('calRing');

  document.getElementById('dashCalories').textContent = consumed;
  document.getElementById('dashCalTarget').textContent = target;
  ring.style.strokeDashoffset = offset.toFixed(2);

  // pulse animation when at/over target
  ring.classList.toggle('complete', consumed >= target);

  const remain    = target - consumed;
  const remainEl  = document.getElementById('dashCalRemain');
  if (remain > 0) {
    remainEl.textContent     = `Faltam ${remain} kcal`;
    remainEl.style.color     = 'var(--text-muted)';
  } else if (remain < 0) {
    remainEl.textContent     = `${Math.abs(remain)} kcal acima da meta`;
    remainEl.style.color     = 'var(--red)';
  } else {
    remainEl.textContent     = '🎯 Meta atingida!';
    remainEl.style.color     = 'var(--green)';
  }
}

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

function renderWeight(todayLog, allLogs, date) {
  const logs   = (allLogs || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const prev   = logs.filter(l => l.date < date).at(-1);
  const recent = logs.slice(-30); // last 30 entries for stats

  // Elements
  const weightEl    = document.getElementById('dashWeight');
  const unitEl      = document.getElementById('dashWeightUnit');
  const noDataEl    = document.getElementById('dashWeightNoData');
  const changeRowEl = document.getElementById('dashWeightChangeRow');
  const changeEl    = document.getElementById('dashWeightChange');
  const vsEl        = document.getElementById('dashWeightVs');
  const sparkEl     = document.getElementById('dashWeightSparkline');
  const rangeRowEl  = document.getElementById('dashWeightRangeRow');
  const hintEl      = document.getElementById('dashWeightHint');

  // Reset
  noDataEl.style.display    = 'none';
  changeRowEl.style.display = 'none';
  sparkEl.style.display     = 'none';
  rangeRowEl.style.display  = 'none';
  hintEl.style.display      = 'none';

  const displayLog = todayLog || prev;

  if (!displayLog) {
    weightEl.textContent  = '—';
    unitEl.style.display  = 'none';
    hintEl.style.display  = '';
    return;
  }

  weightEl.textContent = displayLog.weight_kg.toFixed(1);
  unitEl.style.display = '';

  // If showing a past record (no entry today)
  if (!todayLog) {
    const d = displayLog.date.split('-');
    noDataEl.textContent  = `Último registro: ${d[2]}/${d[1]}/${d[0]}. Sem registro para hoje.`;
    noDataEl.style.display = '';
    hintEl.style.display   = '';
  }

  // Change vs previous entry
  const compareLog = todayLog ? prev : logs.filter(l => l.date < displayLog.date).at(-1);
  if (compareLog) {
    const diff = +(displayLog.weight_kg - compareLog.weight_kg).toFixed(1);
    const d    = compareLog.date.split('-');
    const dateStr = `${d[2]}/${d[1]}`;
    if (diff > 0) {
      changeEl.textContent = `▲ +${diff} kg`;
      changeEl.className   = 'weight-change up';
      vsEl.textContent     = `vs. ${dateStr}`;
    } else if (diff < 0) {
      changeEl.textContent = `▼ ${diff} kg`;
      changeEl.className   = 'weight-change down';
      vsEl.textContent     = `vs. ${dateStr}`;
    } else {
      changeEl.textContent = `= sem variação`;
      changeEl.className   = 'weight-change same';
      vsEl.textContent     = `vs. ${dateStr}`;
    }
    changeRowEl.style.display = '';
  }

  // Sparkline — last 7 recorded entries
  const spark7 = logs.slice(-7);
  if (spark7.length >= 2) {
    const vals  = spark7.map(l => l.weight_kg);
    const sMin  = Math.min(...vals);
    const sMax  = Math.max(...vals);
    const range = sMax - sMin || 1;
    sparkEl.style.display = '';
    sparkEl.innerHTML = spark7.map(l => {
      const pct      = Math.round(((l.weight_kg - sMin) / range) * 80 + 15);
      const isToday  = l.date === date;
      return `<div class="weight-spark-bar${isToday ? ' today-bar' : ''}"
        style="height:${pct}%"
        title="${l.weight_kg.toFixed(1)} kg — ${l.date.slice(8)}/${l.date.slice(5,7)}"></div>`;
    }).join('');
  }

  // Range stats (last 30 entries)
  if (recent.length >= 2) {
    const vals = recent.map(l => l.weight_kg);
    document.getElementById('dashWeightMin').textContent   = Math.min(...vals).toFixed(1) + ' kg';
    document.getElementById('dashWeightMax').textContent   = Math.max(...vals).toFixed(1) + ' kg';
    document.getElementById('dashWeightCount').textContent = logs.length;
    rangeRowEl.style.display = '';
  }
}

function renderWorkoutSummary(workout) {
  const el = document.getElementById('dashWorkout');
  if (!workout || !workout.exercises?.length) {
    el.innerHTML = '<span style="color:var(--text-faint);font-size:.88rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Nenhum treino registrado</span>';
    return;
  }
  el.innerHTML = workout.exercises.map(ex => {
    const meta = [
      ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : '',
      ex.weight_kg       ? `${ex.weight_kg}kg`      : ''
    ].filter(Boolean).join(' @ ');
    return `<span class="workout-exercise-chip">${ex.name}${meta ? ' · ' + meta : ''}</span>`;
  }).join('');
  if (workout.notes) {
    el.innerHTML += `<p style="margin-top:9px;font-size:.82rem;color:var(--text-muted);line-height:1.5">${workout.notes}</p>`;
  }
}
