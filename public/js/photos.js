/* Progress photos — upload + gallery in the Progress tab */

function initPhotos(state) {
  const fileEl = document.getElementById('photoFile');
  const dateEl = document.getElementById('photoDate');
  if (dateEl) dateEl.value = state.date || new Date().toISOString().slice(0, 10);

  fileEl?.addEventListener('change', () => {
    const file = fileEl.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast('Arquivo muito grande. Máximo: 10 MB', 'error');
      fileEl.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast('Apenas imagens são permitidas', 'error');
      fileEl.value = '';
      return;
    }
    const nameEl = document.getElementById('photoFileName');
    if (nameEl) nameEl.textContent = file.name;
    const bar = document.getElementById('photoConfirmBar');
    if (bar) bar.style.display = '';
    if (dateEl && !dateEl.value) dateEl.value = new Date().toISOString().slice(0, 10);
  });

  const lb = document.getElementById('lightbox');
  document.getElementById('lightboxClose')?.addEventListener('click', () => lb?.classList.remove('open'));
  lb?.addEventListener('click', e => { if (e.target === lb) lb.classList.remove('open'); });
}

async function loadPhotos(state) {
  const gallery = document.getElementById('photoGallery');
  if (!gallery) return;

  try {
    const { photos } = await api.get('/api/photos');

    if (!photos.length) {
      gallery.innerHTML = `
        <div class="pg-photo-empty-state">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
          <p>Nenhuma foto ainda</p>
        </div>`;
      return;
    }

    gallery.innerHTML = photos.map(p => `
      <div class="pg-photo-item" onclick="openLightbox('/api/photos/file/${p.filename}')">
        <img src="/api/photos/file/${p.filename}" alt="Foto ${p.date}" loading="lazy">
        <div class="pg-photo-item-overlay">
          <span class="pg-photo-item-date">${fmtDate ? fmtDate(p.date) : p.date}</span>
          <button class="pg-photo-item-del" onclick="event.stopPropagation(); deletePhoto(${p.id})" title="Apagar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    if (gallery) gallery.innerHTML = `<div class="pg-photo-empty-state"><p>Erro ao carregar fotos</p></div>`;
  }
}

async function submitPhotoUpload() {
  const fileEl = document.getElementById('photoFile');
  const dateEl = document.getElementById('photoDate');
  const btn    = document.getElementById('photoUploadBtn');
  const file   = fileEl?.files[0];
  const date   = dateEl?.value;

  if (!file || !date) { toast('Selecione uma data', 'error'); return; }

  const origText = btn.textContent;
  btn.textContent = '...';
  btn.disabled = true;

  try {
    const fd = new FormData();
    fd.append('date', date);
    fd.append('photo', file);
    await api.upload('/api/photos', fd);
    cancelPhotoUpload();
    toast('Foto enviada!');
    await loadPhotos({});
  } catch (err) {
    toast(err.message || 'Erro ao enviar', 'error');
  } finally {
    btn.textContent = origText;
    btn.disabled = false;
  }
}
window.submitPhotoUpload = submitPhotoUpload;

function cancelPhotoUpload() {
  const fileEl = document.getElementById('photoFile');
  const bar    = document.getElementById('photoConfirmBar');
  if (fileEl) fileEl.value = '';
  if (bar)    bar.style.display = 'none';
}
window.cancelPhotoUpload = cancelPhotoUpload;

function openLightbox(src) {
  const img = document.getElementById('lightboxImg');
  const lb  = document.getElementById('lightbox');
  if (img) img.src = src;
  if (lb)  lb.classList.add('open');
}
window.openLightbox = openLightbox;

async function deletePhoto(id) {
  if (!confirm('Apagar esta foto?')) return;
  try {
    await api.del(`/api/photos/${id}`);
    toast('Foto removida');
    await loadPhotos({});
  } catch (err) {
    toast(err.message || 'Erro ao apagar', 'error');
  }
}
window.deletePhoto = deletePhoto;
