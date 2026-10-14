const { JSDOM } = require('jsdom');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'signup.html'), 'utf8');
const ui = fs.readFileSync(path.join(root, 'js/public-account-ui.js'), 'utf8').replace('export function', 'function');
const entry = fs.readFileSync(path.join(root, 'js/public-account.js'), 'utf8')
    .replace(/^import .*;\n/, '').split("if (typeof document !== 'undefined')")[0]
    .replace('export async function', 'async function');
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
let passed = 0;
async function check(name, fn) {
    const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://example.invalid/signup.html' });
    const w = dom.window, d = w.document, get = id => d.getElementById(id), calls = [];
    let observer;
    const service = {
        ready: async () => {},
        observe: cb => { observer = cb; cb(null); },
        signup: async (...args) => { calls.push(['signup', ...args]); observer({ email: args[0] }); },
        login: async (...args) => { calls.push(['login', ...args]); observer({ email: args[0] }); },
        google: async () => { calls.push(['google']); },
        logout: async () => { calls.push(['logout']); observer(null); },
        reset: async email => { calls.push(['reset', email]); },
        remove: async () => { calls.push(['delete']); observer(null); }
    };
    w.eval(ui + '\n' + entry + ';window.bind=bindPublicAccount;window.start=startPublicAccount;');
    const submit = () => get('account-form').dispatchEvent(new w.Event('submit', { cancelable: true }));
    try {
        await fn({ w, d, get, calls, service, submit, observe: user => observer(user) });
        console.log('PASS ' + name); passed++;
    } finally { w.close(); }
}
(async () => {
    await check('blocked SDK reports failure and leaves controls disabled', async x => {
        await x.w.start(x.d, async () => { throw new Error('blocked'); }, 25);
        assert.match(x.get('account-status').textContent, /could not load/);
        assert.equal(x.get('reload-account').hidden, false);
        assert.equal(x.get('account-controls').disabled, true);
    });
    await check('late SDK resolution cannot enable a timed-out form', async x => {
        let release;
        const pending = new Promise(resolve => { release = resolve; });
        await x.w.start(x.d, () => pending, 5);
        release(x.service); await tick();
        assert.match(x.get('account-status').textContent, /could not load/);
        assert.equal(x.get('account-controls').disabled, true);
        x.submit(); assert.deepEqual(x.calls, []);
    });
    await check('late auth restoration cannot enable a timed-out form', async x => {
        let release;
        x.service.ready = () => new Promise(resolve => { release = resolve; });
        await x.w.start(x.d, async () => x.service, 5);
        release(); await tick();
        assert.equal(x.get('account-controls').disabled, true);
        assert.match(x.get('account-status').textContent, /could not load/);
    });
    await check('form cannot submit until initialization finishes', async x => {
        let release;
        x.service.ready = () => new Promise(resolve => { release = resolve; });
        const binding = x.w.bind(x.d, x.service);
        x.submit(); assert.deepEqual(x.calls, []);
        await tick(); release(); await binding;
        assert.equal(x.get('account-controls').disabled, false);
    });
    await check('existing-account login needs no signup consent or new password minimum', async x => {
        await x.w.bind(x.d, x.service);
        x.get('mode').value = 'login'; x.get('mode').dispatchEvent(new x.w.Event('change'));
        x.get('email').value = 'existing@example.invalid'; x.get('password').value = 'short';
        assert.equal(x.get('password').autocomplete, 'current-password');
        assert.equal(x.get('password').hasAttribute('minlength'), false);
        assert.equal(x.get('consent').required, false);
        x.submit(); await tick();
        assert.deepEqual(x.calls, [['login', 'existing@example.invalid', 'short']]);
    });
    await check('signup mode restores notice and new-password autocomplete', async x => {
        await x.w.bind(x.d, x.service);
        x.get('mode').value = 'login'; x.get('mode').dispatchEvent(new x.w.Event('change'));
        x.get('mode').value = 'signup'; x.get('mode').dispatchEvent(new x.w.Event('change'));
        assert.equal(x.get('consent').required, true);
        assert.equal(x.get('consent-row').hidden, false);
        assert.equal(x.get('password').autocomplete, 'new-password');
        assert.equal(x.get('password').minLength, 6);
        x.get('email').value = 'new@example.invalid'; x.get('password').value = 'valid-test-password';
        x.submit(); await tick(); assert.deepEqual(x.calls, []);
    });
    await check('Google login also needs acknowledgement because it can create an account', async x => {
        await x.w.bind(x.d, x.service);
        x.get('mode').value = 'login'; x.get('mode').dispatchEvent(new x.w.Event('change'));
        x.get('google').click(); assert.deepEqual(x.calls, []);
        assert.equal(x.get('consent-row').hidden, false);
        x.get('consent').checked = true; x.get('google').click(); await tick();
        assert.deepEqual(x.calls, [['google']]);
    });
    await check('reset is neutral when a user does not exist and does not need a password', async x => {
        await x.w.bind(x.d, x.service);
        x.service.reset = async () => { throw { code: 'auth/user-not-found' }; };
        x.get('email').value = 'absent@example.invalid';
        x.get('reset').click(); await tick();
        assert.match(x.get('account-status').textContent, /If this address/);
    });
    await check('cancel deletion does not call Firebase; recent-login failure preserves session', async x => {
        await x.w.bind(x.d, x.service); x.observe({ email: 'adult@example.invalid' });
        x.get('confirm-delete').click(); await tick(); assert.deepEqual(x.calls, []);
        x.get('delete-account').click(); x.get('cancel-delete').click();
        assert.equal(x.get('delete-confirm').hidden, true); assert.deepEqual(x.calls, []);
        x.service.remove = async () => { throw { code: 'auth/requires-recent-login' }; };
        x.get('delete-account').click(); x.get('confirm-delete').click(); await tick();
        assert.match(x.get('account-status').textContent, /sign out and sign in again/);
        assert.equal(x.get('signed-in').hidden, false);
    });
    await check('blocked Google popup gives a useful retry path', async x => {
        await x.w.bind(x.d, x.service); x.get('consent').checked = true;
        x.service.google = async () => { throw { code: 'auth/popup-blocked' }; };
        x.get('google').click(); await tick();
        assert.match(x.get('account-status').textContent, /Allow the popup/);
        assert.equal(x.get('account-controls').disabled, false);
    });
    for (const file of ['public-account.js', 'public-account-ui.js', 'public-account-service.js']) {
        assert.doesNotMatch(fs.readFileSync(path.join(root, 'js', file), 'utf8'), /(?:from\s*['"][^'"]*firestore|import\s*\([^)]*firebase-config|\b(?:setDoc|getDoc|addDoc)\s*\()/);
    }
    console.log(`${passed} additional authentication checks passed; mocked services.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
