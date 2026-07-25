async function finishActiveWorkout(state) {
  const doneEx    = waExercises.filter(e => e.done);
  const toSave    = waExercises.filter(e => e.setsCompleted > 0);
  const totalSets = waExercises.reduce((s, e) => s + e.setsCompleted, 0);

  if (totalSets === 0 && !confirm('Nenhuma série concluída. Salvar mesmo assim?')) return;

  const today   = new Date().toISOString().slice(0, 10);
  const elapsed = waStartTime ? Math.floor((Date.now() - waStartTime) / 1000) : 0;
  const mm      = Math.floor(elapsed / 60);
  const ss      = elapsed % 60;
  const notesStr = `Duração: ${mm}m${ss < 10 ? '0' : ''}${ss}s | ${doneEx.length}/${waExercises.length} exercícios concluídos · ${totalSets} séries totais`;

  try {
    const wkRes     = await api.post('/api/workouts', { date: today, notes: notesStr });
    const workoutId = wkRes.id;

    for (const ex of toSave) {
      await api.post(`/api/workouts/${workoutId}/exercises`, {
        name: ex.name, sets: ex.setsCompleted, reps: ex.reps, weight_kg: ex.weight_kg
      });
    }

    // Check PRs for fully completed weighted exercises
    const prEligible = doneEx.filter(ex => ex.weight_kg && ex.reps);
    const prResults  = await Promise.all(
      prEligible.map(ex => api.post('/api/stats/prs/check', {
        exercise_name: ex.name, sets: ex.setsCompleted,
        reps: ex.reps, weight_kg: ex.weight_kg, date: today,
      }))
    );
    const newPRs = prEligible.map((ex, i) => ({ ex, result: prResults[i] })).filter(m => m.result.is_pr);

    // Volume: Σ(sets × reps × weight_kg), bodyweight exercises omitted
    const totalVolume = toSave.reduce((s, e) => s + e.setsCompleted * (e.reps || 0) * (e.weight_kg || 0), 0);

    // Muscles worked (unique tokens from all exercises)
    const muscleSet = {}, allMuscles = [];
    for (const ex of toSave) {
      const meta = EX_META[ex.name];
      if (!meta) continue;
      for (const m of meta.muscles) {
        if (!muscleSet[m]) { muscleSet[m] = true; allMuscles.push(m); }
      }
    }

    // Fetch latest body weight for calorie estimate
    let bodyWeightKg = null;
    try {
      const wData = await api.get('/api/diet/weight');
      const logs  = wData.logs || [];
      if (logs.length > 0) bodyWeightKg = logs[logs.length - 1].weight_kg;
    } catch (_) {}

    // MET-based calorie estimate — weighted by actual sets completed per exercise
    // compound(≥3 muscles)=6.0, isolated=3.5, cardio/unknown=8.0
    // weightedMET = Σ(MET_ex × setsCompleted_ex) / Σ(setsCompleted_ex)
    // Applied to actual elapsed time so total stays realistic
    let estimatedKcal = null;
    if (bodyWeightKg && elapsed > 0) {
      let metSetSum = 0, totalSetsSum = 0;
      for (const ex of toSave) {
        const n    = (EX_META[ex.name] && EX_META[ex.name].muscles.length) || 0;
        const met  = n === 0 ? 8.0 : n >= 3 ? 6.0 : 3.5;
        const sets = ex.setsCompleted || 1;
        metSetSum    += met * sets;
        totalSetsSum += sets;
      }
      const weightedMET = totalSetsSum > 0 ? metSetSum / totalSetsSum : 6.0;
      estimatedKcal = Math.round(weightedMET * bodyWeightKg * (elapsed / 3600));
    }

    // Persist summary columns
    await api.put(`/api/workouts/${workoutId}/finalize`, {
      total_volume:     totalVolume > 0 ? totalVolume : null,
      estimated_kcal:   estimatedKcal,
      duration_seconds: elapsed,
      muscles_worked:   allMuscles,
    });

    showWorkoutReport({
      elapsed, mm, ss, today, doneEx, totalSets,
      toSave, totalVolume, estimatedKcal, newPRs, allMuscles,
    });

    if (state.date === today) loadDashboard(state);

  } catch (err) { toast(err.message, 'error'); }
}

function showWorkoutReport(opts) {
  const { elapsed, mm, ss, today, doneEx, totalSets, toSave, totalVolume, estimatedKcal, newPRs, allMuscles } = opts;

  // Header
  document.getElementById('wkrDuration').textContent = `${mm}m${ss < 10 ? '0' : ''}${ss}s`;
  const d = new Date(today + 'T00:00:00');
  const WDAYS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const WMONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  document.getElementById('wkrDate').textContent =
    `${WDAYS[d.getDay()]}, ${d.getDate()} ${WMONTHS[d.getMonth()]}`;

  // Stats
  document.getElementById('wkrVolVal').textContent =
    totalVolume > 0 ? totalVolume.toLocaleString('pt-BR') + ' kg' : '—';
  document.getElementById('wkrExVal').textContent  = `${doneEx.length}/${toSave.length}`;
  document.getElementById('wkrSetsVal').textContent = totalSets;
  const kcalStat = document.getElementById('wkrStatKcal');
  if (estimatedKcal) {
    document.getElementById('wkrKcalVal').textContent = '~' + estimatedKcal + ' kcal';
    kcalStat.style.display = '';
  } else {
    kcalStat.style.display = 'none';
  }

  // Muscle map — 3-color system based on frequency per token
  const mapsWrap = document.getElementById('wkrMapsWrap');
  mapsWrap.innerHTML = '';
  if (window.createBodyHighlighter && allMuscles.length > 0) {
    const tMap = window.MUSCLE_TOKEN_MAP || {};

    // Count how many exercises use each token (primary=2pts, secondary=1pt)
    const tokenScore = {};
    for (const ex of toSave) {
      const meta = EX_META[ex.name];
      if (!meta) continue;
      meta.muscles.forEach((m, i) => {
        tokenScore[m] = (tokenScore[m] || 0) + (i === 0 ? 2 : 1);
      });
    }
    const maxScore = Math.max(0, ...Object.values(tokenScore));

    // Map token scores → 3 tiers (3=most worked, 1=least)
    const slugTier = {}, usedSlug = {};
    for (const [token, score] of Object.entries(tokenScore)) {
      const slug = tMap[token];
      if (!slug || usedSlug[slug]) continue;
      const norm = score / maxScore;
      const tier = norm >= 0.66 ? 3 : norm >= 0.33 ? 2 : 1;
      if (!slugTier[slug] || tier > slugTier[slug]) slugTier[slug] = tier;
      usedSlug[slug] = true;
    }
    const bhData = [3, 2, 1].map(freq => ({
      name: 'tier' + freq,
      muscles: Object.entries(slugTier).filter(([,f]) => f === freq).map(([s]) => s),
      frequency: freq,
    })).filter(d => d.muscles.length > 0);

    ['anterior', 'posterior'].forEach(type => {
      const col = document.createElement('div');
      col.className = 'mm-col';
      const lbl = document.createElement('span');
      lbl.className = 'mm-view-label';
      lbl.textContent = type === 'anterior' ? 'Frente' : 'Costas';
      col.appendChild(lbl);
      mapsWrap.appendChild(col);
      window.createBodyHighlighter({
        container: col, data: bhData, type,
        bodyColor: '#C8CDD2',
        highlightedColors: ['#F0997B', '#D85A30', '#993C1D'],
        wrapperClassName: 'rbh-wrapper mm-bh',
      });
    });
  }

  // PRs
  const prsWrap = document.getElementById('wkrPRsWrap');
  const prsList = document.getElementById('wkrPRsList');
  if (newPRs.length > 0) {
    prsList.innerHTML = newPRs.map(m =>
      `<div class="wkr-pr-item">
        <span class="wkr-pr-badge">PR</span>
        <span>${escHtml(m.ex.name)} — ${m.ex.weight_kg}kg × ${m.ex.reps} reps</span>
      </div>`
    ).join('');
    prsWrap.style.display = '';
  } else {
    prsWrap.style.display = 'none';
  }

  // Exercise list
  document.getElementById('wkrExList').innerHTML = toSave.map(ex => {
    const vol    = ex.weight_kg ? ex.setsCompleted * (ex.reps || 0) * ex.weight_kg : 0;
    const detail = [
      `${ex.setsCompleted}×${ex.reps || '—'}`,
      ex.weight_kg ? ex.weight_kg + 'kg' : '',
    ].filter(Boolean).join(' · ');
    return `<div class="wkr-ex-item">
      <span class="wkr-ex-name">${escHtml(ex.name)}</span>
      <span class="wkr-ex-meta">${detail}</span>
      <span class="wkr-ex-vol">${vol > 0 ? vol.toLocaleString('pt-BR') + ' kg' : '—'}</span>
    </div>`;
  }).join('');

  document.getElementById('wkReportModal').style.display = '';
}

function closeWorkoutReport() {
  document.getElementById('wkReportModal').style.display = 'none';
  closeActiveMode();
}
window.closeWorkoutReport = closeWorkoutReport;

function closeActiveMode() {
  clearInterval(waTimerInt);
  clearInterval(restTimerInt);
  waClearPersist();
  document.body.style.overflow = '';
  document.getElementById('workoutActive').style.display = 'none';
  document.getElementById('waTimer').textContent = '00:00';
  sessionPRs = [];
}

// ══════════════════════════════════════════
//  REGISTRAR SESSÃO MANUAL
