import createBodyHighlighter from '/js/vendor/body-highlighter.esm.js';

// ── Token conversion: my internal tokens → body-highlighter slugs ─────────────
// Tokens with imperfect mapping (no dedicated polygon in lib):
//   side-shoulder → front-deltoids  (lib doesn't distinguish lateral vs anterior deltoid)
//   lats          → upper-back      (lib has no latissimus dorsi polygon)
//   rhomboids     → upper-back      (lib groups rhomboids with upper-back region)
//   hip-flexors   → (skipped, no equivalent in lib)
const TOKEN_MAP = {
  'chest':          'chest',
  'front-shoulder': 'front-deltoids',
  'side-shoulder':  'front-deltoids',
  'rear-shoulder':  'back-deltoids',
  'biceps':         'biceps',
  'triceps':        'triceps',
  'forearms':       'forearm',
  'abs':            'abs',
  'obliques':       'obliques',
  'traps':          'trapezius',
  'lats':           'upper-back',
  'rhomboids':      'upper-back',
  'lower-back':     'lower-back',
  'quads':          'quadriceps',
  'adductors':      'adductor',
  'hamstrings':     'hamstring',
  'glutes':         'gluteal',
  'calves':         'calves',
};

// PT labels keyed by body-highlighter muscle slug (for onClick display)
const BH_LABELS = {
  'chest':          'Peitoral',
  'front-deltoids': 'Deltóide Frontal / Lateral',
  'back-deltoids':  'Deltóide Posterior',
  'biceps':         'Bíceps',
  'triceps':        'Tríceps',
  'forearm':        'Antebraço',
  'abs':            'Abdômen',
  'obliques':       'Oblíquos',
  'trapezius':      'Trapézio',
  'upper-back':     'Dorsais / Rombóides',
  'lower-back':     'Lombar',
  'quadriceps':     'Quadríceps',
  'adductor':       'Adutores',
  'hamstring':      'Isquiotibiais',
  'gluteal':        'Glúteos',
  'calves':         'Panturrilha',
};

const COL_PRIMARY   = '#D85A30';
const COL_SECONDARY = 'rgba(216,90,48,0.48)';
const COL_BODY      = '#C8CDD2';

function toSlugs(tokens) {
  return [...new Set(tokens.map(t => TOKEN_MAP[t]).filter(Boolean))];
}

function buildData(primary, secondary) {
  const pSlugs = toSlugs(primary);
  const sSlugs = toSlugs(secondary).filter(s => !pSlugs.includes(s));
  const data = [];
  if (pSlugs.length) data.push({ name: 'primary',   muscles: pSlugs, frequency: 2 });
  if (sSlugs.length) data.push({ name: 'secondary', muscles: sSlugs, frequency: 1 });
  return data;
}

// ── Modal maps (front + back, inside #exInfoMapsWrap) ────────────────────────
let frontInstance = null;
let backInstance  = null;

function initMuscleMaps() {
  const wrap = document.getElementById('exInfoMapsWrap');
  if (!wrap) return;

  if (frontInstance) { try { frontInstance.destroy(); } catch (_) {} frontInstance = null; }
  if (backInstance)  { try { backInstance.destroy();  } catch (_) {}  backInstance  = null; }
  wrap.innerHTML = '';

  const labelEl = document.getElementById('exMuscleLabel');
  const onClick = labelEl
    ? ({ muscle }) => { labelEl.textContent = BH_LABELS[muscle] || muscle; }
    : undefined;

  const frontCol = document.createElement('div');
  frontCol.className = 'mm-col';
  const frontLbl = document.createElement('span');
  frontLbl.className = 'mm-view-label';
  frontLbl.textContent = 'Frente';
  frontCol.appendChild(frontLbl);
  wrap.appendChild(frontCol);

  frontInstance = createBodyHighlighter({
    container:        frontCol,
    data:             [],
    type:             'anterior',
    bodyColor:        COL_BODY,
    highlightedColors:[COL_SECONDARY, COL_PRIMARY],
    onClick,
    wrapperClassName: 'rbh-wrapper mm-bh',
  });

  const backCol = document.createElement('div');
  backCol.className = 'mm-col';
  const backLbl = document.createElement('span');
  backLbl.className = 'mm-view-label';
  backLbl.textContent = 'Costas';
  backCol.appendChild(backLbl);
  wrap.appendChild(backCol);

  backInstance = createBodyHighlighter({
    container:        backCol,
    data:             [],
    type:             'posterior',
    bodyColor:        COL_BODY,
    highlightedColors:[COL_SECONDARY, COL_PRIMARY],
    onClick,
    wrapperClassName: 'rbh-wrapper mm-bh',
  });
}

function highlightMuscles({ primary = [], secondary = [] } = {}) {
  const data = buildData(primary, secondary);
  if (frontInstance) frontInstance.update({ data });
  if (backInstance)  backInstance.update({ data });

  const labelEl = document.getElementById('exMuscleLabel');
  if (labelEl) {
    labelEl.textContent = data.length
      ? 'Toque um músculo para ver o nome'
      : '';
  }
}

// ── Chip maps (small sidebar diagrams in exercise lists) ─────────────────────
const chipInstances = new WeakMap();

function renderChipMap(container, muscles, view) {
  if (!container) return;

  const prev = chipInstances.get(container);
  if (prev) { try { prev.destroy(); } catch (_) {} }
  container.innerHTML = '';

  if (!muscles || !muscles.length) {
    container.style.display = 'none';
    return;
  }

  container.style.display = '';

  const data = buildData(muscles.slice(0, 1), muscles.slice(1));

  const inst = createBodyHighlighter({
    container,
    data,
    type:             view === 'back' ? 'posterior' : 'anterior',
    bodyColor:        COL_BODY,
    highlightedColors:[COL_SECONDARY, COL_PRIMARY],
    wrapperClassName: 'rbh-wrapper mm-bh mm-chip-bh',
  });

  chipInstances.set(container, inst);
}

// ── Public API ────────────────────────────────────────────────────────────────
window.initMuscleMaps   = initMuscleMaps;
window.highlightMuscles = highlightMuscles;
window.renderChipMap    = renderChipMap;

document.addEventListener('DOMContentLoaded', initMuscleMaps);
