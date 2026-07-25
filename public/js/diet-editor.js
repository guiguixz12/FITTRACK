
// ══════════════════════════════════════════
//  EDITAR DIA (template por refeição)
// ══════════════════════════════════════════
function openDtEditDay(dow) {
  dtEditingDow    = dow;
  const tpl       = dtTemplates[dow];
  dtplFoods       = tpl ? JSON.parse(JSON.stringify(tpl.foods || [])) : [];
  dtActiveMeal    = null;
  dtActiveFoodCat = null;
  dtSelectedFood  = null;

  document.getElementById('dtEditDayTitle').textContent      = DT_DAYS_FULL[dow];
  document.getElementById('dtplName').value                  = tpl?.name || '';
  document.getElementById('dtFoodCalcCard').style.display    = 'none';
  document.getElementById('dtFoodChipsWrap').style.display   = 'none';
  document.getElementById('dtFoodQtyRow').style.display      = 'none';

  renderDtplMealSections();
  switchDtView('editDay');
}
window.openDtEditDay = openDtEditDay;

function renderDtplMealSections() {
  document.getElementById('dtplMealSections').innerHTML = MEALS.map(meal => {
    const foods    = dtplFoods.filter(f => f.meal === meal.id);
    const tots     = computeTotals(foods);
    const isActive = dtActiveMeal === meal.id;

    const foodsHtml = foods.length
      ? foods.map(f => {
          const gi = dtplFoods.indexOf(f);
          return `
            <div class="diet-food-item">
              <div class="diet-food-info">
                <div class="diet-food-name">${escDiet(f.name)}</div>
                <div class="diet-food-meta">${f.quantity_g}g · ${f.protein}g prot · ${f.carbs}g carb · ${f.fat}g gord</div>
              </div>
              <div class="diet-food-kcal">${f.calories} kcal</div>
              <button class="btn btn-icon btn-ghost" onclick="dtplRemoveFood(${gi})">${ICON.trash}</button>
            </div>`;
        }).join('')
      : `<div style="color:var(--text-faint);font-size:.8rem;padding:6px 0;text-align:center">Nenhum alimento</div>`;

    return `
      <div class="meal-section">
        <div class="meal-header">
          <span class="meal-icon">${meal.icon}</span>
          <span class="meal-label">${meal.label}</span>
          <span class="meal-kcal">${tots.cal > 0 ? tots.cal + ' kcal' : ''}</span>
          <button class="btn btn-ghost btn-sm" style="flex-shrink:0${isActive ? ';color:var(--orange)' : ''}"
            onclick="openMealAdd('${meal.id}')">
            ${isActive ? '▲ Fechar' : '+ Add'}
          </button>
        </div>
        <div class="meal-foods">${foodsHtml}</div>
      </div>`;
  }).join('');

  const tots = computeTotals(dtplFoods);
  const totEl = document.getElementById('dtplTotals');
  if (dtplFoods.length) {
    totEl.style.display = '';
    totEl.innerHTML = `
      <div class="dtpl-totals-row">
        <span class="dtpl-total-chip cal">${tots.cal} kcal total</span>
        <span class="dtpl-total-chip prot">${tots.prot}g prot</span>
        <span class="dtpl-total-chip carb">${tots.carb}g carb</span>
        <span class="dtpl-total-chip fat">${tots.fat}g gord</span>
      </div>`;
  } else {
    totEl.style.display = 'none';
  }
}

function openMealAdd(mealId) {
  const calcCard = document.getElementById('dtFoodCalcCard');
  if (dtActiveMeal === mealId && calcCard.style.display !== 'none') {
    dtActiveMeal = null;
    calcCard.style.display = 'none';
    renderDtplMealSections();
    return;
  }
  dtActiveMeal = mealId;
  const meal   = MEALS.find(m => m.id === mealId);
  document.getElementById('dtFoodCalcMealLabel').innerHTML = `${meal.icon} ${meal.label}`;

  dtSelectedFood  = null;
  dtActiveFoodCat = null;
  document.querySelectorAll('#dtFoodCats .mg-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('dtFoodChipsWrap').style.display = 'none';
  document.getElementById('dtFoodQtyRow').style.display    = 'none';
  document.getElementById('dtFoodChips').innerHTML         = '';

  calcCard.style.display = '';
  calcCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  renderDtplMealSections();
}
window.openMealAdd = openMealAdd;

function setupDtEditDay() {
  document.getElementById('dtBackBtn').addEventListener('click', () => {
    dtActiveMeal = null;
    document.getElementById('dtFoodCalcCard').style.display = 'none';
    switchDtView('programa');
  });

  document.getElementById('dtplSaveBtn').addEventListener('click', async () => {
    const name = document.getElementById('dtplName').value.trim();
    if (!name && dtplFoods.length === 0) { toast('Adicione um nome ou alimentos', 'error'); return; }
    try {
      await api.put(`/api/diet-templates/${dtEditingDow}`, { name, foods: dtplFoods });
      toast('Programa salvo!');
      dtActiveMeal = null;
      document.getElementById('dtFoodCalcCard').style.display = 'none';
      await loadDietWeekGrid();
      switchDtView('programa');
    } catch (err) { toast(err.message, 'error'); }
  });

  document.getElementById('dtplFreeDayBtn').addEventListener('click', async () => {
    if (!confirm('Marcar este dia como dia livre?')) return;
    try {
      await api.del(`/api/diet-templates/${dtEditingDow}`);
      toast('Marcado como dia livre');
      await loadDietWeekGrid();
      switchDtView('programa');
    } catch (err) { toast(err.message, 'error'); }
  });
}

// ── Template food calculator ──────────────────────────────────────────────────
function setupDtFoodCalc() {
  document.getElementById('dtFoodCats').addEventListener('click', e => {
    const btn = e.target.closest('.mg-btn');
    if (!btn) return;
    const cat = btn.dataset.cat;
    if (dtActiveFoodCat === cat) {
      dtActiveFoodCat = null;
      btn.classList.remove('active');
      document.getElementById('dtFoodChipsWrap').style.display = 'none';
      document.getElementById('dtFoodQtyRow').style.display    = 'none';
      dtSelectedFood = null;
    } else {
      dtActiveFoodCat = cat;
      document.querySelectorAll('#dtFoodCats .mg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderDtFoodChips(cat);
    }
  });

  document.getElementById('dtFoodQty').addEventListener('input', updateDtFoodPreview);

  document.getElementById('dtFoodAddBtn').addEventListener('click', () => {
    if (!dtActiveMeal)    { toast('Selecione uma refeição', 'error'); return; }
    if (!dtSelectedFood)  { toast('Selecione um alimento', 'error'); return; }
    const qty = parseFloat(document.getElementById('dtFoodQty').value) || 0;
    if (qty <= 0)         { toast('Informe a quantidade em gramas', 'error'); return; }

    const f = qty / 100;
    dtplFoods.push({
      meal:       dtActiveMeal,
      name:       dtSelectedFood.name,
      quantity_g: qty,
      calories:   Math.round(dtSelectedFood.cal  * f),
      protein:    round1(dtSelectedFood.prot * f),
      carbs:      round1(dtSelectedFood.carb * f),
      fat:        round1(dtSelectedFood.fat  * f),
    });

    dtSelectedFood = null;
    document.getElementById('dtFoodQtyRow').style.display = 'none';
    document.querySelectorAll('#dtFoodChips .food-chip').forEach(c => c.classList.remove('selected'));
    document.getElementById('dtFoodQtyPreview').innerHTML = '';
    renderDtplMealSections();
    toast('Adicionado!');
  });

  document.getElementById('dtFoodCancelBtn').addEventListener('click', () => {
    dtSelectedFood = null;
    document.getElementById('dtFoodQtyRow').style.display = 'none';
    document.querySelectorAll('#dtFoodChips .food-chip').forEach(c => c.classList.remove('selected'));
  });
}

function renderDtFoodChips(cat) {
  document.getElementById('dtFoodChips').innerHTML = (FOOD_LIBRARY[cat] || []).map((food, i) => {
    const ref = food.serving
      ? `${Math.round(food.cal * food.serving / 100)} kcal/porção (${food.serving}g)`
      : `${food.cal} kcal/100g`;
    return `
      <button type="button" class="food-chip" onclick="selectDtFoodChip(${i},'${cat}')">
        <span class="food-chip-name">${escDiet(food.name)}</span>
        <span class="food-chip-cal">${ref}</span>
      </button>`;
  }).join('');
  document.getElementById('dtFoodChipsWrap').style.display = '';
  document.getElementById('dtFoodQtyRow').style.display    = 'none';
  dtSelectedFood = null;
}

function selectDtFoodChip(idx, cat) {
  dtSelectedFood = FOOD_LIBRARY[cat][idx];
  document.querySelectorAll('#dtFoodChips .food-chip').forEach((c, i) =>
    c.classList.toggle('selected', i === idx)
  );
  document.getElementById('dtFoodQtyInfo').innerHTML =
    `<strong>${escDiet(dtSelectedFood.name)}</strong><span class="food-qty-ref">· ${dtSelectedFood.cal} kcal / ${dtSelectedFood.serving ? dtSelectedFood.serving + 'g (porção)' : '100g'}</span>`;
  document.getElementById('dtFoodQty').value = dtSelectedFood.serving || 100;
  document.getElementById('dtFoodQtyRow').style.display = '';
  updateDtFoodPreview();
}
window.selectDtFoodChip = selectDtFoodChip;

function updateDtFoodPreview() {
  if (!dtSelectedFood) return;
  const qty = parseFloat(document.getElementById('dtFoodQty').value) || 0;
  const f   = qty / 100;
  document.getElementById('dtFoodQtyPreview').innerHTML = qty > 0
    ? `${qty}g → <b style="color:var(--orange)">${Math.round(dtSelectedFood.cal*f)} kcal</b> &nbsp;|&nbsp; <span style="color:var(--accent)">${round1(dtSelectedFood.prot*f)}g prot</span> &nbsp;|&nbsp; <span style="color:var(--text-2)">${round1(dtSelectedFood.carb*f)}g carb</span> &nbsp;|&nbsp; <span style="color:var(--accent-warm)">${round1(dtSelectedFood.fat*f)}g gord</span>`
    : '';
}

function dtplRemoveFood(gi) {
  dtplFoods.splice(gi, 1);
  renderDtplMealSections();
}
window.dtplRemoveFood = dtplRemoveFood;

// Called by barcode scanner button in diet template editor
function addScannedToDietTemplate(product) {
  // Show meal picker, then quantity modal
  const mealPickerModal = document.createElement('div');
  mealPickerModal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:2100;display:flex;align-items:center;justify-content:center;padding:20px';
  mealPickerModal.innerHTML = `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;width:100%;max-width:340px;box-shadow:var(--shadow-lg)">
      <div style="font-weight:700;font-size:.95rem;margin-bottom:4px">Adicionar produto</div>
      <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:16px">${escDiet(product.name)}</div>
      <div style="font-weight:600;font-size:.78rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px">Qual refeição?</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${MEALS.map(m => `<button class="btn btn-ghost" style="justify-content:flex-start;gap:8px" onclick="_pickMealAndScan('${m.id}',this.closest('[style*=fixed]'))">${m.icon} ${m.label}</button>`).join('')}
      </div>
      <button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="this.closest('[style*=fixed]').remove()">Cancelar</button>
    </div>
  `;
  document.body.appendChild(mealPickerModal);

  window._pickMealAndScan = (mealId, overlay) => {
    overlay.remove();
    showScannedProductModal(product, scaled => {
      dtplFoods.push({
        meal:       mealId,
        name:       scaled.name,
        quantity_g: scaled.quantity_g,
        calories:   scaled.calories,
        protein:    scaled.protein,
        carbs:      scaled.carbs,
        fat:        scaled.fat,
        fiber:      scaled.fiber,
        sodium:     scaled.sodium,
        sugar:      scaled.sugar,
      });
      renderDtplMealSections();
      toast(`${product.name.split('(')[0].trim()} adicionado!`);
    });
  };
}
window.addScannedToDietTemplate = addScannedToDietTemplate;
