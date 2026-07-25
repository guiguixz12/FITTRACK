// PNG line art + SVG polygon overlay for muscle highlighting
(function () {
  'use strict';

  const W = 896, H = 1200;

  const LABELS = {
    'chest':          'Peitoral',
    'front-shoulder': 'Deltoide anterior',
    'side-shoulder':  'Deltoide lateral',
    'rear-shoulder':  'Deltoide posterior',
    'biceps':         'Bíceps',
    'triceps':        'Tríceps',
    'forearms':       'Antebraço',
    'abs':            'Abdômen',
    'obliques':       'Oblíquos',
    'quads':          'Quadríceps',
    'adductors':      'Adutores',
    'lats':           'Dorsais',
    'lower-back':     'Lombar',
    'glutes':         'Glúteos',
    'hamstrings':     'Posterior de coxa',
    'calves':         'Panturrilha',
    'traps':          'Trapézio',
  };

  // ── Front-view polygons (viewBox 0 0 896 1200) ───────────────────────────────
  // Each entry: [muscle-token, SVG-path-d]
  const FRONT = [
    // chest — left pec
    ['chest',         'M448,228 L318,232 L258,272 L262,350 L352,380 L448,370 Z'],
    // chest — right pec
    ['chest',         'M448,228 L578,232 L635,272 L631,350 L543,380 L448,370 Z'],
    // front-shoulder — left
    ['front-shoulder','M240,222 L310,214 L340,258 L298,296 L236,284 Z'],
    // front-shoulder — right
    ['front-shoulder','M655,222 L585,214 L555,258 L597,296 L659,284 Z'],
    // side-shoulder — left (outermost)
    ['side-shoulder', 'M198,234 L245,220 L246,280 L195,274 Z'],
    // side-shoulder — right
    ['side-shoulder', 'M697,234 L650,220 L649,280 L700,274 Z'],
    // biceps — left
    ['biceps',        'M213,294 L264,284 L280,436 L219,446 Z'],
    // biceps — right
    ['biceps',        'M681,294 L630,284 L615,436 L674,446 Z'],
    // forearms — left
    ['forearms',      'M200,448 L274,435 L294,622 L206,632 Z'],
    // forearms — right
    ['forearms',      'M694,448 L621,435 L601,622 L688,632 Z'],
    // abs (rectus abdominis)
    ['abs',           'M370,382 L525,382 L540,558 L355,558 Z'],
    // obliques — left
    ['obliques',      'M265,400 L372,384 L360,556 L232,514 Z'],
    // obliques — right
    ['obliques',      'M630,400 L523,384 L535,556 L663,514 Z'],
    // quads — left thigh
    ['quads',         'M272,596 L416,596 L430,854 L265,854 Z'],
    // quads — right thigh
    ['quads',         'M479,596 L622,596 L630,854 L466,854 Z'],
    // adductors — left inner thigh
    ['adductors',     'M384,600 L456,600 L464,782 L390,782 Z'],
    // adductors — right inner thigh
    ['adductors',     'M439,600 L511,600 L506,782 L433,782 Z'],
    // calves — left
    ['calves',        'M275,860 L394,860 L398,1085 L272,1085 Z'],
    // calves — right
    ['calves',        'M499,860 L618,860 L622,1085 L495,1085 Z'],
  ];

  // ── Back-view polygons ────────────────────────────────────────────────────────
  const BACK = [
    // traps — diamond on upper back + neck
    ['traps',         'M387,190 L508,190 L578,272 L548,384 L448,406 L348,384 L317,272 Z'],
    // rear-shoulder — left
    ['rear-shoulder', 'M220,232 L304,222 L340,272 L308,308 L218,300 Z'],
    // rear-shoulder — right
    ['rear-shoulder', 'M675,232 L591,222 L555,272 L587,308 L677,300 Z'],
    // triceps — left
    ['triceps',       'M192,310 L250,302 L270,472 L204,482 Z'],
    // triceps — right
    ['triceps',       'M702,310 L645,302 L624,472 L689,482 Z'],
    // forearms (back view) — left
    ['forearms',      'M185,485 L261,472 L283,652 L196,662 Z'],
    // forearms — right
    ['forearms',      'M709,485 L634,472 L612,652 L699,662 Z'],
    // lats — left
    ['lats',          'M270,290 L388,274 L404,502 L258,512 Z'],
    // lats — right
    ['lats',          'M507,274 L622,290 L637,512 L491,502 Z'],
    // lower-back (erector spinae)
    ['lower-back',    'M358,508 L538,508 L553,632 L342,632 Z'],
    // glutes — left
    ['glutes',        'M262,638 L442,638 L458,782 L258,774 Z'],
    // glutes — right
    ['glutes',        'M453,638 L632,638 L636,774 L437,782 Z'],
    // hamstrings — left
    ['hamstrings',    'M256,790 L431,790 L442,1008 L251,1008 Z'],
    // hamstrings — right
    ['hamstrings',    'M464,790 L638,790 L643,1008 L459,1008 Z'],
    // calves — left
    ['calves',        'M262,1018 L386,1018 L390,1154 L257,1154 Z'],
    // calves — right
    ['calves',        'M508,1018 L628,1018 L632,1154 L503,1154 Z'],
  ];

  // ── Rendering ─────────────────────────────────────────────────────────────────
  function makePaths(muscles) {
    return muscles.map(([token, d]) =>
      `<path data-muscle="${token}" d="${d}" fill="transparent" class="mm-path"/>`
    ).join('');
  }

  function buildMapsHTML() {
    return `
      <div class="mm-container" data-view="front" id="mmFront">
        <img src="/images/muscle-map/front.png" class="mm-img" alt="Vista frontal" loading="lazy">
        <svg class="mm-overlay" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
          ${makePaths(FRONT)}
        </svg>
        <span class="mm-label">Frente</span>
      </div>
      <div class="mm-container" data-view="back" id="mmBack">
        <img src="/images/muscle-map/back.png" class="mm-img" alt="Vista traseira" loading="lazy">
        <svg class="mm-overlay" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
          ${makePaths(BACK)}
        </svg>
        <span class="mm-label">Costas</span>
      </div>`;
  }

  // ── Highlight API ─────────────────────────────────────────────────────────────
  const COL_PRIMARY   = 'rgba(216,90,48,0.55)';
  const COL_SECONDARY = 'rgba(240,153,123,0.45)';

  function highlightMuscles({ primary = [], secondary = [] } = {}) {
    const pSet = new Set(primary);
    const sSet = new Set(secondary);
    document.querySelectorAll('#exInfoMapsWrap .mm-path').forEach(p => {
      const m = p.dataset.muscle;
      if (pSet.has(m))      p.setAttribute('fill', COL_PRIMARY);
      else if (sSet.has(m)) p.setAttribute('fill', COL_SECONDARY);
      else                  p.setAttribute('fill', 'transparent');
    });
  }

  // ── Tooltip ───────────────────────────────────────────────────────────────────
  function initTooltips(root) {
    let tip = document.getElementById('mmTooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'mmTooltip';
      tip.className = 'mm-tooltip';
      document.body.appendChild(tip);
    }
    root.querySelectorAll('.mm-path').forEach(path => {
      const label = LABELS[path.dataset.muscle] || path.dataset.muscle;
      path.addEventListener('mouseenter', () => { tip.textContent = label; tip.style.display = 'block'; });
      path.addEventListener('mousemove',  e  => { tip.style.left = (e.clientX + 14) + 'px'; tip.style.top = (e.clientY - 32) + 'px'; });
      path.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
    });
  }

  // ── Calibration mode ─────────────────────────────────────────────────────────
  function initCalibration(root) {
    // Style all paths: red stroke + semi-transparent fill
    root.querySelectorAll('.mm-path').forEach(p => {
      p.setAttribute('fill',         'rgba(255,0,0,0.13)');
      p.setAttribute('stroke',       '#e00');
      p.setAttribute('stroke-width', '3');

      // Add label at centroid
      const pts = (p.getAttribute('d').match(/[\d.]+,[\d.]+/g) || [])
        .map(s => s.split(',').map(Number));
      if (pts.length) {
        const [cx, cy] = pts
          .reduce(([ax, ay], [x, y]) => [ax + x, ay + y], [0, 0])
          .map(v => v / pts.length);
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', cx); t.setAttribute('y', cy);
        t.setAttribute('fill', '#c00'); t.setAttribute('font-size', '24');
        t.setAttribute('text-anchor', 'middle'); t.setAttribute('pointer-events', 'none');
        t.setAttribute('font-family', 'monospace');
        t.textContent = p.dataset.muscle;
        p.parentNode.appendChild(t);
      }
    });

    // Panel
    const panel = document.createElement('div');
    panel.id = 'calibPanel';
    panel.style.cssText = [
      'position:fixed','bottom:16px','right:16px',
      'background:#fff','border:2.5px solid #e00',
      'padding:10px 14px','z-index:9999',
      'font:13px/1.7 monospace','border-radius:10px',
      'box-shadow:0 4px 24px rgba(0,0,0,.35)','min-width:230px',
    ].join(';');
    panel.innerHTML = `
      <b style="color:#c00">🎯 Modo Calibração</b><br>
      <span id="calibPos" style="color:#444">Mova o mouse sobre o mapa</span><br>
      <span id="calibMuscle" style="color:#888;font-size:11px"></span><br>
      <span style="font-size:10px;color:#aaa">Clique = copiar coordenada</span>`;
    document.body.appendChild(panel);

    root.querySelectorAll('.mm-overlay').forEach(svg => {
      const view = svg.closest('.mm-container').dataset.view;
      svg.addEventListener('mousemove', e => {
        const r = svg.getBoundingClientRect();
        const x = Math.round((e.clientX - r.left) * W / r.width);
        const y = Math.round((e.clientY - r.top)  * H / r.height);
        document.getElementById('calibPos').textContent = `${view}: (${x}, ${y})`;
      });
      svg.addEventListener('click', e => {
        const r  = svg.getBoundingClientRect();
        const x  = Math.round((e.clientX - r.left) * W / r.width);
        const y  = Math.round((e.clientY - r.top)  * H / r.height);
        const pt = `${x},${y}`;
        navigator.clipboard?.writeText(pt).catch(() => {});
        document.getElementById('calibMuscle').textContent = `📋 ${pt}`;
      });
    });

    root.querySelectorAll('.mm-path').forEach(p =>
      p.addEventListener('mouseenter', () => {
        document.getElementById('calibMuscle').textContent = p.dataset.muscle;
      })
    );
  }

  // ── Init (called on DOMContentLoaded) ────────────────────────────────────────
  function initMuscleMaps() {
    const wrap = document.getElementById('exInfoMapsWrap');
    if (!wrap) return;
    wrap.innerHTML = buildMapsHTML();
    initTooltips(wrap);
    if (new URLSearchParams(location.search).get('calibrate') === '1') {
      initCalibration(wrap);
    }
  }

  // ── Chip-level mini map (single view, injected into sidebar el) ──────────────
  function buildChipMapHTML(view) {
    const src  = view === 'back' ? '/images/muscle-map/back.png' : '/images/muscle-map/front.png';
    const data = view === 'back' ? BACK : FRONT;
    const paths = data.map(([token, d]) =>
      `<path data-muscle="${token}" d="${d}" fill="transparent" class="mm-path mm-chip-path"/>`
    ).join('');
    return `<div style="position:relative;border-radius:8px;overflow:hidden;line-height:0">
      <img src="${src}" style="display:block;width:100%;height:auto" alt="">
      <svg style="position:absolute;inset:0;width:100%;height:100%" viewBox="0 0 ${W} ${H}">
        ${paths}
      </svg>
    </div>`;
  }

  function highlightChipMap(container, muscles) {
    if (!container) return;
    const pSet = new Set(muscles.slice(0, 1));
    const sSet = new Set(muscles.slice(1));
    container.querySelectorAll('.mm-chip-path').forEach(p => {
      const m = p.dataset.muscle;
      if (pSet.has(m))      p.setAttribute('fill', COL_PRIMARY);
      else if (sSet.has(m)) p.setAttribute('fill', COL_SECONDARY);
      else                  p.setAttribute('fill', 'transparent');
    });
  }

  // ── Public API ────────────────────────────────────────────────────────────────
  window.initMuscleMaps    = initMuscleMaps;
  window.highlightMuscles  = highlightMuscles;
  window.buildChipMapHTML  = buildChipMapHTML;
  window.highlightChipMap  = highlightChipMap;
  window.MM_LABELS         = LABELS;
  window.MM_FRONT          = FRONT;
  window.MM_BACK           = BACK;

  document.addEventListener('DOMContentLoaded', initMuscleMaps);
})();
