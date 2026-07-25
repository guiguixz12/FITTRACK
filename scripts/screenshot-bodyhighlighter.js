const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();
  await page.setViewportSize({ width: 430, height: 932 });

  page.on('console', m => { if (m.type() === 'error') console.log('JS ERR:', m.text()); });
  page.on('pageerror', e => console.log('PAGE ERR:', e.message));

  // Login
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('#name', { timeout: 8000 });
  await page.fill('#name', 'Guilherme');
  await page.fill('#password', 'guilherme123');
  await page.click('#loginBtn');
  await page.waitForURL('**/app**', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  // Navigate to workouts tab
  await page.evaluate(() => {
    [...document.querySelectorAll('[data-tab]')]
      .find(b => b.dataset.tab === 'workouts')?.click();
  });
  await page.waitForTimeout(600);

  // Go to Registrar sub-tab
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')]
      .find(b => b.textContent.trim() === 'Registrar' && b.closest('#tab-workouts'));
    btn?.click();
  });
  await page.waitForTimeout(500);

  // Helper: open exercise info modal for a given exercise name
  async function screenshotExercise(name, filename) {
    await page.evaluate(exName => {
      if (typeof showExerciseInfo === 'function') showExerciseInfo(exName);
    }, name);
    await page.waitForTimeout(800);

    const modal = await page.$('.ex-info-sheet');
    if (modal) {
      await modal.screenshot({ path: filename });
      console.log(`Saved: ${filename}`);
    } else {
      console.log(`ERROR: modal not found for ${name}`);
    }

    // Close modal
    await page.evaluate(() => {
      document.getElementById('exInfoModal').style.display = 'none';
    });
    await page.waitForTimeout(300);
  }

  await screenshotExercise('Supino Reto',   '/tmp/bh-supino-reto.png');
  await screenshotExercise('Agachamento',   '/tmp/bh-agachamento.png');
  await screenshotExercise('Barra Fixa',    '/tmp/bh-barra-fixa.png');

  // Also screenshot the chip map area
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('.mg-btn')]
      .find(b => b.dataset.group === 'costas');
    btn?.click();
  });
  await page.waitForTimeout(700);

  const chipArea = await page.$('#exChipsWrap, .ex-chips-wrap');
  if (chipArea) {
    await chipArea.screenshot({ path: '/tmp/bh-chips-costas.png' });
    console.log('Saved: /tmp/bh-chips-costas.png');
  }

  await browser.close();
  console.log('Done.');
})().catch(err => { console.error(err); process.exit(1); });
