/* ═══════════════════════════════════════════
   Scanner de Código de Barras — OpenFoodFacts
   ═══════════════════════════════════════════ */

let scannerInstance = null;
let scannerCallback = null;

function openBarcodeScanner(onResult) {
  scannerCallback = onResult;

  const overlay = document.createElement('div');
  overlay.id    = '_scannerOverlay';
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:2000;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:20px;
  `;
  overlay.innerHTML = `
    <div style="width:100%;max-width:400px;background:var(--card);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow-lg)">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--border)">
        <span style="font-weight:700;font-size:.95rem">Escanear produto</span>
        <button id="_scannerClose" style="background:none;border:none;color:var(--text-muted);font-size:1.3rem;cursor:pointer;line-height:1">✕</button>
      </div>
      <div id="_scannerViewport" style="width:100%;background:#000;position:relative;min-height:280px"></div>
      <div style="padding:14px 16px">
        <p style="font-size:.8rem;color:var(--text-muted);margin-bottom:10px">Ou insira o código manualmente:</p>
        <div style="display:flex;gap:8px">
          <input type="number" id="_scannerManual" placeholder="Ex: 8412345678901"
            style="flex:1;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);padding:10px 12px;font-family:inherit;font-size:.9rem">
          <button id="_scannerManualBtn" class="btn btn-primary btn-sm">Buscar</button>
        </div>
        <div id="_scannerStatus" style="margin-top:10px;font-size:.82rem;color:var(--text-muted);min-height:18px"></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('_scannerClose').onclick = closeBarcodeScanner;
  document.getElementById('_scannerManualBtn').onclick = () => {
    const code = document.getElementById('_scannerManual').value.trim();
    if (code) fetchProduct(code);
  };
  document.getElementById('_scannerManual').onkeydown = e => {
    if (e.key === 'Enter') document.getElementById('_scannerManualBtn').click();
  };

  // Try to start camera scanner
  if (window.Html5Qrcode) {
    startCameraScanner();
  } else {
    document.getElementById('_scannerStatus').textContent = 'Câmera não disponível — use o campo manual';
  }
}

function startCameraScanner() {
  const viewport = document.getElementById('_scannerViewport');
  viewport.innerHTML = '<div id="_qrReader" style="width:100%"></div>';

  try {
    scannerInstance = new Html5Qrcode('_qrReader');
    scannerInstance.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 280, height: 160 } },
      (code) => {
        document.getElementById('_scannerStatus').textContent = `Código: ${code} — buscando...`;
        fetchProduct(code);
      },
      () => {}
    ).catch(() => {
      document.getElementById('_scannerStatus').textContent = 'Câmera negada — use o campo manual';
    });
  } catch {
    document.getElementById('_scannerStatus').textContent = 'Câmera não disponível — use o campo manual';
  }
}

async function fetchProduct(barcode) {
  const statusEl = document.getElementById('_scannerStatus');
  if (statusEl) statusEl.textContent = 'Buscando produto...';

  try {
    const res  = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,brands,nutriments,quantity,serving_size`);
    const data = await res.json();

    if (data.status !== 1 || !data.product) {
      if (statusEl) statusEl.textContent = 'Produto não encontrado na base de dados';
      return;
    }

    const p  = data.product;
    const n  = p.nutriments || {};
    const product = {
      name:       `${p.product_name || 'Produto'}${p.brands ? ' (' + p.brands + ')' : ''}`,
      barcode,
      cal100:     Math.round(n['energy-kcal_100g'] || n['energy_100g'] / 4.184 || 0),
      prot100:    Math.round((n['proteins_100g']      || 0) * 10) / 10,
      carb100:    Math.round((n['carbohydrates_100g'] || 0) * 10) / 10,
      fat100:     Math.round((n['fat_100g']           || 0) * 10) / 10,
      fiber100:   Math.round((n['fiber_100g']         || 0) * 10) / 10,
      sodium100:  Math.round((n['sodium_100g']        || 0) * 1000 * 10) / 10, // mg
      sugar100:   Math.round((n['sugars_100g']        || 0) * 10) / 10,
      serving:    parseInt(p.serving_size) || 100,
    };

    closeBarcodeScanner();
    if (scannerCallback) scannerCallback(product);
  } catch {
    if (statusEl) statusEl.textContent = 'Erro ao buscar produto. Tente novamente.';
  }
}

function closeBarcodeScanner() {
  if (scannerInstance) {
    scannerInstance.stop().catch(() => {});
    scannerInstance = null;
  }
  const overlay = document.getElementById('_scannerOverlay');
  if (overlay) overlay.remove();
}

// Modal para usar o produto escaneado — quantidade e refeição
function showScannedProductModal(product, onAdd) {
  const modal = document.createElement('div');
  modal.id = '_scannedModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:2100;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;width:100%;max-width:380px;box-shadow:var(--shadow-lg)">
      <div style="font-weight:700;font-size:.95rem;color:var(--text);margin-bottom:4px">${escHtml(product.name)}</div>
      <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:14px">Por 100g: ${product.cal100} kcal · ${product.prot100}g prot · ${product.carb100}g carb · ${product.fat100}g gord</div>

      <div style="margin-bottom:12px">
        <label style="font-size:.72rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:5px">Quantidade (g)</label>
        <input type="number" id="_scannedQty" value="${product.serving}" min="1"
          style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text);padding:10px 12px;font-family:inherit;font-size:.95rem">
      </div>

      <div id="_scannedPreview" style="background:var(--surface);border-radius:var(--radius-sm);padding:10px 12px;font-size:.82rem;color:var(--text-muted);margin-bottom:14px"></div>

      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('_scannedModal').remove()">Cancelar</button>
        <button class="btn btn-primary" style="flex:1" id="_scannedAddBtn">+ Adicionar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const qtyInput = document.getElementById('_scannedQty');
  const preview  = document.getElementById('_scannedPreview');

  function updatePreview() {
    const qty = parseFloat(qtyInput.value) || 0;
    const f   = qty / 100;
    preview.innerHTML = `${qty}g → <b style="color:var(--orange)">${Math.round(product.cal100 * f)} kcal</b> · <span style="color:var(--green)">${(product.prot100 * f).toFixed(1)}g prot</span> · <span style="color:var(--blue)">${(product.carb100 * f).toFixed(1)}g carb</span> · <span style="color:var(--yellow)">${(product.fat100 * f).toFixed(1)}g gord</span>`;
  }
  qtyInput.addEventListener('input', updatePreview);
  updatePreview();

  document.getElementById('_scannedAddBtn').onclick = () => {
    const qty = parseFloat(qtyInput.value) || 0;
    if (qty <= 0) return;
    const f = qty / 100;
    onAdd({
      name:       product.name,
      quantity_g: qty,
      calories:   Math.round(product.cal100  * f),
      protein:    Math.round(product.prot100 * f * 10) / 10,
      carbs:      Math.round(product.carb100 * f * 10) / 10,
      fat:        Math.round(product.fat100  * f * 10) / 10,
      fiber:      Math.round(product.fiber100  * f * 10) / 10,
      sodium:     Math.round(product.sodium100 * f * 10) / 10,
      sugar:      Math.round(product.sugar100  * f * 10) / 10,
    });
    modal.remove();
  };
}

function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

window.openBarcodeScanner   = openBarcodeScanner;
window.closeBarcodeScanner  = closeBarcodeScanner;
window.showScannedProductModal = showScannedProductModal;
