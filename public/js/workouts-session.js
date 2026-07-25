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
    return;
  }

  const ex        = waExercises[waCurrentExIdx];
  const totalSets = ex.sets || 3;
  const doneSets  = ex.setsCompleted;

  const dots = Array.from({ length: totalSets }, (_, i) => {
    const cls = i < doneSets ? 'done' : i === doneSets ? 'active' : 'pending';
    return `<div class="wa-set-dot ${cls}">${i < doneSets ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : i + 1}</div>`;
  }).join('');

  const prescription = [
    totalSets + ' séries',
    ex.reps ? ex.reps + ' reps' : null
  ].filter(Boolean).join(' × ');

  const miniList = waExercises.map((e, idx) => {
    const cls       = e.done ? 'done' : idx === waCurrentExIdx ? 'active' : 'pending';
    const icon      = e.done ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : idx === waCurrentExIdx ? '&#9654;' : idx + 1;
    const setsLabel = e.done
      ? `${e.sets}/${e.sets} <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
      : idx === waCurrentExIdx
        ? `${e.setsCompleted}/${e.sets || 3}`
        : `0/${e.sets || 3}`;
    const infoBtn = EX_META[e.name]
      ? `<button type="button" class="wa-mini-info-btn"
           onclick="event.stopPropagation();showExerciseInfo('${escHtml(e.name).replace(/'/g, "\\'")}')"
           aria-label="Info ${escHtml(e.name)}">ⓘ</button>`
      : '';
    return `
      <div class="wa-mini-ex ${cls}" onclick="jumpToExercise(${idx})">
        <div class="wa-mini-icon">${icon}</div>
        <div class="wa-ex-name-mini">${escHtml(e.name)}</div>
        ${infoBtn}
        <div class="wa-mini-sets">${setsLabel}</div>
      </div>`;
  }).join('');

  body.innerHTML = `
    <div class="wa-focus-view">
      <div class="wa-ex-hero">
        <div class="wa-focus-meta-top">Exercício ${waCurrentExIdx + 1} de ${waExercises.length}</div>
        <div class="wa-focus-name">${escHtml(ex.name)}</div>
        <div class="wa-focus-prescription">${prescription}</div>
        <div id="waExMuscleMap" class="wa-ex-muscle-map"></div>
        <div class="wa-set-dots">${dots}</div>
        <div class="wa-set-label">Série ${doneSets + 1} de ${totalSets}</div>
        <div class="wa-weight-row">
          <span class="wa-weight-label">Carga</span>
          <input type="number" id="waWeightInput" class="wa-weight-input"
            value="${ex.weight_kg || ''}" step="0.5" min="0" placeholder="—"
            inputmode="decimal" onchange="updateExWeight(this.value)">
          <span class="wa-weight-unit">kg</span>
        </div>
      </div>
      <button class="btn btn-primary wa-complete-set-btn" onclick="completeSet()">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> &nbsp;Concluí a Série ${doneSets + 1}
      </button>
      <div class="wa-mini-section-label">Todos os exercícios</div>
      <div class="wa-mini-ex-list">${miniList}</div>
    </div>`;

  // Render compact muscle map after innerHTML is set
  const mapEl  = document.getElementById('waExMuscleMap');
  const exMeta = EX_META[ex.name];
  if (mapEl && exMeta && typeof renderChipMap === 'function') {
    const muscles = exMeta.muscles || [];
    const view    = autoView(muscles);
    renderChipMap(mapEl, muscles, view);
    mapEl.onclick = function() { showExerciseInfo(ex.name); };
  } else if (mapEl) {
    mapEl.style.display = 'none';
  }
}

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
    `${doneSets}/${totalSets} séries · ${exDone}/${waExercises.length} ex${volume > 0 ? ' · ' + Math.round(volume).toLocaleString('pt-BR') + ' kg' : ''}`;
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

