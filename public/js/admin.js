/* Admin panel logic */

let currentRole = '';

// ── Auth guard ────────────────────────────────────────────────
async function initAdmin() {
  let me;
  try {
    const r = await fetch('/api/auth/me');
    if (!r.ok) return location.replace('/login');
    me = await r.json();
  } catch { return location.replace('/login'); }

  const role = me.user?.role;
  if (role === 'user' || !role) return location.replace('/app');

  currentRole = role;
  document.getElementById('admUserName').textContent = me.user.name;
  document.getElementById('admBadgeRole').textContent = role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN';

  if (role === 'super_admin') {
    document.getElementById('tabAdmins').style.display = '';
  }

  loadClients();
}

// ── Tabs ──────────────────────────────────────────────────────
function switchTab(tab) {
  document.getElementById('sectionClients').style.display = tab === 'clients' ? '' : 'none';
  document.getElementById('sectionAdmins').style.display  = tab === 'admins'  ? '' : 'none';
  document.getElementById('tabClients').classList.toggle('active', tab === 'clients');
  document.getElementById('tabAdmins').classList.toggle('active',  tab === 'admins');
  if (tab === 'admins') loadAdmins();
}

// ── Clients ───────────────────────────────────────────────────
async function loadClients() {
  const grid = document.getElementById('clientsGrid');
  grid.innerHTML = '<div class="adm-loading">Carregando...</div>';
  try {
    const r = await fetch('/api/admin/clients');
    if (!r.ok) throw new Error();
    const { clients } = await r.json();
    if (!clients.length) {
      grid.innerHTML = '<div class="adm-empty">Nenhum cliente ainda. Clique em "Novo" para criar.</div>';
      return;
    }
    grid.innerHTML = clients.map(c => clientCard(c)).join('');
  } catch {
    grid.innerHTML = '<div class="adm-empty">Erro ao carregar clientes.</div>';
  }
}

function clientCard(c) {
  const initial   = (c.name || '?')[0].toUpperCase();
  const lastWo    = c.last_workout ? `Último treino: ${fmtDate(c.last_workout)}` : 'Sem treinos ainda';
  const adminInfo = c.admin_name   ? ` · Admin: ${escHtml(c.admin_name)}` : '';
  return `
    <div class="adm-card">
      <div class="adm-avatar">${initial}</div>
      <div class="adm-card-info">
        <div class="adm-card-name">${escHtml(c.name)}</div>
        <div class="adm-card-meta">${lastWo} · ${c.workout_count} treino${c.workout_count !== 1 ? 's' : ''}${adminInfo}</div>
      </div>
      <div class="adm-card-actions">
        <button class="btn-enter" onclick="enterClient(${c.id})">Entrar</button>
        <button class="btn-delete" title="Excluir cliente" onclick="deleteClient(${c.id},'${escHtml(c.name).replace(/'/g,"\\'")}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </div>`;
}

async function enterClient(id) {
  try {
    const r = await fetch(`/api/auth/impersonate/${id}`, { method: 'POST' });
    if (!r.ok) { const d = await r.json(); return alert(d.error || 'Erro ao entrar'); }
    location.href = '/app';
  } catch { alert('Erro ao entrar como cliente'); }
}

async function deleteClient(id, name) {
  if (!confirm(`Excluir o cliente "${name}"? Isso é irreversível.`)) return;
  try {
    const r = await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' });
    if (!r.ok) { const d = await r.json(); return alert(d.error || 'Erro ao excluir'); }
    loadClients();
  } catch { alert('Erro ao excluir cliente'); }
}

function openNewClientModal() {
  document.getElementById('newClientForm').reset();
  document.getElementById('newClientErr').style.display = 'none';
  document.getElementById('newClientSaveBtn').disabled = false;
  document.getElementById('newClientOverlay').classList.remove('hidden');
  document.getElementById('ncName').focus();
}

document.getElementById('newClientForm').addEventListener('submit', async e => {
  e.preventDefault();
  const errEl = document.getElementById('newClientErr');
  const btn   = document.getElementById('newClientSaveBtn');
  errEl.style.display = 'none';
  btn.disabled = true;

  const body = {
    name:             document.getElementById('ncName').value.trim(),
    password:         document.getElementById('ncPwd').value,
    age:              parseInt(document.getElementById('ncAge').value) || undefined,
    sex:              document.getElementById('ncSex').value || undefined,
    height_cm:        parseInt(document.getElementById('ncHeight').value) || undefined,
    target_calories:  parseInt(document.getElementById('ncKcal').value)   || undefined,
    target_protein:   parseInt(document.getElementById('ncProt').value)   || undefined,
  };

  try {
    const r = await fetch('/api/admin/clients', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Erro ao criar');
    closeModal('newClientOverlay');
    loadClients();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
    btn.disabled = false;
  }
});

// ── Admins (super_admin only) ─────────────────────────────────
async function loadAdmins() {
  const grid = document.getElementById('adminsGrid');
  grid.innerHTML = '<div class="adm-loading">Carregando...</div>';
  try {
    const r = await fetch('/api/admin/admins');
    if (!r.ok) throw new Error();
    const { admins } = await r.json();
    if (!admins.length) {
      grid.innerHTML = '<div class="adm-empty">Nenhum admin ainda.</div>';
      return;
    }
    grid.innerHTML = admins.map(a => adminCard(a)).join('');
  } catch {
    grid.innerHTML = '<div class="adm-empty">Erro ao carregar admins.</div>';
  }
}

function adminCard(a) {
  const initial = (a.name || '?')[0].toUpperCase();
  return `
    <div class="adm-card">
      <div class="adm-avatar" style="background:rgba(50,215,75,.12);border-color:rgba(50,215,75,.3);color:var(--green)">${initial}</div>
      <div class="adm-card-info">
        <div class="adm-card-name">${escHtml(a.name)}</div>
        <div class="adm-card-meta">${a.client_count} cliente${a.client_count !== 1 ? 's' : ''}${a.email ? ' · ' + escHtml(a.email) : ''}</div>
      </div>
      <div class="adm-card-actions">
        <button class="btn-delete" title="Excluir admin" onclick="deleteAdmin(${a.id},'${escHtml(a.name).replace(/'/g,"\\'")}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </div>`;
}

async function deleteAdmin(id, name) {
  if (!confirm(`Excluir o admin "${name}"? Os clientes desse admin não serão excluídos.`)) return;
  try {
    const r = await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' });
    if (!r.ok) { const d = await r.json(); return alert(d.error || 'Erro ao excluir'); }
    loadAdmins();
  } catch { alert('Erro ao excluir admin'); }
}

function openNewAdminModal() {
  document.getElementById('newAdminForm').reset();
  document.getElementById('newAdminErr').style.display = 'none';
  document.getElementById('newAdminSaveBtn').disabled = false;
  document.getElementById('newAdminOverlay').classList.remove('hidden');
  document.getElementById('naName').focus();
}

document.getElementById('newAdminForm').addEventListener('submit', async e => {
  e.preventDefault();
  const errEl = document.getElementById('newAdminErr');
  const btn   = document.getElementById('newAdminSaveBtn');
  errEl.style.display = 'none';
  btn.disabled = true;

  const body = {
    name:     document.getElementById('naName').value.trim(),
    email:    document.getElementById('naEmail').value.trim() || undefined,
    password: document.getElementById('naPwd').value,
  };

  try {
    const r = await fetch('/api/admin/admins', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Erro ao criar');
    closeModal('newAdminOverlay');
    loadAdmins();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.style.display = 'block';
    btn.disabled = false;
  }
});

// ── Logout ─────────────────────────────────────────────────────
async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  location.replace('/login');
}

// ── Modals ──────────────────────────────────────────────────────
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}
function closeModalOnBackdrop(e, id) {
  if (e.target === document.getElementById(id)) closeModal(id);
}

// ── Utils ───────────────────────────────────────────────────────
function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmtDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

initAdmin();
