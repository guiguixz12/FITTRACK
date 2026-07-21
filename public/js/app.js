/* Main app controller */
const AppState = {
  user: null,
  date: new Date().toISOString().slice(0, 10),
  currentTab: 'dashboard',
  tabInited: {}
};

function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2800);
}
window.toast = toast;

function switchTab(tab) {
  AppState.currentTab = tab;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-section').forEach(s => s.classList.toggle('active', s.id === `tab-${tab}`));

  const loaders = {
    dashboard: () => loadDashboard(AppState),
    diet: () => { if (!AppState.tabInited.diet) { initDiet(AppState); AppState.tabInited.diet = true; } loadDiet(AppState); },
    workouts: () => { if (!AppState.tabInited.workouts) { initWorkouts(AppState); AppState.tabInited.workouts = true; } loadWorkouts(AppState); },
    photos: () => { if (!AppState.tabInited.photos) { initPhotos(AppState); AppState.tabInited.photos = true; } loadPhotos(AppState); },
    evolution: () => { if (!AppState.tabInited.evolution) { initEvolution(AppState); AppState.tabInited.evolution = true; } loadEvolution(AppState); },
    settings: () => { if (!AppState.tabInited.settings) { initSettings(AppState); AppState.tabInited.settings = true; } loadSettings(AppState); }
  };
  loaders[tab]?.();
}

async function initApp() {
  try {
    const { user } = await api.get('/api/auth/me');
    AppState.user = user;
  } catch {
    location.href = '/login';
    return;
  }

  document.getElementById('headerUserName').textContent = AppState.user.name;

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await api.post('/api/auth/logout', {});
    location.href = '/login';
  });

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Init dashboard (always the first tab)
  initDashboard(AppState);
  loadDashboard(AppState);
}

document.addEventListener('DOMContentLoaded', initApp);

// ── Shared: day-copy modal ─────────────────────────────────────────────────
// days = [{ dow, label, hasTemplate }]
// Returns Promise<number[]> — selected DOWs, or null if cancelled
function showDayCopyModal(fromLabel, days) {
  return new Promise(resolve => {
    let modal = document.getElementById('_dayCopyModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = '_dayCopyModal';
      modal.className = 'confirm-modal-bg';
      modal.innerHTML = `
        <div class="confirm-modal" style="max-width:340px">
          <div class="confirm-modal-title" id="_dcmTitle"></div>
          <div class="confirm-modal-body" id="_dcmBody" style="margin-bottom:12px"></div>
          <div id="_dcmDays" style="display:flex;flex-direction:column;gap:6px;margin-bottom:18px"></div>
          <div class="confirm-modal-actions" id="_dcmActions"></div>
        </div>`;
      document.body.appendChild(modal);
    }

    document.getElementById('_dcmTitle').textContent = `Copiar "${fromLabel}" para…`;
    document.getElementById('_dcmBody').innerHTML =
      `Selecione os dias de destino. <span style="color:var(--orange)">Atenção: o programa existente será substituído.</span>`;

    const daysEl = document.getElementById('_dcmDays');
    daysEl.innerHTML = days.map(d => `
      <label class="day-copy-row${d.hasTemplate ? ' has-tpl' : ''}">
        <input type="checkbox" value="${d.dow}" style="width:16px;height:16px;flex-shrink:0;accent-color:var(--orange)">
        <span>${d.label}</span>
        ${d.hasTemplate ? '<span class="day-copy-has-tpl">tem programa</span>' : ''}
      </label>`).join('');

    const actEl = document.getElementById('_dcmActions');
    actEl.innerHTML = '';

    const confirmBtn = document.createElement('button');
    confirmBtn.className   = 'btn btn-primary';
    confirmBtn.textContent = 'Copiar para dias selecionados';
    confirmBtn.onclick = () => {
      const selected = [...daysEl.querySelectorAll('input:checked')].map(i => parseInt(i.value));
      if (!selected.length) { toast('Selecione ao menos um dia', 'error'); return; }
      modal.classList.remove('open');
      resolve(selected);
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.className   = 'btn btn-ghost';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.onclick = () => { modal.classList.remove('open'); resolve(null); };

    actEl.appendChild(confirmBtn);
    actEl.appendChild(cancelBtn);
    modal.classList.add('open');
  });
}
window.showDayCopyModal = showDayCopyModal;

const ICON = {
  copy:  `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  trash: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
  edit:  `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  save:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
};
window.ICON = ICON;
