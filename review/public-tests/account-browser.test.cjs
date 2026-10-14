const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');

// Real Chromium, but synthetic Firebase modules: no production accounts, reset
// emails, database requests, or account deletions are sent by this suite.
const firebaseApp = 'export function initializeApp(config) { return { config }; }';
const firebaseAuth = `
let user = JSON.parse(sessionStorage.getItem('cs-test-user') || 'null');
const observers = [];
const auth = { get currentUser() { return user; }, authStateReady: async () => {} };
const emit = value => { user = value; sessionStorage.setItem('cs-test-user', JSON.stringify(value)); observers.forEach(cb => cb(value)); };
window.accountCalls = [];
export function getAuth() { return auth; }
export class GoogleAuthProvider { setCustomParameters() {} }
export function onAuthStateChanged(auth, cb) { observers.push(cb); queueMicrotask(() => cb(user)); return () => {}; }
export async function createUserWithEmailAndPassword(auth, email) { window.accountCalls.push('signup'); emit({ email }); }
export async function signInWithEmailAndPassword(auth, email) { window.accountCalls.push('login'); emit({ email }); }
export async function signInWithPopup() {
    if (!navigator.userActivation.isActive) throw new Error('Lost browser click gesture');
    window.accountCalls.push('google'); emit({ email: 'google@example.invalid' });
}
export async function signOut() { window.accountCalls.push('logout'); emit(null); }
export async function sendPasswordResetEmail() { window.accountCalls.push('reset'); }
export async function deleteUser() { window.accountCalls.push('delete'); emit(null); }
`;
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
let browser;
let passed = 0;
const pass = message => { console.log('PASS ' + message); passed++; };
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true });
    const context = await browser.newContext();
    const external = [], errors = [], missing = [];
    await context.route('**/*', async route => {
        const url = route.request().url();
        if (url === 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js') return route.fulfill({ contentType: 'text/javascript', body: firebaseApp });
        if (url === 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js') return route.fulfill({ contentType: 'text/javascript', body: firebaseAuth });
        if (url.startsWith(base + '/')) return route.continue();
        external.push(url); return route.abort();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) missing.push(response.url()); });
    for (const route of ['/signup.html', '/login.html', '/profile.html', '/account/signup.html', '/account/login.html', '/account/profile.html']) {
        await page.goto(base + route);
        await page.waitForFunction(() => !document.getElementById('account-controls').disabled);
        assert.equal(await page.locator('#mode').inputValue(), route.endsWith('signup.html') ? 'signup' : 'login');
        pass('account route loads: ' + route);
    }
    await page.goto(base + '/signup.html');
    await page.waitForFunction(() => !document.getElementById('account-controls').disabled);
    await page.locator('#email').fill('adult@example.invalid');
    await page.locator('#password').fill('synthetic-password');
    await page.locator('#submit-account').click();
    assert.deepEqual(await page.evaluate(() => window.accountCalls), []);
    await page.locator('#consent').check();
    await page.locator('#submit-account').click();
    await page.locator('#signed-in').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#identity').textContent(), 'adult@example.invalid');
    assert.equal(await page.locator('#password').inputValue(), '');
    await page.reload();
    await page.locator('#signed-in').waitFor({ state: 'visible' });
    await page.locator('#logout').click();
    await page.locator('#signed-out').waitFor({ state: 'visible' });
    pass('browser signup validation, restored session, cleared password and logout');

    await page.locator('#mode').selectOption('login');
    await page.locator('#email').fill('adult@example.invalid');
    await page.locator('#reset').click();
    await page.waitForFunction(() => document.getElementById('account-status').textContent.includes('If this address'));
    await page.locator('#password').fill('existing-password');
    await page.locator('#submit-account').click();
    await page.locator('#signed-in').waitFor({ state: 'visible' });
    await page.locator('#delete-account').click();
    assert.equal(await page.locator('#cancel-delete').evaluate(el => el === document.activeElement), true);
    await page.locator('#cancel-delete').click();
    assert.equal((await page.evaluate(() => window.accountCalls)).includes('delete'), false);
    await page.locator('#delete-account').click();
    await page.locator('#confirm-delete').click();
    await page.locator('#signed-out').waitFor({ state: 'visible' });
    assert.equal((await page.evaluate(() => window.accountCalls)).filter(call => call === 'delete').length, 1);
    pass('browser email login, password reset and explicit deletion confirmation');

    await page.locator('#google').click();
    await page.locator('#consent').check();
    await page.locator('#google').click();
    await page.locator('#signed-in').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#identity').textContent(), 'google@example.invalid');
    await page.locator('#logout').click();
    pass('Google action preserves the actual browser click gesture');

    for (const width of [320, 390, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(base + '/signup.html');
        await page.waitForFunction(() => !document.getElementById('account-controls').disabled);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        assert.equal(await page.locator('#google').evaluate(el => el.getBoundingClientRect().height >= 44), true);
        if (process.env.CS_SCREENSHOT_DIR) {
            fs.mkdirSync(process.env.CS_SCREENSHOT_DIR, { recursive: true });
            await page.screenshot({ path: path.join(process.env.CS_SCREENSHOT_DIR, 'account-' + width + '.png'), fullPage: true });
        }
        pass('account layout and touch target sizes at ' + width + 'px');
    }
    await page.goto(base + '/account-notice.html');
    assert.match(await page.locator('h1').textContent(), /Adult account notice/);
    assert.deepEqual(external, []); assert.deepEqual(errors, []); assert.deepEqual(missing, []);
    pass('notice and account assets load without unexpected network requests or browser errors');

    const blocked = await browser.newContext();
    await blocked.route('https://www.gstatic.com/**', route => route.abort());
    const blockedPage = await blocked.newPage();
    await blockedPage.goto(base + '/login.html');
    await blockedPage.locator('#reload-account').waitFor({ state: 'visible' });
    assert.match(await blockedPage.locator('#account-status').textContent(), /could not load/);
    assert.equal(await blockedPage.locator('#submit-account').isDisabled(), true);
    pass('blocked Firebase SDK gives recovery instructions in the browser');
    console.log(`${passed} Chromium checks passed; Firebase was mocked throughout.`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
    if (browser) await browser.close();
    server.close();
});
