// Fuzzy lookup for EX_IMAGES and EX_META:
// 1. exact match → 2. strip "(parenthetical)" → 3. longest-prefix match
// Handles user exercises like "Remada Baixa (pegada neutra)", "Crossover / Crucifixo na Polia", etc.
(function buildExLookupCache() {
  const imgKeys  = Object.keys(EX_IMAGES);
  const metaKeys = Object.keys(EX_META);
  const allKeys  = [...new Set([...imgKeys, ...metaKeys])];

  window._waExKeys = allKeys; // sorted by length descending for prefix search
  window._waExKeys.sort((a, b) => b.length - a.length);
})();

function waFindExData(name) {
  // 1. Exact match
  if (EX_IMAGES[name] !== undefined || EX_META[name] !== undefined) {
    return { imgs: EX_IMAGES[name] ?? null, meta: EX_META[name] ?? null };
  }
  // 2. Strip parenthetical "(…)" and try again
  const stripped = name.replace(/\s*\([^)]*\)/g, '').replace(/\s*\/.*$/, '').trim();
  if (stripped && stripped !== name) {
    if (EX_IMAGES[stripped] !== undefined || EX_META[stripped] !== undefined) {
      return { imgs: EX_IMAGES[stripped] ?? null, meta: EX_META[stripped] ?? null };
    }
  }
  // 3. Longest-prefix match (e.g. "Remada Serrote c/ Halter" → "Remada Serrote")
  const haystack = name.toLowerCase();
  for (const key of (window._waExKeys || [])) {
    if (haystack.startsWith(key.toLowerCase())) {
      return { imgs: EX_IMAGES[key] ?? null, meta: EX_META[key] ?? null };
    }
  }
  return { imgs: null, meta: null };
}

function startActiveWorkout(dow) {
  const tpl = wkTemplates[dow];
  waWorkoutDow    = dow;
  waExercises     = (tpl?.exercises || []).map(ex => ({ ...ex, setsCompleted: 0, done: false }));
  waChecked       = 0;
  waCurrentExIdx  = 0;
  waPhase         = 'working';
  waRestTotalSecs = 90;

  clearInterval(restTimerInt);
  sessionPRs = [];

  document.getElementById('waTitle').textContent      = tpl?.name || DAYS_FULL[dow];
  document.getElementById('waAddExtra').style.display = 'none';
  document.getElementById('waExtraName').value        = '';

  renderWaFocus();
  updateWaProgress();
  startWaTimer();
  waPersist();

  document.getElementById('workoutActive').style.display = '';
  document.body.style.overflow = 'hidden';
}
window.startActiveWorkout = startActiveWorkout;

function renderWaFocus() {
  const body = document.getElementById('waBody');
  if (!waExercises.length) {
    body.innerHTML = '<p class="empty-state" style="margin:24px 18px">Nenhum exercício. Use "+ Extra" para adicionar.</p>';
    return;
  }

  if (waCurrentExIdx >= waExercises.length) {
    body.innerHTML = `
      <div class="wa-done-all">
        <div class="wa-done-all-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg></div>
        <div class="wa-done-all-title">Treino concluído!</div>
        <div class="wa-done-all-sub">Todos os exercícios finalizados.<br>Toque em Finalizar para salvar.</div>
      </div>`;
    const completeBtn = document.getElementById('waCompleteBtn');
    const finishBtn   = document.getElementById('waFinishBtn');
    if (completeBtn) completeBtn.style.display = 'none';
    if (finishBtn)   finishBtn.style.display   = '';
    return;
  }

  const ex        = waExercises[waCurrentExIdx];
  const totalSets = ex.sets || 3;
  const doneSets  = ex.setsCompleted;

  const dots = Array.from({ length: totalSets }, (_, i) => {
    const isDone   = i < doneSets;
    const isActive = i === doneSets;
    const cls      = isDone ? 'done' : isActive ? 'active' : 'pending';
    const content  = isDone
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
      : i + 1;
    return `<div class="wa-set-dot ${cls}">${content}</div>`;
  }).join('');

  const prescription = [
    totalSets + ' séries',
    ex.reps ? ex.reps + ' reps' : null
  ].filter(Boolean).join(' × ');

  const weightDisplay = (ex.weight_kg && ex.weight_kg > 0) ? ex.weight_kg + 'kg' : '—';

  // Exercise images (start + end position) — fuzzy lookup handles custom names
  const { imgs, meta: exMeta } = waFindExData(ex.name);
  const imgsHtml = imgs
    ? `<div class="wa-ex-images">
         <div class="wa-ex-img-wrap"><img src="${escHtml(imgs.imgStart)}" alt="Início" loading="lazy"><span class="wa-ex-img-lbl">Início</span></div>
         <div class="wa-ex-img-wrap"><img src="${escHtml(imgs.imgEnd)}"   alt="Fim"   loading="lazy"><span class="wa-ex-img-lbl">Fim</span></div>
       </div>`
    : '';
  const muscleHtml = exMeta ? '<div id="waExMuscleChip" class="wa-ex-muscle-inline"></div>' : '';

  const miniList = waExercises.map((e, idx) => {
    const cls       = e.done ? 'done' : idx === waCurrentExIdx ? 'active' : 'pending';
    const numIcon   = e.done
      ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
      : idx + 1;
    const setsDone  = e.setsCompleted || 0;
    const setsTotal = e.sets || 3;
    const pct       = Math.round((setsDone / setsTotal) * 100);
    const setsLabel = `${setsDone}/${setsTotal} séries`;
    const infoBtn   = EX_META[e.name]
      ? `<button type="button" class="wa-mini-info-btn"
           onclick="event.stopPropagation();showExerciseInfo('${escHtml(e.name).replace(/'/g, "\\'")}')"
           aria-label="Info ${escHtml(e.name)}">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
         </button>`
      : '';
    return `
      <div class="wa-mini-ex ${cls}" onclick="jumpToExercise(${idx})">
        <div class="wa-mini-icon">${numIcon}</div>
        <div class="wa-mini-body">
          <div class="wa-mini-name-row">
            <div class="wa-ex-name-mini">${escHtml(e.name)}</div>
            ${infoBtn}
          </div>
          <div class="wa-mini-prog-track"><div class="wa-mini-prog-fill" style="width:${pct}%"></div></div>
          <div class="wa-mini-sets">${setsLabel}</div>
        </div>
      </div>`;
  }).join('');

  body.innerHTML = `
    <div class="wa-focus-view">
      <div class="wa-ex-hero">
        <div class="wa-focus-badge">Exercício ${waCurrentExIdx + 1} de ${waExercises.length}</div>
        <div class="wa-focus-name">${escHtml(ex.name)}</div>
        <div class="wa-focus-prescription">${prescription}</div>
        <div class="wa-set-dots">${dots}</div>
        <div class="wa-set-label">Série ${doneSets + 1} de ${totalSets}</div>
        <div class="wa-weight-card">
          <div class="wa-weight-card-label">CARGA</div>
          <div class="wa-weight-card-row">
            <button class="wa-weight-btn" onclick="waWeightStep(-2.5)">−</button>
            <div class="wa-weight-val" id="waWeightVal">${weightDisplay}</div>
            <button class="wa-weight-btn" onclick="waWeightStep(2.5)">+</button>
          </div>
        </div>
        ${imgsHtml}
        ${muscleHtml}
      </div>
      <div class="wa-mini-section-label">Todos os exercícios</div>
      <div class="wa-mini-ex-list">${miniList}</div>
    </div>`;

  // Render muscle diagram chip (must run after innerHTML is set)
  if (exMeta && typeof renderChipMap === 'function') {
    const chipEl = document.getElementById('waExMuscleChip');
    if (chipEl) renderChipMap(chipEl, exMeta.muscles, autoView(exMeta.muscles));
  }

  // Update footer CTA
  const completeBtn = document.getElementById('waCompleteBtn');
  const finishBtn   = document.getElementById('waFinishBtn');
  const label       = document.getElementById('waCompleteBtnLabel');
  if (completeBtn) completeBtn.style.display = '';
  if (finishBtn)   finishBtn.style.display   = 'none';
  if (label)       label.textContent         = `Concluí a Série ${doneSets + 1}`;
}

function waWeightStep(delta) {
  const ex = waExercises[waCurrentExIdx];
  if (!ex) return;
  ex.weight_kg = Math.max(0, +((ex.weight_kg || 0) + delta).toFixed(2));
  const display = document.getElementById('waWeightVal');
  if (display) display.textContent = ex.weight_kg > 0 ? ex.weight_kg + 'kg' : '—';
  waPersist();
}
window.waWeightStep = waWeightStep;

function completeSet() {
  if (waPhase !== 'working') return;
  const ex = waExercises[waCurrentExIdx];
  if (!ex) return;

  ex.setsCompleted++;
  waPhase = 'resting';

  const allSetsDone    = ex.setsCompleted >= (ex.sets || 3);
  const isLastExercise = waCurrentExIdx >= waExercises.length - 1;

  if (allSetsDone) {
    ex.done = true;
    waChecked = waExercises.filter(e => e.done).length;
  }

  updateWaProgress();
  renderWaFocus();
  waPersist();

  if (allSetsDone && isLastExercise) {
    waNextLabel = 'Ver resultado';
  } else if (allSetsDone) {
    waNextLabel = 'Próximo exercício';
  } else {
    waNextLabel = `Próxima série (${ex.setsCompleted + 1}/${ex.sets || 3})`;
  }

  startRestTimer(90);
}
window.completeSet = completeSet;

function jumpToExercise(idx) {
  if (waPhase !== 'working') return;
  if (idx === waCurrentExIdx) return;
  waCurrentExIdx = idx;
  renderWaFocus();
  updateWaProgress();
  waPersist();
}
window.jumpToExercise = jumpToExercise;

function updateExWeight(val) {
  const w = parseFloat(val);
  if (waExercises[waCurrentExIdx]) {
    waExercises[waCurrentExIdx].weight_kg = isNaN(w) ? 0 : w;
    waPersist();
  }
}
window.updateExWeight = updateExWeight;

function proceedFromRest() {
  clearInterval(restTimerInt);

  const ex          = waExercises[waCurrentExIdx];
  const allSetsDone = ex && ex.setsCompleted >= (ex.sets || 3);

  if (allSetsDone) waCurrentExIdx++;

  waPhase = 'working';
  renderWaFocus();
  updateWaProgress();
  waPersist();
}
window.proceedFromRest = proceedFromRest;

function updateWaProgress() {
  const totalSets = waExercises.reduce((s, e) => s + (e.sets || 1), 0);
  const doneSets  = waExercises.reduce((s, e) => s + e.setsCompleted, 0);
  const pct       = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;
  const exDone    = waExercises.filter(e => e.done).length;
  const volume    = waExercises
    .filter(e => e.setsCompleted > 0)
    .reduce((s, e) => s + e.setsCompleted * (e.reps || 0) * (e.weight_kg || 0), 0);

  document.getElementById('waProgBar').style.width   = pct + '%';
  document.getElementById('waProgLabel').textContent =
    `${doneSets} de ${totalSets} séries · ${waExercises.length} exercícios`;
}

// ── Rest Timer — circular ring ────────────────────────────────────────────────
function renderRestScreen() {
  const ex          = waExercises[waCurrentExIdx];
  const allSetsDone = ex && ex.setsCompleted >= (ex.sets || 3);

  let nextLabel, nextName;
  if (allSetsDone) {
    const nextEx = waExercises[waCurrentExIdx + 1];
    if (nextEx) { nextLabel = 'Próximo exercício'; nextName = nextEx.name; }
    else        { nextLabel = 'Último concluído!'; nextName = 'Toque para finalizar'; }
  } else {
    nextLabel = `Série ${(ex?.setsCompleted || 0) + 1} de ${ex?.sets || 3}`;
    nextName  = ex?.name || '';
  }

  const completeBtn = document.getElementById('waCompleteBtn');
  const finishBtn   = document.getElementById('waFinishBtn');
  if (completeBtn) completeBtn.style.display = 'none';
  if (finishBtn)   finishBtn.style.display   = 'none';

  document.getElementById('waBody').innerHTML = `
    <div class="wa-rest-screen">
      <div class="wa-rest-label">Descansando</div>
      <div class="wa-ring-wrap">
        <svg class="wa-ring-svg" viewBox="0 0 200 200">
          <circle class="wa-ring-track" cx="100" cy="100" r="${WA_RING_R}"/>
          <circle class="wa-ring-arc"   cx="100" cy="100" r="${WA_RING_R}"
            id="waRingArc"
            stroke-dasharray="${WA_RING_CIRC}"
            stroke-dashoffset="0"/>
        </svg>
        <div class="wa-ring-center">
          <div class="wa-ring-time"  id="waRestTimerCount">--</div>
          <div class="wa-ring-ready" id="waRingReady" style="display:none">Pronto!</div>
        </div>
      </div>
      <div class="wa-rest-next-info">
        <div class="wa-rest-next-label">${escHtml(nextLabel)}</div>
        <div class="wa-rest-next-name">${escHtml(nextName)}</div>
      </div>
      <div class="wa-rest-adjust">
        <button class="btn btn-ghost btn-sm" onclick="adjustRestTimer(-15)">-15s</button>
        <button id="waSkipBtn" class="btn btn-ghost btn-sm wa-skip-btn" onclick="proceedFromRest()">Pular descanso</button>
        <button class="btn btn-ghost btn-sm" onclick="adjustRestTimer(+15)">+15s</button>
      </div>
    </div>`;

  updateRestTimerDisplay();
}

function startRestTimer(secs) {
  clearInterval(restTimerInt);
  restTimerSecs   = secs;
  waRestTotalSecs = secs;

  renderRestScreen();

  restTimerInt = setInterval(() => {
    restTimerSecs--;
    if (restTimerSecs <= 0) {
      restTimerSecs = 0;
      clearInterval(restTimerInt);
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      updateRestTimerDisplay();

      const arcEl   = document.getElementById('waRingArc');
      const countEl = document.getElementById('waRestTimerCount');
      const readyEl = document.getElementById('waRingReady');
      const skipBtn = document.getElementById('waSkipBtn');

      if (arcEl)   arcEl.classList.add('complete');
      if (countEl) countEl.style.display = 'none';
      if (readyEl) readyEl.style.display = '';
      if (skipBtn) { skipBtn.textContent = waNextLabel; skipBtn.classList.add('ready'); }
    } else {
      updateRestTimerDisplay();
    }
  }, 1000);
}

function updateRestTimerDisplay() {
  const secs    = Math.max(restTimerSecs, 0);
  const countEl = document.getElementById('waRestTimerCount');
  const arcEl   = document.getElementById('waRingArc');

  if (countEl) {
    const m = Math.floor(secs / 60);
    const s = String(secs % 60).padStart(2, '0');
    countEl.textContent = `${m}:${s}`;
  }
  if (arcEl && waRestTotalSecs > 0) {
    const offset = (WA_RING_CIRC * (1 - secs / waRestTotalSecs)).toFixed(2);
    arcEl.style.strokeDashoffset = offset;
  }
}

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
    waExercises.push({ name, sets: 3, reps: null, weight_kg: null, setsCompleted: 0, done: false });
    document.getElementById('waExtraName').value = '';
    document.getElementById('waAddExtra').style.display = 'none';
    updateWaProgress();
    renderWaFocus();
  });

  // Finish
  document.getElementById('waFinishBtn').addEventListener('click', async () => {
    await finishActiveWorkout(state);
  });
}

