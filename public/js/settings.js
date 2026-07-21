/* Settings tab + TDEE Calculator */

// Calculated values to apply as targets
let _calcValues = null;

function initSettings(state) {
  // ── Registrar peso ────────────────────────────────────────────────────────
  document.getElementById('setWeightSaveBtn').addEventListener('click', async () => {
    const val = parseFloat(document.getElementById('setWeightValue').value);
    if (!val || val < 20) { toast('Informe um peso válido (kg)', 'error'); return; }
    const today = new Date().toISOString().slice(0, 10);
    try {
      await api.post('/api/diet/weight', { date: today, weight_kg: val });
      toast(`Peso ${val} kg salvo!`);
      // sync with TDEE calculator field
      document.getElementById('calcWeight').value = val;
      await loadWeightInfo();
      // refresh dashboard if it was loaded
      if (typeof loadDashboard === 'function') loadDashboard(state);
    } catch (err) { toast(err.message, 'error'); }
  });

  // ── Save profile & goals ──────────────────────────────────────────────────
  document.getElementById('settingsForm').addEventListener('submit', async e => {
    e.preventDefault();
    try {
      await api.put('/api/users/me', {
        target_calories: parseInt(document.getElementById('setCalories').value)      || 0,
        target_protein:  parseInt(document.getElementById('setProt').value)           || 0,
        target_carbs:    parseInt(document.getElementById('setCarb').value)           || 0,
        target_fat:      parseInt(document.getElementById('setFat').value)            || 0,
        height_cm:       parseFloat(document.getElementById('setHeight').value)       || null,
        age:             parseInt(document.getElementById('setAge').value)             || null,
        sex:             document.getElementById('setSex').value                      || null,
        target_weight:   parseFloat(document.getElementById('setTargetWeight').value) || null,
      });
      const { user } = await api.get('/api/auth/me');
      state.user = user;
      toast('Metas salvas!');
    } catch (err) { toast(err.message, 'error'); }
  });

  // ── TDEE Calculator ───────────────────────────────────────────────────────
  document.getElementById('calcBtn').addEventListener('click', () => {
    runCalculator(state);
  });

  document.getElementById('calcApplyBtn').addEventListener('click', async () => {
    if (!_calcValues) return;
    const { calories, protein, carbs, fat } = _calcValues;

    // Fill goals form
    document.getElementById('setCalories').value = calories;
    document.getElementById('setProt').value      = protein;
    document.getElementById('setCarb').value      = carbs;
    document.getElementById('setFat').value       = fat;

    // Save immediately
    try {
      await api.put('/api/users/me', {
        target_calories: calories,
        target_protein:  protein,
        target_carbs:    carbs,
        target_fat:      fat,
        height_cm:       parseFloat(document.getElementById('setHeight').value)       || null,
        age:             parseInt(document.getElementById('setAge').value)             || null,
        sex:             document.getElementById('setSex').value                       || null,
        target_weight:   parseFloat(document.getElementById('setTargetWeight').value) || null,
      });
      const { user } = await api.get('/api/auth/me');
      state.user = user;
      toast('Meta aplicada! Dashboard atualizado.');
    } catch (err) { toast(err.message, 'error'); }
  });

  // ── Change password ───────────────────────────────────────────────────────
  document.getElementById('passwordForm').addEventListener('submit', async e => {
    e.preventDefault();
    const newPw = document.getElementById('pwNew').value;
    if (newPw !== document.getElementById('pwConfirm').value) {
      toast('Senhas não conferem', 'error'); return;
    }
    try {
      await api.put('/api/users/me/password', {
        current_password: document.getElementById('pwCurrent').value,
        new_password: newPw
      });
      document.getElementById('passwordForm').reset();
      toast('Senha alterada com sucesso!');
    } catch (err) { toast(err.message, 'error'); }
  });
}

async function loadSettings(state) {
  const u = state.user;
  if (!u) return;

  document.getElementById('setCalories').value      = u.target_calories || '';
  document.getElementById('setProt').value           = u.target_protein  || '';
  document.getElementById('setCarb').value           = u.target_carbs    || '';
  document.getElementById('setFat').value            = u.target_fat      || '';
  document.getElementById('setHeight').value         = u.height_cm       || '';
  document.getElementById('setAge').value            = u.age             || '';
  document.getElementById('setSex').value            = u.sex             || '';
  document.getElementById('setTargetWeight').value   = u.target_weight   || '';

  // Sync theme toggle with current user theme
  const currentTheme = u.theme || 'dark';
  document.querySelectorAll('[data-theme-val]').forEach(b =>
    b.classList.toggle('active', b.dataset.themeVal === currentTheme)
  );

  await loadWeightInfo();
}

async function loadWeightInfo() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [todayResp, allResp] = await Promise.all([
      api.get(`/api/diet/weight?date=${today}`),
      api.get('/api/diet/weight')
    ]);

    const todayLog = todayResp.log;
    const allLogs  = allResp.logs || [];
    const last     = allLogs.at(-1);
    const infoEl   = document.getElementById('setWeightLastInfo');

    if (todayLog) {
      infoEl.innerHTML = `✅ Hoje: <strong style="color:var(--orange)">${todayLog.weight_kg} kg</strong> já registrado`;
      document.getElementById('setWeightValue').value = todayLog.weight_kg;
    } else if (last) {
      const d = last.date.split('-');
      infoEl.innerHTML = `Último registro: <strong>${last.weight_kg} kg</strong> em ${d[2]}/${d[1]}/${d[0]} — sem registro hoje ainda`;
      document.getElementById('setWeightValue').value = last.weight_kg;
    } else {
      infoEl.textContent = 'Nenhum peso registrado ainda';
    }

    // Pre-fill calculator field too
    if (last) document.getElementById('calcWeight').value = last.weight_kg;
  } catch { /* ignore */ }
}

function runCalculator(state) {
  const u      = state.user;
  const weight = parseFloat(document.getElementById('calcWeight').value);
  const height = parseFloat(document.getElementById('setHeight').value) || u?.height_cm;
  const age    = parseInt(document.getElementById('setAge').value)       || u?.age;
  const sex    = document.getElementById('setSex').value                 || u?.sex;

  if (!weight) { toast('Informe seu peso atual', 'error'); return; }
  if (!height) { toast('Preencha sua altura no perfil', 'error'); return; }
  if (!age)    { toast('Preencha sua idade no perfil', 'error'); return; }
  if (!sex)    { toast('Selecione seu sexo no perfil', 'error'); return; }

  // Mifflin-St Jeor BMR
  const bmr = sex === 'M'
    ? (10 * weight) + (6.25 * height) - (5 * age) + 5
    : (10 * weight) + (6.25 * height) - (5 * age) - 161;

  const activity = parseFloat(document.getElementById('calcActivity').value);
  const goalDiff = parseInt(document.getElementById('calcGoal').value);
  const tdee     = Math.round(bmr * activity);
  const target   = Math.round(tdee + goalDiff);

  // Macro split
  const protMultiplier = goalDiff < 0 ? 2.2 : goalDiff === 0 ? 2.0 : 1.8;
  const protein  = Math.round(weight * protMultiplier);
  const fat      = Math.round(weight * 0.9);
  const carbKcal = target - (protein * 4) - (fat * 9);
  const carbs    = Math.max(0, Math.round(carbKcal / 4));

  // Sanity: recompute actual calories from macros
  const actualKcal = (protein * 4) + (carbs * 4) + (fat * 9);

  _calcValues = { calories: actualKcal, protein, carbs, fat };

  // Render results
  document.getElementById('calcBMRVal').textContent    = Math.round(bmr);
  document.getElementById('calcTDEEVal').textContent   = tdee;
  document.getElementById('calcTargetVal').textContent = actualKcal;

  document.getElementById('calcProtVal').textContent = protein + 'g';
  document.getElementById('calcCarbVal').textContent = carbs + 'g';
  document.getElementById('calcFatVal').textContent  = fat + 'g';
  document.getElementById('calcProtSub').textContent = `${(protein * 4)} kcal`;
  document.getElementById('calcCarbSub').textContent = `${(carbs * 4)} kcal`;
  document.getElementById('calcFatSub').textContent  = `${(fat * 9)} kcal`;

  // Info box
  const goalLabels = {
    '-500': 'Déficit agressivo — perda estimada de <strong>~0,5 kg/semana</strong>. Ideal para quem quer resultados mais rápidos.',
    '-300': 'Déficit moderado — perda estimada de <strong>~0,3 kg/semana</strong>. Mais sustentável e preserva massa muscular.',
    '0':    'Manutenção — você vai ingerir exatamente o que gasta. Ótimo para recomposição corporal.',
    '200':  'Superávit leve — ganho de massa com menor acúmulo de gordura. <strong>Bulk limpo.</strong>',
    '400':  'Superávit agressivo — ganho de massa mais rápido, com maior acúmulo de gordura também.'
  };

  document.getElementById('calcInfoBox').innerHTML =
    `<p>${goalLabels[String(goalDiff)] || ''}</p>` +
    `<p style="margin-top:6px;font-size:.78rem">Proteína: <strong>${protMultiplier}g/kg</strong> · Gordura: <strong>0.9g/kg</strong> · Carboidratos: restante das calorias.</p>`;

  document.getElementById('calcResults').style.display = '';
}
