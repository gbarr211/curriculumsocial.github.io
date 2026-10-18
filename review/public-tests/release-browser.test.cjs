const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {firebaseApp,firebaseSignedOutAuth}=require('./firebase-browser-fixtures.cjs');
const root = path.resolve(__dirname, '../..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
const server = http.createServer((req, res) => {
    const route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (route === '/' ? '/index.html' : route));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.writeHead(404); res.end(); return;
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
});
let browser, passed = 0;
const pass = name => { console.log('PASS ' + name); passed++; };
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true });
    const context = await browser.newContext();
    const unexpected = [], errors = [], missing = [];
    let signedInForDemo = false;
    await context.route('**/*', route => {
        if (route.request().url() === 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js') return route.fulfill({contentType:'text/javascript',body:firebaseApp});
        if (route.request().url() === 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js') return route.fulfill({contentType:'text/javascript',body:signedInForDemo?firebaseSignedOutAuth.replace('cb(null)','cb({uid:"routing-test",email:"routing@example.invalid"})'):firebaseSignedOutAuth});
        if (route.request().url().startsWith(base + '/')) return route.continue();
        unexpected.push(route.request().url()); return route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) missing.push(response.url()); });
    for (const width of [320, 390, 1024, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(base + '/');
        assert.match(await page.locator('h1').textContent(), /A place to belong/);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        if (width <= 1100) {
            await page.locator('.menu-toggle').click();
            assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
        }
        assert.equal(await page.locator('#navigation a[href="login.html"]').isVisible(), true);
        assert.equal(await page.locator('#navigation a[href="signup.html"]').isVisible(), true);
        if (width <= 1100) await page.locator('.menu-toggle').click();
        if (process.env.CS_SCREENSHOT_DIR) {
            fs.mkdirSync(process.env.CS_SCREENSHOT_DIR, { recursive: true });
            await page.screenshot({ path: path.join(process.env.CS_SCREENSHOT_DIR, 'homepage-' + width + '.png') });
        }
        pass('homepage and account entry points at ' + width + 'px');
    }
    await page.locator('[data-role="educator"]').click();
    await page.locator('[data-request]:not([data-general])').click();
    assert.equal(await page.locator('#request-dialog').isVisible(), true);
    assert.equal(await page.locator('#interest-role').inputValue(), 'educator');
    assert.match(await page.locator('.form-note').textContent(), /nothing is sent/i);
    await page.locator('#request-dialog .close').click();
    await page.locator('[data-general]').click();
    assert.equal(await page.locator('#interest-role').inputValue(), 'general');
    await page.locator('#request-dialog .close').click();
    pass('landing interest previews retain role defaults and explicit no-submission notice');

    for (const width of [390, 1280]) {
        await page.setViewportSize({width, height:900});
        await page.locator('[data-workspace=community]').click();
        await page.locator('.workspace').scrollIntoViewIfNeeded();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        if (process.env.CS_SCREENSHOT_DIR) await page.locator('.workspace').screenshot({path:path.join(process.env.CS_SCREENSHOT_DIR,'workspace-'+width+'.png')});
    }
    await page.goto(base + '/apply.html?demo=1');
    await page.locator('[data-action=apply][data-id=teach]').click();
    await page.locator('#name').fill('Sample Adult');
    await page.locator('#email').fill('sample@example.invalid');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.locator('#email').evaluate(el => el.matches(':focus-visible') && el.validity.valid),true);
    assert.equal(await page.locator('#email').evaluate(el => getComputedStyle(el).outlineColor),'rgb(25, 60, 50)');
    assert.equal(await page.locator('#form-error').isVisible(),false);
    if (process.env.CS_SCREENSHOT_DIR) await page.locator('#community-dialog').screenshot({path:path.join(process.env.CS_SCREENSHOT_DIR,'contribution-focus.png')});
    await page.locator('#offer').fill('Synthetic learning experience');
    await page.locator('#availability').fill('One hour a month');
    await page.locator('#action-form button[type=submit]').click();
    assert.match(await page.locator('#community-status').textContent(),/Nothing was sent/);
    await page.reload();
    await page.locator('[data-action=apply]').first().waitFor();
    assert.doesNotMatch(await page.locator('#cs-main').textContent(),/Your application drafts/);
    pass('valid keyboard-focused contribution fields use forest focus; preview drafts remain truthful and reset on reload');

    await page.goto(base + '/dashboard.html');
    await page.locator('[data-action="tour-start"]').click();
    const tour = page.locator('[aria-label="Family walkthrough"]');
    await tour.waitFor({ state: 'visible' });
    assert.match(await tour.textContent(), /1 of 5/);
    for (let i = 0; i < 4; i++) await page.locator('[data-action="tour-next"]').click();
    assert.match(await tour.textContent(), /5 of 5/);
    await page.locator('[data-action="tour-next"]').click();
    assert.equal(await tour.count(), 0);
    pass('native browser walkthrough completes all five stops');

    for (const width of [390, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        for (const route of ['dashboard', 'matching', 'activities', 'pods', 'curriculum', 'apply', 'student']) {
            await page.goto(base + '/' + route + '.html');
            await page.locator('#cs-main h1').waitFor();
            assert.equal(await page.locator('.cs-header').count(), 1);
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, route + ' overflow at ' + width);
            assert.match(await page.locator('.cs-preview-note').textContent(), /Community demo.*Fictional families and activities/);
        }
        pass('all seven demo screens load and fit at ' + width + 'px');
    }
    await page.goto(base + '/dashboard.html');
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.locator('#cs-main [data-app-route="activities"]').first().click();
    await page.waitForFunction(() => location.pathname.endsWith('/activities.html'));
    assert.equal(await page.evaluate(() => scrollY), 0);
    await page.goBack();
    await page.waitForFunction(() => location.pathname.endsWith('/dashboard.html'));
    assert.equal(await page.evaluate(() => scrollY), 0);
    pass('demo navigation and browser Back start at the top');

    await page.goto(base + '/activities.html');
    await page.locator('[data-action="event-detail"][data-id="e1"]').click();
    await page.locator('#community-dialog').waitFor({ state: 'visible' });
    await page.locator('#ack').check();
    await page.locator('#action-form button[type="submit"]').click();
    assert.match(await page.locator('#community-status').textContent(), /No booking or message was sent/);
    await page.reload();
    await page.locator('[data-action="event-detail"][data-id="e1"]').waitFor();
    assert.match(await page.locator('[data-action="event-detail"][data-id="e1"]').textContent(), /View & join/);
    pass('demo joining is clearly simulated and resets on reload');

    for (const file of ['interest.html', 'admin.html', 'admin-reports.html', 'admin-venues.html', 'venue-management.html', 'report-incident.html', 'portfolio.html']) {
        await page.goto(base + '/' + file);
        assert.equal(await page.locator('form, input, textarea, script').count(), 0, file);
        assert.equal(await page.locator('a[href="/signup.html"]').count(), 1);
    }
    pass('deferred collection/reviewer pages have no forms or backend code');

    signedInForDemo = true;
    for (const [key,file] of [['contribution','apply.html'],['community','pods.html'],['learning','student.html'],['continuity','matching.html']]) {
        await page.goto(base + '/');await page.locator('[data-workspace='+key+']').click();
        assert.equal(await page.locator('#workspace-action').getAttribute('href'),file+'?demo=1');
        await page.locator('#workspace-action').click();await page.waitForURL('**/'+file+'?demo=1');
        await page.locator('#cs-main h1').waitFor();assert.equal(new URL(page.url()).pathname,'/'+file);
        if(key==='contribution'){assert.equal(await page.locator('[data-action=apply]').count(),3);assert.match(await page.locator('.cs-preview-note').innerText(),/Community demo/);await page.locator('.cs-appnav [data-app-route=dashboard]').click();await page.waitForURL('**/dashboard.html?demo=1');await page.reload();await page.locator('#cs-main h1').waitFor();assert.equal(new URL(page.url()).search,'?demo=1');await page.locator('.cs-appnav [data-app-route=apply]').click();await page.waitForURL('**/apply.html?demo=1');await page.locator('[data-action=apply]').first().waitFor();}
    }
    pass('signed-in visitors can explicitly explore contribution and other homepage demo paths without a member-home redirect');

    assert.deepEqual(unexpected, []);
    assert.deepEqual(errors, []);
    assert.deepEqual(missing, []);
    pass('homepage and demo load with mocked signed-out auth, no other external requests or browser/asset errors');
    console.log(`${passed} release browser checks passed; no backend writes.`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
    if (browser) await browser.close();
    server.close();
});
