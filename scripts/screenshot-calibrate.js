// Playwright script: screenshots of muscle map calibration mode
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();

  await page.setViewportSize({ width: 430, height: 932 });

  // ── Login ──────────────────────────────────────────────────────────────────
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('#name', { timeout: 8000 });
  await page.fill('#name', 'Guilherme');
  await page.fill('#password', 'guilherme123');
  await page.click('#loginBtn');
  await page.waitForURL('**/app**', { timeout: 10000 });

  // ── Reload with ?calibrate=1 so initMuscleMaps activates calibration ────────
  const appUrl = page.url().split('?')[0];
  await page.goto(appUrl + '?calibrate=1');
  await page.waitForLoadState('networkidle');

  // ── Navigate to Treinos tab via JS (calibPanel blocks pointer events) ──────
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('[data-tab]')]
      .find(b => b.dataset.tab === 'workouts');
    if (btn) btn.click();
    else {
      // try tab by text
      [...document.querySelectorAll('button')].find(b => /treinos/i.test(b.textContent))?.click();
    }
  });
  await page.waitForTimeout(700);

  // ── Open first template group via JS ───────────────────────────────────────
  await page.evaluate(() => {
    const btn = document.querySelector('.tpl-group-btn, [class*="group-row"] button, .wk-group');
    if (btn) btn.click();
  });
  await page.waitForTimeout(400);

  // ── Open exercise info modal via JS ────────────────────────────────────────
  await page.evaluate(() => {
    // Try first info button
    const btn = document.querySelector('.ex-info-btn');
    if (btn) { btn.click(); return; }
    // Fallback: call directly
    if (typeof showExerciseInfo === 'function') showExerciseInfo('Supino Reto');
  });
  await page.waitForTimeout(700);

  // Ensure modal visible
  await page.evaluate(() => {
    const modal = document.getElementById('exInfoModal');
    if (modal && modal.style.display === 'none') {
      if (typeof showExerciseInfo === 'function') showExerciseInfo('Supino Reto');
    }
  });
  await page.waitForTimeout(500);

  // ── Screenshot: full modal (both views) ───────────────────────────────────
  const modal = await page.$('#exInfoModal .ex-info-sheet');
  if (modal) {
    await modal.screenshot({ path: '/tmp/calibrate-modal.png' });
    console.log('Saved: /tmp/calibrate-modal.png');
  }

  // ── Screenshot: front map only ────────────────────────────────────────────
  const front = await page.$('#mmFront');
  if (front) {
    await front.screenshot({ path: '/tmp/calibrate-front.png' });
    console.log('Saved: /tmp/calibrate-front.png');
  }

  // ── Screenshot: back map only ─────────────────────────────────────────────
  const back = await page.$('#mmBack');
  if (back) {
    await back.screenshot({ path: '/tmp/calibrate-back.png' });
    console.log('Saved: /tmp/calibrate-back.png');
  }

  // ── Screenshot: full page (shows the calibration panel) ──────────────────
  await page.screenshot({ path: '/tmp/calibrate-full.png', fullPage: false });
  console.log('Saved: /tmp/calibrate-full.png');

  await browser.close();
  console.log('Done.');
})().catch(err => { console.error(err); process.exit(1); });
