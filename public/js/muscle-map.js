// Muscle highlighting via body-highlighter lib (loaded globally from vendor script)
(function () {
  'use strict';

  // ── Token conversion: my internal tokens → body-highlighter slugs ───────────
  // Imperfect mappings:
  //   side-shoulder → front-deltoids  (lib has no dedicated lateral-deltoid polygon)
  //   lats          → upper-back      (lib has no dedicated latissimus dorsi polygon)
  //   rhomboids     → upper-back      (lib groups rhomboids in the upper-back region)
  //   hip-flexors   → (skipped, no equivalent in lib)
  var TOKEN_MAP = {
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

  // PT labels keyed by body-highlighter slug (for onClick display)
  var BH_LABELS = {
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

  var COL_PRIMARY   = '#D85A30';
  var COL_SECONDARY = 'rgba(216,90,48,0.48)';
  var COL_BODY      = '#C8CDD2';

  function toSlugs(tokens) {
    var seen = {};
    return tokens.map(function(t) { return TOKEN_MAP[t]; })
      .filter(function(s) {
        if (!s || seen[s]) return false;
        seen[s] = true;
        return true;
      });
  }

  function buildData(primary, secondary) {
    var pSlugs = toSlugs(primary);
    var pSet   = {};
    pSlugs.forEach(function(s) { pSet[s] = true; });
    var sSlugs = toSlugs(secondary).filter(function(s) { return !pSet[s]; });
    var data = [];
    if (pSlugs.length) data.push({ name: 'primary',   muscles: pSlugs, frequency: 2 });
    if (sSlugs.length) data.push({ name: 'secondary', muscles: sSlugs, frequency: 1 });
    return data;
  }

  // ── Modal maps (front + back inside #exInfoMapsWrap) ─────────────────────────
  var frontInstance = null;
  var backInstance  = null;

  function initMuscleMaps() {
    var wrap = document.getElementById('exInfoMapsWrap');
    if (!wrap) return;
    if (!window.createBodyHighlighter) {
      wrap.innerHTML = '<p style="color:#888;font-size:.75rem;padding:8px 0;text-align:center">Mapa muscular indisponível</p>';
      return;
    }

    if (frontInstance) { try { frontInstance.destroy(); } catch(e){} frontInstance = null; }
    if (backInstance)  { try { backInstance.destroy();  } catch(e){} backInstance  = null; }
    wrap.innerHTML = '';

    var labelEl = document.getElementById('exMuscleLabel');
    var onClick  = labelEl
      ? function(s) { labelEl.textContent = BH_LABELS[s.muscle] || s.muscle; }
      : undefined;

    var frontCol = document.createElement('div');
    frontCol.className = 'mm-col';
    var frontLbl = document.createElement('span');
    frontLbl.className = 'mm-view-label';
    frontLbl.textContent = 'Frente';
    frontCol.appendChild(frontLbl);
    wrap.appendChild(frontCol);

    frontInstance = window.createBodyHighlighter({
      container:         frontCol,
      data:              [],
      type:              'anterior',
      bodyColor:         COL_BODY,
      highlightedColors: [COL_SECONDARY, COL_PRIMARY],
      onClick:           onClick,
      wrapperClassName:  'rbh-wrapper mm-bh',
    });

    var backCol = document.createElement('div');
    backCol.className = 'mm-col';
    var backLbl = document.createElement('span');
    backLbl.className = 'mm-view-label';
    backLbl.textContent = 'Costas';
    backCol.appendChild(backLbl);
    wrap.appendChild(backCol);

    backInstance = window.createBodyHighlighter({
      container:         backCol,
      data:              [],
      type:              'posterior',
      bodyColor:         COL_BODY,
      highlightedColors: [COL_SECONDARY, COL_PRIMARY],
      onClick:           onClick,
      wrapperClassName:  'rbh-wrapper mm-bh',
    });
  }

  function highlightMuscles(opts) {
    var primary   = (opts && opts.primary)   || [];
    var secondary = (opts && opts.secondary) || [];
    var data = buildData(primary, secondary);
    if (frontInstance) frontInstance.update({ data: data });
    if (backInstance)  backInstance.update({ data: data });

    var labelEl = document.getElementById('exMuscleLabel');
    if (labelEl) {
      labelEl.textContent = data.length ? 'Toque um músculo para ver o nome' : '';
    }
  }

  // ── Chip maps (small sidebar diagrams in exercise lists) ─────────────────────
  var chipInstances = typeof WeakMap !== 'undefined' ? new WeakMap() : null;

  function renderChipMap(container, muscles, view) {
    if (!container || !window.createBodyHighlighter) return;

    if (chipInstances) {
      var prev = chipInstances.get(container);
      if (prev) { try { prev.destroy(); } catch(e){} }
    }
    container.innerHTML = '';

    if (!muscles || !muscles.length) {
      container.style.display = 'none';
      return;
    }

    container.style.display = '';

    var data = buildData(muscles.slice(0, 1), muscles.slice(1));

    var inst = window.createBodyHighlighter({
      container:         container,
      data:              data,
      type:              view === 'back' ? 'posterior' : 'anterior',
      bodyColor:         COL_BODY,
      highlightedColors: [COL_SECONDARY, COL_PRIMARY],
      wrapperClassName:  'rbh-wrapper mm-bh mm-chip-bh',
    });

    if (chipInstances) chipInstances.set(container, inst);
  }

  // ── Public API ────────────────────────────────────────────────────────────────
  window.initMuscleMaps   = initMuscleMaps;
  window.highlightMuscles = highlightMuscles;
  window.renderChipMap    = renderChipMap;

  document.addEventListener('DOMContentLoaded', initMuscleMaps);
})();
