const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();
  await page.setViewportSize({ width: 430, height: 932 });
  page.on('pageerror', e => console.log('ERR:', e.message));
  await page.goto('http://localhost:3000/login');
  await page.waitForSelector('#name');
  await page.fill('#name', 'Guilherme');
  await page.fill('#password', 'guilherme123');
  await page.click('#loginBtn');
  await page.waitForURL('**/app**', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const btns = document.querySelectorAll('[data-tab]');
    [...btns].find(b => b.dataset.tab === 'workouts').click();
  });
  await page.waitForTimeout(600);
  await page.evaluate(() => { showExerciseInfo('Agachamento Livre'); });
  await page.waitForTimeout(1000);
  const modal = await page.$('.ex-info-sheet');
  if (modal) {
    await modal.screenshot({ path: '/tmp/bh-agachamento-livre.png' });
    console.log('Saved /tmp/bh-agachamento-livre.png');
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
