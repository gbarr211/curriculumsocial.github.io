const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require(process.env.CS_PLAYWRIGHT_MODULE || 'playwright-core');
const root = path.resolve(__dirname, '../..');
const mime = {'.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml'};
const server = http.createServer((req, res) => {
  let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404); res.end(); return;}
  res.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream'}); fs.createReadStream(file).pipe(res);
});
let browser, passed = 0;
const pass = text => {passed++; console.log('PASS ' + text);};
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true});
  for (const width of [390, 1280]) {
    const context = await browser.newContext({viewport: {width, height: 1000}}), errors = [], external = [], bad = [];
    await context.route('**/*', route => {if (route.request().url().startsWith(base + '/')) return route.continue(); external.push(route.request().url()); return route.abort();});
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message)); page.on('response', r => {if (r.status() >= 400) bad.push(r.url());});
    await page.goto(base + '/review/events.html'); await page.locator('.event-card').first().waitFor();
    const card = id => page.locator('[data-event=' + id + ']');
    const open = async (id, action = 'rsvp') => {await card(id).locator('[data-event-action=' + action + ']').click(); await page.locator('#event-dialog').waitFor({state: 'visible'});};
    const close = async () => {await page.locator('#close-event').click(); await page.locator('#event-dialog').waitFor({state: 'hidden'});};
    const confirm = async text => {await page.locator('#confirm-event').click(); await page.locator('#event-dialog').waitFor({state: 'hidden'}); await page.locator('#event-status').filter({hasText: text}).waitFor();};
    const screenshot = async name => {if (process.env.CS_SCREENSHOT_DIR) {fs.mkdirSync(process.env.CS_SCREENSHOT_DIR, {recursive: true}); await page.screenshot({path: path.join(process.env.CS_SCREENSHOT_DIR, name + '-' + width + '.png'), fullPage: true});}};
    assert.equal(await page.locator('.event-card').count(), 3); assert.match(await page.locator('.preview-banner').innerText(), /No real booking/); assert.match(await page.locator('.lede').innerText(), /don’t need a pod/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true); await screenshot('events-discover');
    await open('beach'); assert.equal(await page.locator('#close-event').evaluate(el => document.activeElement === el), true); await page.keyboard.press('Escape'); await page.locator('#event-dialog').waitFor({state: 'hidden'}); assert.equal(await card('beach').locator('[data-event-action=rsvp]').evaluate(el => document.activeElement === el), true);
    pass('preview labels, no compulsory pod, responsive cards and keyboard focus at ' + width);
    await page.locator('[data-filter=learning]').click(); assert.equal(await page.locator('.event-card').count(), 1); assert.equal(await card('play').count(), 1);
    await open('play'); assert.equal(await page.locator('#confirm-event').isDisabled(), true); assert.match(await page.locator('#event-details').innerText(), /All sample places/); await close();
    await page.locator('[data-filter=mine]').click(); assert.equal(await page.locator('.event-card').count(), 0); assert.match(await page.locator('.empty').innerText(), /No plans yet/); await page.locator('[data-filter=all]').click();
    pass('social/learning filters, full event detail and empty plans at ' + width);
    await open('beach'); await page.locator('#party-size').selectOption('3'); await page.locator('#confirm-event').click(); assert.equal(await page.locator('#event-dialog').isVisible(), true); assert.equal(await page.locator('#caregiver-check').evaluate(el => el.validity.valueMissing), true); await page.locator('#caregiver-check').check(); await confirm('sample places are reserved');
    assert.match(await card('beach').innerText(), /2 places available/); assert.match(await card('beach').innerText(), /Your sample plan · 3 people/); await page.locator('[data-filter=mine]').click(); assert.equal(await page.locator('.event-card').count(), 1); await screenshot('events-my-plans');
    await open('beach'); await page.locator('#party-size').selectOption('5'); await page.locator('#caregiver-check').check(); await confirm('sample places are reserved'); assert.match(await card('beach').innerText(), /All places reserved/);
    pass('caregiver acknowledgement, household RSVP, edit and capacity accounting at ' + width);
    await open('beach', 'cancel-rsvp'); assert.equal(await page.locator('#rsvp-fields').isHidden(), true); await confirm('released'); assert.equal(await page.locator('.event-card').count(), 0); await page.locator('[data-filter=all]').click(); assert.match(await card('beach').innerText(), /5 places available/);
    await page.locator('#event-family').selectOption('chen'); assert.match(await card('beach').innerText(), /Your sample plan · 4 people/); assert.equal(await card('beach').locator('[data-event-action=cancel-event]').count(), 0);
    await page.locator('#event-family').selectOption('taylor'); await open('beach', 'cancel-event'); await confirm('gathering cancelled'); assert.match(await card('beach').innerText(), /Cancelled in this example/); assert.equal(await card('beach').locator('button').count(), 0);
    await page.locator('#event-family').selectOption('chen'); assert.equal(await card('beach').locator('.plan-state').count(), 0);
    pass('cancellation frees places; only host cancels a gathering for all sample families at ' + width);
    await page.reload(); await page.locator('.event-card').first().waitFor(); assert.equal(await page.locator('#event-family').inputValue(), 'rivera'); assert.match(await card('beach').innerText(), /5 places available/);
    assert.deepEqual(await page.evaluate(() => ({local: localStorage.length, session: sessionStorage.length})), {local: 0, session: 0});
    assert.deepEqual(errors, []); assert.deepEqual(external, []); assert.deepEqual(bad, []);
    for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')).filter(href => href.startsWith('/')))) assert.equal((await page.request.get(base + href)).status(), 200, href);
    pass('reload resets synthetic data; no storage, external traffic, errors or broken page links at ' + width);
    await context.close();
  }
  console.log(passed + ' event browser groups passed; synthetic data only.');
})().catch(error => {console.error(error); process.exitCode = 1;}).finally(async () => {await browser?.close(); server.close();});
