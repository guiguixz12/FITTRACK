/* Photos tab */
function initPhotos(state) {
  document.getElementById('photoDate').value = state.date;

  document.getElementById('photoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = document.getElementById('photoDate').value;
    const file = document.getElementById('photoFile').files[0];
    if (!date || !file) return;

    // Client-side size guard (10 MB)
    if (file.size > 10 * 1024 * 1024) {
      toast('Arquivo muito grande. Máximo: 10 MB', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast('Apenas imagens são permitidas', 'error');
      return;
    }

    const btn = document.getElementById('photoUploadBtn');
    btn.textContent = 'Processando...';
    btn.disabled = true;

    try {
      const fd = new FormData();
      fd.append('date', date);
      fd.append('photo', file);
      await api.upload('/api/photos', fd);
      document.getElementById('photoFile').value = '';
      toast('Foto enviada e comprimida!');
      await loadPhotos(state);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      btn.textContent = 'Enviar';
      btn.disabled = false;
    }
  });

  const lb = document.getElementById('lightbox');
  document.getElementById('lightboxClose').addEventListener('click', () => lb.classList.remove('open'));
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.classList.remove('open'); });
}

async function loadPhotos(state) {
  const { photos } = await api.get('/api/photos');
  const gallery = document.getElementById('photoGallery');

  if (!photos.length) {
    gallery.innerHTML = '<p class="empty-state">Nenhuma foto enviada</p>';
    return;
  }

  gallery.innerHTML = photos.map(p => `
    <div class="photo-card" onclick="openLightbox('/uploads/${p.filename}')">
      <img src="/uploads/${p.filename}" alt="Foto ${p.date}" loading="lazy">
      <div class="photo-overlay">
        <span class="photo-date">${fmtDate(p.date)}</span>
        <button class="photo-delete" onclick="event.stopPropagation(); deletePhoto(${p.id})">Apagar</button>
      </div>
    </div>
  `).join('');
}

function openLightbox(src) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightbox').classList.add('open');
}
window.openLightbox = openLightbox;

async function deletePhoto(id) {
  if (!confirm('Apagar esta foto?')) return;
  try {
    await api.del(`/api/photos/${id}`);
    toast('Foto removida');
    await loadPhotos({});
  } catch (err) {
    toast(err.message, 'error');
  }
}
window.deletePhoto = deletePhoto;
