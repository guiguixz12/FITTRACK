const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors  = [];

  async function newPage() {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 375, height: 812 });
    page.on('pageerror', e => errors.push(e.message));
    page.on('console',   m => { if (m.type() === 'error') errors.push('JS: ' + m.text()); });
    await page.goto('http://localhost:3000/login');
    await page.fill('#name',     'Guilherme');
    await page.fill('#password', 'guilherme123');
    await page.click('#loginBtn');
    await page.waitForURL('**/app**', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    return page;
  }

  // Inject exact EX_META exercises and start active workout
  async function injectAndStart(page, exercises) {
    await page.evaluate(exs => {
      waExercises    = exs.map(e => ({ ...e, setsCompleted: 0, done: false }));
      waChecked      = 0;
      waCurrentExIdx = 0;
      waPhase        = 'working';
      renderWaFocus();
      updateWaProgress();
      document.getElementById('workoutActive').style.display = '';
      document.body.style.overflow = 'hidden';
    }, exercises);
    await page.waitForTimeout(500);
  }

  // ── TEST A: map shows and switches view ──────────────────────────────────────
  console.log('\n── TEST A: muscle map renders + view switches ──');
  const pageA = await newPage();
  // Switch to workouts tab (to ensure scripts are initialized)
  await pageA.evaluate(() => {
    [...document.querySelectorAll('.nav-btn')].find(b => b.dataset.tab === 'workouts')?.click();
  });
  await pageA.waitForTimeout(400);

  await injectAndStart(pageA, [
    { name: 'Puxada Frontal',  sets: 4, reps: 10, weight_kg: 60 }, // costas → back
    { name: 'Supino Reto',     sets: 4, reps: 10, weight_kg: 80 }, // peito  → front
    { name: 'Elevação Lateral',sets: 3, reps: 13, weight_kg: 12 }, // ombro  → front
  ]);

  const stateEx1 = await pageA.evaluate(() => {
    const mapEl = document.getElementById('waExMuscleMap');
    return {
      focusName: document.querySelector('.wa-focus-name')?.textContent,
      mapDisplay: getComputedStyle(mapEl).display,
      hasSVG: !!mapEl.querySelector('svg'),
      hasRBH: !!mapEl.querySelector('.rbh-wrapper'),
    };
  });
  console.log('Ex 1 (Puxada Frontal - back view):', JSON.stringify(stateEx1));
  await pageA.screenshot({ path: '/tmp/wa-map-ex1-puxada.png' });
  console.log('Screenshot: /tmp/wa-map-ex1-puxada.png');

  // Jump to exercise 2 (Supino Reto → front view)
  await pageA.evaluate(() => jumpToExercise(1));
  await pageA.waitForTimeout(400);

  const stateEx2 = await pageA.evaluate(() => {
    const mapEl = document.getElementById('waExMuscleMap');
    return {
      focusName: document.querySelector('.wa-focus-name')?.textContent,
      mapDisplay: getComputedStyle(mapEl).display,
      hasSVG: !!mapEl.querySelector('svg'),
    };
  });
  console.log('Ex 2 (Supino Reto - front view):', JSON.stringify(stateEx2));
  await pageA.screenshot({ path: '/tmp/wa-map-ex2-supino.png' });
  console.log('Screenshot: /tmp/wa-map-ex2-supino.png');
  await pageA.close();

  // ── TEST B: ⓘ opens modal WITHOUT changing active exercise ──────────────────
  console.log('\n── TEST B: ⓘ on 2nd item opens modal, 1st stays active ──');
  const pageB = await newPage();
  await pageB.evaluate(() => {
    [...document.querySelectorAll('.nav-btn')].find(b => b.dataset.tab === 'workouts')?.click();
  });
  await pageB.waitForTimeout(400);
  await injectAndStart(pageB, [
    { name: 'Puxada Frontal',  sets: 4, reps: 10, weight_kg: 60 },
    { name: 'Supino Reto',     sets: 4, reps: 10, weight_kg: 80 },
    { name: 'Elevação Lateral',sets: 3, reps: 13, weight_kg: 12 },
  ]);

  const beforeFocus = await pageB.evaluate(() => document.querySelector('.wa-focus-name')?.textContent);
  console.log('Active before ⓘ click:', beforeFocus);

  // Click ⓘ on 2nd item (Supino Reto, index 1)
  await pageB.evaluate(() => {
    const btns = document.querySelectorAll('.wa-mini-info-btn');
    console.log('ⓘ btn count:', btns.length);
    btns[1]?.click();
  });
  await pageB.waitForTimeout(500);

  const afterState = await pageB.evaluate(() => ({
    modalVisible:  document.getElementById('exInfoModal')?.style.display !== 'none',
    modalTitle:    document.getElementById('exInfoTitle')?.textContent,
    activeFocus:   document.querySelector('.wa-focus-name')?.textContent,
  }));
  console.log('After ⓘ[1] click:', JSON.stringify(afterState));
  console.log('Active exercise changed?', afterState.activeFocus !== beforeFocus ? 'YES (BUG)' : 'NO (correct)');
  await pageB.screenshot({ path: '/tmp/wa-info-modal.png' });
  console.log('Screenshot: /tmp/wa-info-modal.png');
  await pageB.close();

  // ── TEST C: 375px — complete-set btn and ⓘ buttons are usable ───────────────
  console.log('\n── TEST C: 375px touch targets ──');
  const pageC = await newPage();
  await pageC.evaluate(() => {
    [...document.querySelectorAll('.nav-btn')].find(b => b.dataset.tab === 'workouts')?.click();
  });
  await pageC.waitForTimeout(400);
  await injectAndStart(pageC, [
    { name: 'Puxada Frontal',  sets: 4, reps: 10, weight_kg: 60 },
    { name: 'Supino Reto',     sets: 4, reps: 10, weight_kg: 80 },
  ]);

  const usability = await pageC.evaluate(() => {
    const completeBtn = document.querySelector('.wa-complete-set-btn');
    const infoBtns    = [...document.querySelectorAll('.wa-mini-info-btn')];
    const dotEls      = [...document.querySelectorAll('.wa-set-dot')];
    const cr = completeBtn?.getBoundingClientRect();
    const ir = infoBtns.map(b => b.getBoundingClientRect());
    return {
      completeBtnW:   Math.round(cr?.width  || 0),
      completeBtnH:   Math.round(cr?.height || 0),
      infoBtnCount:   infoBtns.length,
      infoBtnMinW:    ir.length ? Math.round(Math.min(...ir.map(r => r.width)))  : 0,
      infoBtnMinH:    ir.length ? Math.round(Math.min(...ir.map(r => r.height))) : 0,
      dotsCount:      dotEls.length,
      mapVisible:     getComputedStyle(document.getElementById('waExMuscleMap')).display !== 'none',
    };
  });
  console.log('375px usability:', JSON.stringify(usability));
  await pageC.screenshot({ path: '/tmp/wa-375px.png' });
  console.log('Screenshot: /tmp/wa-375px.png');
  await pageC.close();

  const jsErrors = errors.filter(e => !e.includes('401'));
  if (jsErrors.length) console.log('\nJS Errors:', jsErrors);
  else console.log('\nNo JS errors.');

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
