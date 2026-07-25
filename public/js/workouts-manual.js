// ══════════════════════════════════════════
function setupRegistrarView(state) {
  document.getElementById('wkDate').value = state.date;

  document.getElementById('wkDate').addEventListener('change', async e => {
    await loadManualSession(e.target.value);
  });

  document.getElementById('wkSaveNotes').addEventListener('click', async () => {
    const date  = document.getElementById('wkDate').value;
    const notes = document.getElementById('wkNotes').value;
    try {
      if (currentWkId) {
        await api.put(`/api/workouts/${currentWkId}`, { notes });
      } else {
        const r = await api.post('/api/workouts', { date, notes });
        currentWkId = r.id;
      }
      toast('Notas salvas!');
    } catch (err) { toast(err.message, 'error'); }
  });

  // Muscle groups (manual session)
  document.getElementById('muscleGroups').addEventListener('click', e => {
    const btn = e.target.closest('.mg-btn');
    if (!btn) return;
    const group = btn.dataset.group;
    if (activeMg === group) {
      activeMg = null;
      btn.classList.remove('active');
      document.getElementById('exChipsWrap').style.display = 'none';
      document.getElementById('exChips').innerHTML = '';
      const d = document.getElementById('exBodyDiagram');
      if (d) { d.innerHTML = ''; d.style.display = 'none'; }
    } else {
      activeMg = group;
      document.querySelectorAll('#muscleGroups .mg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderExChips(group);
    }
  });

  // Manual exercise form
  document.getElementById('exerciseForm').addEventListener('submit', async e => {
    e.preventDefault();
    const date = document.getElementById('wkDate').value;
    const name = document.getElementById('exName').value.trim();
    if (!name) return;
    const editId = document.getElementById('exEditId').value;

    try {
      if (!currentWkId) {
        const r = await api.post('/api/workouts', { date, notes: document.getElementById('wkNotes').value });
        currentWkId = r.id;
      }
      const payload = {
        name,
        sets:      parseInt(document.getElementById('exSets').value)    || null,
        reps:      parseInt(document.getElementById('exReps').value)    || null,
        weight_kg: parseFloat(document.getElementById('exWeight').value) || null
      };
      if (editId) {
        await api.put(`/api/workouts/${currentWkId}/exercises/${editId}`, payload);
        cancelManualEdit();
      } else {
        await api.post(`/api/workouts/${currentWkId}/exercises`, payload);
      }
      resetManualExForm();
      await loadManualExercises();
      toast(editId ? 'Exercício atualizado!' : 'Exercício adicionado!');
    } catch (err) { toast(err.message, 'error'); }
  });

  document.getElementById('exCancelEdit').addEventListener('click', cancelManualEdit);
}

async function loadManualSession(date) {
  const { workout } = await api.get(`/api/workouts?date=${date}`);
  currentWkId = workout?.id || null;
  document.getElementById('wkNotes').value = workout?.notes || '';
  renderManualExercises(workout?.exercises || []);
}

async function loadManualExercises() {
  if (!currentWkId) return renderManualExercises([]);
  const { workout } = await api.get(`/api/workouts?date=${document.getElementById('wkDate').value}`);
  renderManualExercises(workout?.exercises || []);
}

function renderManualExercises(exercises) {
  const el = document.getElementById('exerciseList');
  if (!exercises.length) {
    el.innerHTML = '<div class="empty-state">Nenhum exercício adicionado</div>'; return;
  }
  el.innerHTML = exercises.map((ex, i) => {
    const parts = [];
    if (ex.sets && ex.reps) parts.push(`${ex.sets} × ${ex.reps} reps`);
    else if (ex.sets)       parts.push(`${ex.sets} séries`);
    if (ex.weight_kg)       parts.push(`${ex.weight_kg} kg`);
    return `
      <div class="exercise-item">
        <div class="exercise-num">${i + 1}</div>
        <div class="exercise-item-info">
          <div class="exercise-item-name">${escHtml(ex.name)}</div>
          ${parts.length ? `<div class="exercise-item-meta">${parts.join(' @ ')}</div>` : ''}
        </div>
        <div class="exercise-item-actions">
          <button class="btn btn-icon btn-ghost" onclick="editManualEx(${ex.id}, '${escHtml(ex.name)}', ${ex.sets ?? 'null'}, ${ex.reps ?? 'null'}, ${ex.weight_kg ?? 'null'})">${ICON.edit}</button>
          <button class="btn btn-icon btn-ghost" onclick="deleteManualEx(${ex.id})">${ICON.trash}</button>
        </div>
      </div>`;
  }).join('');
}

function editManualEx(id, name, sets, reps, weight) {
  document.getElementById('exEditId').value = id;
  document.getElementById('exName').value   = name;
  document.getElementById('exSets').value   = sets   ?? '';
  document.getElementById('exReps').value   = reps   ?? '';
  document.getElementById('exWeight').value = weight ?? '';
  document.getElementById('exFormLabel').textContent    = 'Editar Exercício';
  document.getElementById('exSubmitBtn').textContent    = 'Atualizar';
  document.getElementById('exCancelEdit').style.display = '';
  if (activeMg) renderExChips(activeMg);
  document.getElementById('exName').focus();
}
window.editManualEx = editManualEx;

async function deleteManualEx(id) {
  if (!confirm('Remover este exercício?')) return;
  try {
    await api.del(`/api/workouts/${currentWkId}/exercises/${id}`);
    await loadManualExercises();
    toast('Exercício removido');
  } catch (err) { toast(err.message, 'error'); }
}
window.deleteManualEx = deleteManualEx;

function cancelManualEdit() {
  resetManualExForm();
  document.getElementById('exFormLabel').textContent    = 'Adicionar Exercício';
  document.getElementById('exSubmitBtn').textContent    = 'Adicionar';
  document.getElementById('exCancelEdit').style.display = 'none';
  if (activeMg) renderExChips(activeMg);
}

function resetManualExForm() {
  ['exEditId','exName','exSets','exReps','exWeight'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.querySelectorAll('#exChips .ex-chip').forEach(c => c.classList.remove('selected'));
}

function renderExChips(group) {
  const current  = document.getElementById('exName').value.trim();
  const muscles  = MG_MUSCLES[group] || [];
  const view     = MG_VIEW[group] || 'front';

  const diagramEl = document.getElementById('exBodyDiagram');
  if (diagramEl && typeof renderChipMap === 'function') {
    renderChipMap(diagramEl, muscles, view);
  }

  document.getElementById('exChips').innerHTML = (EXERCISE_LIBRARY[group] || []).map(ex =>
    `<div class="ex-chip-row">
      <button type="button" class="ex-chip${current === ex ? ' selected' : ''}"
        onclick="selectExChip('${escHtml(ex)}')">${escHtml(ex)}</button>
      ${EX_META[ex] ? `<button type="button" class="ex-info-btn" onclick="showExerciseInfo('${escHtml(ex)}')" title="Ver músculos">ⓘ</button>` : ''}
    </div>`
  ).join('');
  document.getElementById('exChipsWrap').style.display = '';
}

function selectExChip(name) {
  document.getElementById('exName').value = name;
  document.querySelectorAll('#exChips .ex-chip').forEach(c =>
    c.classList.toggle('selected', c.textContent.trim() === name)
  );
  document.getElementById('exSets').focus();
}
window.selectExChip = selectExChip;
