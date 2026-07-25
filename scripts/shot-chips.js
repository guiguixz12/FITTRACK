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
    [...document.querySelectorAll('[data-tab]')].find(b => b.dataset.tab === 'workouts').click();
  });
  await page.waitForTimeout(600);

  // Go to Registrar sub-tab
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')]
      .find(b => b.textContent.trim() === 'Registrar' && b.closest('#tab-workouts'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(500);

  // Click "Peito" muscle group button inside #muscleGroups
  await page.evaluate(() => {
    const btn = document.querySelector('#muscleGroups .mg-btn[data-group="peito"]');
    console.log('peito btn:', !!btn, btn?.textContent);
    btn?.click();
  });
  await page.waitForTimeout(800);

  // Check diagram state
  const diagInfo = await page.evaluate(() => {
    const d = document.getElementById('exBodyDiagram');
    return {
      display: d?.style.display,
      hasContent: !!d?.innerHTML.trim(),
      innerTag: d?.firstElementChild?.tagName,
      innerClass: d?.firstElementChild?.className,
      svgCount: d?.querySelectorAll('svg').length
    };
  });
  console.log('exBodyDiagram:', diagInfo);

  // Screenshot the chips layout area
  await page.screenshot({ path: '/tmp/bh-chips.png', clip: { x: 0, y: 300, width: 430, height: 400 } });
  console.log('Saved /tmp/bh-chips.png');

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
