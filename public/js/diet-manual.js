
// ══════════════════════════════════════════
//  REGISTRAR (manual)
// ══════════════════════════════════════════
function setupRegistrar(state) {
  document.getElementById('dietDate').value = state.date;
  document.getElementById('dietDate').addEventListener('change', async e => {
    await prefillDietForm(e.target.value);
  });
  document.getElementById('dietForm').addEventListener('submit', async e => {
    e.preventDefault();
    const date   = document.getElementById('dietDate').value;
    const weight = parseFloat(document.getElementById('dietWeight').value);
    if (!date) return;
    try {
      await api.post('/api/diet/logs', {
        date,
        calories: parseInt(document.getElementById('dietCalories').value) || 0,
        protein:  parseFloat(document.getElementById('dietProt').value)   || 0,
        carbs:    parseFloat(document.getElementById('dietCarb').value)   || 0,
        fat:      parseFloat(document.getElementById('dietFat').value)    || 0,
        notes:    document.getElementById('dietNotes').value
      });
      if (!isNaN(weight) && weight > 0)
        await api.post('/api/diet/weight', { date, weight_kg: weight });
      toast('Dieta salva!');
      await loadDietHistory();
      const today = new Date().toISOString().slice(0, 10);
      if (date === today) loadDashboard(state);
    } catch (err) { toast(err.message, 'error'); }
  });
}

// ── Registrar food calculator ─────────────────────────────────────────────────
function initFoodCalc() {
  document.getElementById('foodCats').addEventListener('click', e => {
    const btn = e.target.closest('.mg-btn');
    if (!btn) return;
    const cat = btn.dataset.cat;
    if (activeFoodCat === cat) {
      activeFoodCat = null;
      btn.classList.remove('active');
      hideFoodChips();
    } else {
      activeFoodCat = cat;
      document.querySelectorAll('#foodCats .mg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFoodChips(cat);
    }
  });
  document.getElementById('foodQty').addEventListener('input', updateFoodPreview);
  document.getElementById('foodAddBtn').addEventListener('click', addFoodToForm);
  document.getElementById('foodCancelBtn').addEventListener('click', () => {
    selectedFood = null;
    document.getElementById('foodQtyRow').style.display = 'none';
    document.querySelectorAll('#foodChips .food-chip').forEach(c => c.classList.remove('selected'));
  });
}

function renderFoodChips(cat) {
  document.getElementById('foodChips').innerHTML = (FOOD_LIBRARY[cat] || []).map((food, i) => {
    const ref = food.serving
      ? `${Math.round(food.cal * food.serving / 100)} kcal/porção (${food.serving}g)`
      : `${food.cal} kcal/100g`;
    return `
      <button type="button" class="food-chip" onclick="selectFoodChip(${i},'${cat}')">
        <span class="food-chip-name">${escDiet(food.name)}</span>
        <span class="food-chip-cal">${ref}</span>
      </button>`;
  }).join('');
  document.getElementById('foodChipsWrap').style.display = '';
  document.getElementById('foodQtyRow').style.display    = 'none';
  selectedFood = null;
}

function hideFoodChips() {
  document.getElementById('foodChipsWrap').style.display = 'none';
  document.getElementById('foodQtyRow').style.display    = 'none';
  selectedFood = null;
}

function selectFoodChip(idx, cat) {
  selectedFood = FOOD_LIBRARY[cat][idx];
  document.querySelectorAll('#foodChips .food-chip').forEach((c, i) =>
    c.classList.toggle('selected', i === idx)
  );
  document.getElementById('foodQtyInfo').innerHTML =
    `<strong>${escDiet(selectedFood.name)}</strong><span class="food-qty-ref">· ${selectedFood.cal} kcal / ${selectedFood.serving ? selectedFood.serving + 'g (porção)' : '100g'}</span>`;
  document.getElementById('foodQty').value = selectedFood.serving || 100;
  document.getElementById('foodQtyRow').style.display = '';
  updateFoodPreview();
  document.getElementById('foodQtyRow').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
window.selectFoodChip = selectFoodChip;

function updateFoodPreview() {
  if (!selectedFood) return;
  const qty = parseFloat(document.getElementById('foodQty').value) || 0;
  const f   = qty / 100;
  document.getElementById('foodQtyPreview').innerHTML = qty > 0
    ? `${qty}g → <b style="color:var(--orange)">${Math.round(selectedFood.cal*f)} kcal</b> &nbsp;|&nbsp; <span style="color:var(--accent)">${round1(selectedFood.prot*f)}g prot</span> &nbsp;|&nbsp; <span style="color:var(--text-2)">${round1(selectedFood.carb*f)}g carb</span> &nbsp;|&nbsp; <span style="color:var(--accent-warm)">${round1(selectedFood.fat*f)}g gord</span>`
    : '';
}

function addFoodToForm() {
  if (!selectedFood) return;
  const qty = parseFloat(document.getElementById('foodQty').value) || 0;
  if (qty <= 0) { toast('Informe a quantidade em gramas', 'error'); return; }
  const f = qty / 100;
  document.getElementById('dietCalories').value = (parseInt(document.getElementById('dietCalories').value) || 0) + Math.round(selectedFood.cal * f);
  document.getElementById('dietProt').value     = round1((parseFloat(document.getElementById('dietProt').value) || 0) + round1(selectedFood.prot * f));
  document.getElementById('dietCarb').value     = round1((parseFloat(document.getElementById('dietCarb').value) || 0) + round1(selectedFood.carb * f));
  document.getElementById('dietFat').value      = round1((parseFloat(document.getElementById('dietFat').value)  || 0) + round1(selectedFood.fat  * f));
  toast(`+${Math.round(selectedFood.cal * f)} kcal · ${selectedFood.name}`);
  selectedFood = null;
  document.getElementById('foodQtyRow').style.display = 'none';
  document.querySelectorAll('#foodChips .food-chip').forEach(c => c.classList.remove('selected'));
}

// ── Diet history ──────────────────────────────────────────────────────────────
async function prefillDietForm(date) {
  const [dietData, weightData] = await Promise.all([
    api.get(`/api/diet/logs?date=${date}`),
    api.get(`/api/diet/weight?date=${date}`)
  ]);
  const log = dietData.log;
  const w   = weightData.log;
  document.getElementById('dietCalories').value = log?.calories || '';
  document.getElementById('dietProt').value     = log?.protein  || '';
  document.getElementById('dietCarb').value     = log?.carbs    || '';
  document.getElementById('dietFat').value      = log?.fat      || '';
  document.getElementById('dietNotes').value    = log?.notes    || '';
  document.getElementById('dietWeight').value   = w?.weight_kg  || '';
}

async function loadDietHistory() {
  const [dietResp, weightResp] = await Promise.all([
    api.get('/api/diet/logs'),
    api.get('/api/diet/weight')
  ]);
  const logs      = dietResp.logs  || [];
  const weightMap = Object.fromEntries((weightResp.logs || []).map(w => [w.date, w]));
  const tbody = document.getElementById('dietHistoryBody');
  if (!logs.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Nenhum registro</td></tr>';
    return;
  }
  tbody.innerHTML = logs.map(log => {
    const w = weightMap[log.date];
    return `
      <tr>
        <td class="date-col">${fmtDate(log.date)}</td>
        <td>${log.calories || 0}</td>
        <td>${log.protein  || 0}g</td>
        <td>${log.carbs    || 0}g</td>
        <td>${log.fat      || 0}g</td>
        <td>${w ? w.weight_kg + 'kg' : '—'}</td>
        <td><button class="btn btn-icon btn-ghost" onclick="deleteDietLog(${log.id},'${log.date}',${w?.id || 'null'})">${ICON.trash}</button></td>
      </tr>`;
  }).join('');
}

async function deleteDietLog(id, date, weightId) {
  if (!confirm(`Deletar registro de ${fmtDate(date)}?`)) return;
  try {
    await api.del(`/api/diet/logs/${id}`);
    if (weightId) await api.del(`/api/diet/weight/${weightId}`);
    toast('Registro removido');
    await loadDietHistory();
  } catch (err) { toast(err.message, 'error'); }
}
window.deleteDietLog = deleteDietLog;

// ── Utils ─────────────────────────────────────────────────────────────────────
