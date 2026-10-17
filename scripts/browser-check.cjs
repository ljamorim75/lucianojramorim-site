const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const fixture = path.join(__dirname, '../dist');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  let analyticsRequests = 0;
  async function context(options = {}) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ...options });
    await ctx.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'lucianojramorim.com.br') {
        if (url.hostname === 'www.googletagmanager.com') analyticsRequests++;
        return route.fulfill({ body: '', contentType: 'text/javascript' });
      }
      let file = path.join(fixture, url.pathname);
      if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
      const body = await fs.readFile(file).catch(() => null);
      if (!body) return route.fulfill({ status: 404, body: '' });
      const type = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.webp':'image/webp', '.jpg':'image/jpeg', '.png':'image/png' }[path.extname(file)];
      await route.fulfill({ body, contentType: type });
    });
    return ctx;
  }
  try {
    const ctx = await context();
    const page = await ctx.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('https://lucianojramorim.com.br/');
    const banner = page.locator('[data-consent-banner]');
    await banner.waitFor({ state: 'visible' });
    assert.equal(analyticsRequests, 0, 'Analytics antes de autorização');
    await page.getByRole('button', { name:'Recusar', exact:true }).click();
    await page.reload();
    assert(await banner.isHidden());
    assert.equal(analyticsRequests, 0, 'Analytics após recusa');
    const menu = page.locator('[data-menu]');
    assert(await menu.isHidden());
    await page.getByRole('button', { name:'Abrir menu', exact:true }).click();
    assert(await menu.isVisible());
    await page.keyboard.press('Escape');
    assert(await menu.isHidden());
    const upcoming = page.getByRole('button', { name:'O CUBO — em breve', exact:true });
    await upcoming.click();
    assert.equal(await upcoming.getAttribute('aria-expanded'), 'true');
    await upcoming.click();
    assert.equal(await upcoming.getAttribute('aria-expanded'), 'false');
    await upcoming.press('Enter');
    assert.equal(await upcoming.getAttribute('aria-expanded'), 'true');
    await upcoming.press('Escape');
    assert.equal(await upcoming.getAttribute('aria-expanded'), 'false');
    await page.goto('https://lucianojramorim.com.br/privacidade/');
    await page.getByRole('button', { name:'Rever preferências de análise' }).click();
    await banner.waitFor({ state:'visible' });
    await page.getByRole('button', { name:'Aceitar análise' }).click();
    await page.waitForFunction(() => typeof window.gtag === 'function');
    await page.waitForLoadState('networkidle');
    assert.equal(analyticsRequests, 1);
    await page.reload();
    await page.waitForLoadState('networkidle');
    assert.equal(analyticsRequests, 2);
    await page.getByRole('button', { name:'Rever preferências de análise' }).click();
    await banner.waitFor({ state:'visible' });
    assert.equal(analyticsRequests, 2, 'Analytics após revogação');
    await page.getByRole('button', { name:'Recusar', exact:true }).click();
    await page.goto('https://lucianojramorim.com.br/textos/monaksia/');
    await page.getByRole('button', { name:'Texto maior', exact:true }).click();
    assert.equal(await page.locator('[data-reading-content]').getAttribute('data-font-size'), 'large');
    assert.deepEqual(errors, []);
    const noJs = await context({ javaScriptEnabled:false });
    const plain = await noJs.newPage();
    await plain.goto('https://lucianojramorim.com.br/');
    assert(await plain.locator('[data-menu]').isVisible());
    assert(await plain.locator('[data-menu] a[href="/textos/"]').isVisible());
    console.log('Navegação móvel, teclado, disclosures, leitura, consentimento, recusa, persistência, revogação e navegação sem JavaScript: aprovados.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
