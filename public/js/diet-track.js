
// ══════════════════════════════════════════
//  ACOMPANHAR DIA (checklist persistente)
// ══════════════════════════════════════════
function openDtTrack(dow) {
  dtTrackDow = dow;
  const tpl  = dtTemplates[dow];
  const isToday = dow === new Date().getDay();
  const date    = getDateForDow(dow);

  // Restore done state + any extra foods from localStorage
  const saved = loadTrackState(date);
  dtTrackFoods = (tpl?.foods || []).map((f, i) => ({ ...f, done: saved.doneIdxs.includes(i) }));
  // Re-append persisted extra foods
  (saved.extraFoods || []).forEach(f => dtTrackFoods.push(f));

  // Header
  document.getElementById('dtTrackTitle').textContent = tpl?.name || DT_DAYS_FULL[dow];
  document.getElementById('dtTrackDate').textContent  = isToday
    ? 'Hoje — ' + new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    : DT_DAYS_FULL[dow] + ' — plano semanal';

  // Save button label
  const saveBtn = document.getElementById('dtTrackSaveBtn');
  saveBtn.textContent = isToday
    ? 'Salvar no diário de hoje'
    : `Registrar em ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`;

  renderDtTrackMeals();
  switchDtView('track');
}
window.openDtTrack = openDtTrack;

function renderDtTrackMeals() {
  const done      = dtTrackFoods.filter(f => f.done);
  const doneTots  = computeTotals(done);
  const totalTots = computeTotals(dtTrackFoods);
  const pct       = totalTots.cal > 0
    ? Math.min(Math.round((doneTots.cal / totalTots.cal) * 100), 100)
    : 0;

  // Progress card
  document.getElementById('dtTrackCalEaten').textContent = doneTots.cal;
  document.getElementById('dtTrackCalTotal').textContent  = totalTots.cal;
  document.getElementById('dtTrackBar').style.width       = pct + '%';
  document.getElementById('dtTrackFoodCount').textContent = `${done.length} / ${dtTrackFoods.length} alimentos`;

  // Macro progress bars
  const macroEl = document.getElementById('dtTrackMacros');
  if (macroEl && totalTots.cal > 0) {
    const mkBar = (cls, lbl, doneV, totalV) => {
      const w = totalV > 0 ? Math.min(Math.round(doneV / totalV * 100), 100) : 0;
      return `<div class="dt-mbar-row">
        <span class="dt-mbar-dot dt-mbar-dot--${cls}"></span>
        <span class="dt-mbar-label">${lbl}</span>
        <div class="dt-mbar-track"><div class="dt-mbar-fill dt-mbar-fill--${cls}" style="width:${w}%"></div></div>
        <span class="dt-mbar-val">${doneV}/${totalV}g</span>
      </div>`;
    };
    macroEl.innerHTML = mkBar('prot','Prot', doneTots.prot, totalTots.prot)
      + mkBar('carb','Carb', doneTots.carb, totalTots.carb)
      + mkBar('fat', 'Gord', doneTots.fat,  totalTots.fat);
  } else if (macroEl) {
    macroEl.innerHTML = '';
  }

  // Meal sections
  const el = document.getElementById('dtTrackMeals');
  el.innerHTML = MEALS.map(meal => {
    const foods = dtTrackFoods.filter(f => f.meal === meal.id);
    if (!foods.length) return '';

    const mealDone = computeTotals(foods.filter(f => f.done));
    const mealTot  = computeTotals(foods);
    const allDone  = foods.every(f => f.done);

    const foodsHtml = foods.map(f => {
      const gi        = dtTrackFoods.indexOf(f);
      const extraBadge = f.extra ? `<span class="dt-extra-badge">extra</span>` : '';
      return `
        <div class="dt-track-food${f.done ? ' done' : ''}${f.extra ? ' extra' : ''}" onclick="toggleDtTrackFood(${gi})">
          <div class="dt-track-check">${f.done ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}</div>
          <div class="dt-track-food-info">
            <div class="dt-track-food-name">${escDiet(f.name)}${extraBadge}</div>
            <div class="dt-track-food-meta">${f.quantity_g}g · P: ${f.protein}g · C: ${f.carbs}g · G: ${f.fat}g</div>
          </div>
          <div class="dt-track-food-kcal">${f.calories} kcal</div>
        </div>`;
    }).join('');

    const kcalStr = allDone
      ? `<span class="meal-kcal all-done">${mealTot.cal} kcal <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>`
      : `<span class="meal-kcal">${mealDone.cal} / ${mealTot.cal} kcal</span>`;

    return `
      <div class="meal-section">
        <div class="meal-header">
          <span class="meal-icon">${meal.icon}</span>
          <span class="meal-label${allDone ? ' all-done' : ''}">${meal.label}</span>
          ${kcalStr}
        </div>
        <div class="meal-foods">${foodsHtml}</div>
      </div>`;
  }).join('') || '<p class="empty-state">Nenhum alimento neste plano.</p>';

  // Auto-persist to localStorage (done indices + extra foods)
  const date     = getDateForDow(dtTrackDow);
  const doneIdxs = dtTrackFoods.map((f, i) => (!f.extra && f.done) ? i : -1).filter(i => i >= 0);
  const extraFoods = dtTrackFoods.filter(f => f.extra);
  saveTrackState(date, doneIdxs, extraFoods);
}

function toggleDtTrackFood(gi) {
  dtTrackFoods[gi].done = !dtTrackFoods[gi].done;
  renderDtTrackMeals();
}
window.toggleDtTrackFood = toggleDtTrackFood;

function setupDtTrack(state) {
  document.getElementById('dtTrackBackBtn').addEventListener('click', () => {
    switchDtView('programa');
    renderDietWeekGrid();  // refresh today card with latest consumed data
  });

  document.getElementById('dtTrackSaveBtn').addEventListener('click', async () => {
    await saveDtTrackToDiary(state);
  });
}

async function saveDtTrackToDiary(state) {
  const done  = dtTrackFoods.filter(f => f.done);
  const tots  = computeTotals(done);
  const today = new Date().toISOString().slice(0, 10);
  const name  = document.getElementById('dtTrackTitle').textContent;

  if (done.length === 0) {
    const ok = await showConfirmModal({
      title: 'Nenhum alimento marcado',
      body:  'Você não marcou nenhum alimento como comido. Quer salvar <strong>0 kcal</strong> no diário mesmo assim?',
      actions: [
        { label: 'Sim, salvar zerado', value: 'ok',     cls: 'btn-ghost'   },
        { label: 'Cancelar',           value: 'cancel', cls: 'btn-primary'  },
      ]
    });
    if (ok !== 'ok') return;
  }

  // Check for existing record first
  const notes = `${name} — ${done.length}/${dtTrackFoods.length} alimentos`;
  let mode = 'replace';

  try {
    const check = await api.post('/api/diet/logs', { date: today, mode: 'check' });

    if (check.existing && (check.existing.calories > 0 || check.existing.protein > 0)) {
      const ex = check.existing;
      const updatedAt = ex.updated_at
        ? new Date(ex.updated_at).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
        : 'anteriormente';

      mode = await showConfirmModal({
        title: 'Já existe um registro para hoje',
        body:  `Registro existente (salvo em ${updatedAt}):<br>
                <strong>${ex.calories} kcal · ${ex.protein}g prot · ${ex.carbs}g carb · ${ex.fat}g gord</strong><br><br>
                Novos valores do tracking:<br>
                <strong>${tots.cal} kcal · ${tots.prot}g prot · ${tots.carb}g carb · ${tots.fat}g gord</strong>`,
        actions: [
          { label: '+ Somar ao registro anterior', value: 'merge',   cls: 'btn-primary' },
          { label: 'Substituir pelo tracking',   value: 'replace', cls: 'btn-ghost'   },
          { label: 'Cancelar',                       value: 'cancel',  cls: 'btn-ghost'   },
        ]
      });

      if (mode === 'cancel') return;
    }

    await api.post('/api/diet/logs', {
      date:     today,
      calories: tots.cal,
      protein:  tots.prot,
      carbs:    tots.carb,
      fat:      tots.fat,
      notes,
      mode,
    });

    const label = mode === 'merge' ? 'somados ao diário' : 'salvos no diário';
    toast(`${tots.cal} kcal ${label}!`);
    state.date = today;
    loadDashboard(state);
  } catch (err) { toast(err.message, 'error'); }
}

// Generic promise-based modal. Returns the value of the clicked action button.
function showConfirmModal({ title, body, actions }) {
  return new Promise(resolve => {
    let bg = document.getElementById('_confirmModalBg');
    if (!bg) {
      bg = document.createElement('div');
      bg.id = '_confirmModalBg';
      bg.className = 'confirm-modal-bg';
      bg.innerHTML = `
        <div class="confirm-modal">
          <div class="confirm-modal-title" id="_cmTitle"></div>
          <div class="confirm-modal-body"  id="_cmBody"></div>
          <div class="confirm-modal-actions" id="_cmActions"></div>
        </div>`;
      document.body.appendChild(bg);
    }

    document.getElementById('_cmTitle').textContent = title;
    document.getElementById('_cmBody').innerHTML    = body;

    const actionsEl = document.getElementById('_cmActions');
    actionsEl.innerHTML = '';
    actions.forEach(({ label, value, cls }) => {
      const btn = document.createElement('button');
      btn.className   = `btn ${cls}`;
      btn.textContent = label;
      btn.onclick = () => {
        bg.classList.remove('open');
        resolve(value);
      };
      actionsEl.appendChild(btn);
    });

    bg.classList.add('open');
  });
}

// ── Extra food panel (Track view) ────────────────────────────────────────────
function setupDtTrackExtraPanel() {
  const panel     = document.getElementById('dtTrackAddPanel');
  const toggleBtn = document.getElementById('dtTrackAddExtraBtn');

  toggleBtn.addEventListener('click', () => {
    const open = panel.style.display !== 'none';
    panel.style.display = open ? 'none' : '';
    toggleBtn.textContent = open ? '+ Alimento extra' : 'X Fechar';
    if (!open) {
      // reset state on open
      dtExtraCat  = null;
      dtExtraFood = null;
      document.querySelectorAll('#dtTrackExtraCats .mg-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('dtTrackExtraChipsWrap').style.display = 'none';
      document.getElementById('dtTrackExtraQtyRow').style.display    = 'none';
      document.getElementById('dtTrackExtraQtyPreview').innerHTML    = '';
    }
  });

  document.getElementById('dtTrackExtraCats').addEventListener('click', e => {
    const btn = e.target.closest('.mg-btn');
    if (!btn) return;
    const cat = btn.dataset.ecat;
    if (dtExtraCat === cat) {
      dtExtraCat  = null;
      dtExtraFood = null;
      btn.classList.remove('active');
      document.getElementById('dtTrackExtraChipsWrap').style.display = 'none';
      document.getElementById('dtTrackExtraQtyRow').style.display    = 'none';
    } else {
      dtExtraCat = cat;
      document.querySelectorAll('#dtTrackExtraCats .mg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderDtExtraChips(cat);
    }
  });

  document.getElementById('dtTrackExtraQty').addEventListener('input', updateDtExtraPreview);

  document.getElementById('dtTrackExtraAddBtn').addEventListener('click', () => {
    if (!dtExtraFood) { toast('Selecione um alimento', 'error'); return; }
    const qty  = parseFloat(document.getElementById('dtTrackExtraQty').value) || 0;
    if (qty <= 0) { toast('Informe a quantidade em gramas', 'error'); return; }
    const meal = document.getElementById('dtTrackExtraMeal').value;
    const f    = qty / 100;

    dtTrackFoods.push({
      meal,
      name:       dtExtraFood.name,
      quantity_g: qty,
      calories:   Math.round(dtExtraFood.cal  * f),
      protein:    round1(dtExtraFood.prot * f),
      carbs:      round1(dtExtraFood.carb * f),
      fat:        round1(dtExtraFood.fat  * f),
      done:       true,   // auto-marked as eaten
      extra:      true,   // visually flagged
    });

    renderDtTrackMeals();
    toast(`${dtExtraFood.name} adicionado!`);

    // reset chip selection
    dtExtraFood = null;
    document.querySelectorAll('#dtTrackExtraChips .food-chip').forEach(c => c.classList.remove('selected'));
    document.getElementById('dtTrackExtraQtyRow').style.display    = 'none';
    document.getElementById('dtTrackExtraQtyPreview').innerHTML    = '';
  });

  document.getElementById('dtTrackExtraCancelBtn').addEventListener('click', () => {
    dtExtraFood = null;
    document.getElementById('dtTrackExtraQtyRow').style.display    = 'none';
    document.querySelectorAll('#dtTrackExtraChips .food-chip').forEach(c => c.classList.remove('selected'));
  });
}

function renderDtExtraChips(cat) {
  document.getElementById('dtTrackExtraChips').innerHTML = (FOOD_LIBRARY[cat] || []).map((food, i) => {
    const ref = food.serving
      ? `${Math.round(food.cal * food.serving / 100)} kcal/porção (${food.serving}g)`
      : `${food.cal} kcal/100g`;
    return `
      <button type="button" class="food-chip" onclick="selectDtExtraChip(${i},'${cat}')">
        <span class="food-chip-name">${escDiet(food.name)}</span>
        <span class="food-chip-cal">${ref}</span>
      </button>`;
  }).join('');
  document.getElementById('dtTrackExtraChipsWrap').style.display = '';
  document.getElementById('dtTrackExtraQtyRow').style.display    = 'none';
  dtExtraFood = null;
}

function selectDtExtraChip(idx, cat) {
  dtExtraFood = FOOD_LIBRARY[cat][idx];
  document.querySelectorAll('#dtTrackExtraChips .food-chip').forEach((c, i) =>
    c.classList.toggle('selected', i === idx)
  );
  document.getElementById('dtTrackExtraQtyInfo').innerHTML =
    `<strong>${escDiet(dtExtraFood.name)}</strong><span class="food-qty-ref">· ${dtExtraFood.cal} kcal / ${dtExtraFood.serving ? dtExtraFood.serving + 'g (porção)' : '100g'}</span>`;
  document.getElementById('dtTrackExtraQty').value = dtExtraFood.serving || 100;
  document.getElementById('dtTrackExtraQtyRow').style.display = '';
  updateDtExtraPreview();
}
window.selectDtExtraChip = selectDtExtraChip;

function updateDtExtraPreview() {
  if (!dtExtraFood) return;
  const qty = parseFloat(document.getElementById('dtTrackExtraQty').value) || 0;
  const f   = qty / 100;
  document.getElementById('dtTrackExtraQtyPreview').innerHTML = qty > 0
    ? `${qty}g → <b style="color:var(--orange)">${Math.round(dtExtraFood.cal*f)} kcal</b> · <span style="color:var(--accent)">${round1(dtExtraFood.prot*f)}g prot</span> · <span style="color:var(--text-2)">${round1(dtExtraFood.carb*f)}g carb</span> · <span style="color:var(--accent-warm)">${round1(dtExtraFood.fat*f)}g gord</span>`
    : '';
}

// localStorage persistence (sobrevive a fechar o app)
function trackStorageKey(date) {
  return `dt_${dtState?.user?.id || '0'}_${date}`;
}
function saveTrackState(date, doneIdxs, extraFoods) {
  try { localStorage.setItem(trackStorageKey(date), JSON.stringify({ doneIdxs, extraFoods: extraFoods || [] })); } catch {}
}
function loadTrackState(date) {
  try {
    const val = JSON.parse(localStorage.getItem(trackStorageKey(date)));
    if (!val) return { doneIdxs: [], extraFoods: [] };
    // Backwards compat: old format was a plain array of indices
    if (Array.isArray(val)) return { doneIdxs: val, extraFoods: [] };
    return { doneIdxs: val.doneIdxs || [], extraFoods: val.extraFoods || [] };
  } catch { return { doneIdxs: [], extraFoods: [] }; }
}

// Returns the ISO date for the current or most recent occurrence of a given DOW
function getDateForDow(dow) {
  const today = new Date();
  const diff  = (today.getDay() - dow + 7) % 7;
  const d     = new Date(today);
  d.setDate(today.getDate() - (diff === 0 ? 0 : diff));
  return d.toISOString().slice(0, 10);
}
