const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium, webkit } = require('playwright-core');
const { firebaseApp, firebaseFirestore, firebaseSignedOutAuth } = require('./firebase-browser-fixtures.cjs');

const root = path.resolve(__dirname, '../..');
const baseline = process.env.CS_HOMEPAGE_BASELINE;
const engine = process.env.CS_BROWSER_ENGINE || 'chromium';
assert.ok(['chromium', 'webkit'].includes(engine));
const mime = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
    '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
};
const server = http.createServer((request, response) => {
    const { pathname, searchParams } = new URL(request.url, 'http://localhost');
    const route = pathname === '/' ? '/index.html' : pathname;
    let file = path.resolve(root, '.' + route);
    if (!file.startsWith(root + path.sep)) {
        response.writeHead(404).end();
        return;
    }
    if (baseline && (searchParams.has('baseline') && route === '/index.html'
        || route === '/css/editorial-home.css' && searchParams.get('v') === 'mobile-spacing-20261125')) {
        file = path.join(baseline, 'readability-served-' + path.basename(file));
    }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        response.writeHead(404).end();
        return;
    }
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
});

async function checkCentered(locator) {
    const geometry = await locator.evaluate(control => {
        const bounds = control.getBoundingClientRect();
        const walker = document.createTreeWalker(control, NodeFilter.SHOW_TEXT);
        const lines = [];
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            if (node.parentElement.closest('svg,[aria-hidden="true"]')) continue;
            const text = node.textContent;
            if (!text.trim()) continue;
            const range = document.createRange();
            range.setStart(node, text.length - text.trimStart().length);
            range.setEnd(node, text.trimEnd().length);
            for (const rect of range.getClientRects()) {
                if (rect.width) lines.push({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom });
            }
        }
        const icon = control.querySelector('.cs-entry-cue');
        const iconBox = icon?.getBoundingClientRect();
        return {
            label: control.textContent.trim(), lines,
            bounds: { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom },
            icon: iconBox ? { left: iconBox.left, right: iconBox.right, top: iconBox.top, bottom: iconBox.bottom } : null,
        };
    });
    const { bounds, lines, label, icon } = geometry;
    assert.ok(lines.length, label);
    for (const line of lines) {
        assert.ok(Math.abs(line.left + line.right - bounds.left - bounds.right) <= 3, label + ' text is off center');
        assert.ok(line.left >= bounds.left && line.right <= bounds.right &&
            line.top >= bounds.top && line.bottom <= bounds.bottom, label + ' text clips');
        if (icon && line.bottom > icon.top && line.top < icon.bottom) {
            assert.ok(line.right + 2 <= icon.left, label + ' collides with the door icon');
        }
    }
    if (icon) assert.ok(icon.right < bounds.right && icon.left > bounds.left, label + ' icon clips');
}

const smallerText = [
    '.hero-actions .button', '.editorial-photo figcaption', '.activity-panel p', '.activity-meta',
    '[data-activity]', '.workspace-head .demo-label', '.demo-card p', '[data-role]',
    '#participate-action small', '.faq summary', '.footer p',
];
const headings = ['h1', '.editorial-prose h2', '.editorial-human h2', '.learning-copy h2', '.join-head h2'];
const compactSpaces = [
    ['.editorial-learning', 'paddingTop'], ['.activity-meta', 'marginTop'], ['.activity-meta', 'paddingTop'],
    ['.editorial-learning > .photo-reveal', 'marginTop'], ['.editorial-human', 'marginTop'],
    ['.editorial-human', 'paddingTop'], ['#experience', 'paddingBottom'],
    ['#experience + .editorial-neighborhood', 'marginTop'], ['#participate', 'paddingTop'],
    ['#questions', 'paddingBottom'], ['.hero-photo-window', 'aspectRatio'],
];

async function metrics(page) {
    return page.evaluate(({ smallerText, headings, compactSpaces }) => {
        const style = (selector, property) => getComputedStyle(document.querySelector(selector))[property];
        return {
            text: smallerText.map(selector => parseFloat(style(selector, 'fontSize'))),
            headings: headings.map(selector => style(selector, 'fontSize')),
            spaces: compactSpaces.map(([selector, property]) => style(selector, property)),
        };
    }, { smallerText, headings, compactSpaces });
}

let browser;
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    const browserType = engine === 'webkit' ? webkit : chromium;
    const executablePath = engine === 'webkit' ? process.env.WEBKIT_PATH : process.env.CHROMIUM_PATH;
    browser = await browserType.launch({ executablePath, headless: true });
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const sdk = {
        'firebase-app.js': firebaseApp, 'firebase-auth.js': firebaseSignedOutAuth,
        'firebase-firestore.js': firebaseFirestore,
    };
    await context.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.origin === base && route.request().method() === 'GET') return route.continue();
        const module = sdk[url.pathname.split('/').at(-1)];
        if (url.hostname === 'www.gstatic.com' && module) {
            return route.fulfill({ contentType: 'text/javascript', body: module });
        }
        return route.abort();
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [320, 390, 430, 700, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        let before;
        if (baseline) {
            await page.goto(base + '/?baseline=1');
            before = await metrics(page);
        }
        await page.goto(base + '/');
        if (before) {
            const after = await metrics(page);
            assert.deepEqual(after.headings, before.headings);
            assert.deepEqual(after.spaces, before.spaces);
            if (width <= 700) {
                after.text.forEach((size, index) => assert.equal(size, before.text[index] + 2, smallerText[index]));
            }
        }
        assert.equal(await page.locator('.hero-photo-window img').evaluate(img => getComputedStyle(img).transform), 'none');
        const technology = page.locator('.technology-note');
        await technology.waitFor();
        assert.match(await technology.textContent(), /Planned: AI-assisted testing and homework.*age and readiness.*adult supervision/);
        assert.equal(await technology.evaluate(element => {
            const style = getComputedStyle(element);
            return element.tagName === 'P' && element.tabIndex === -1 &&
                !element.closest('a,button,[role="button"]') && style.borderTopWidth === '0px' &&
                style.borderTopLeftRadius === '0px' && style.boxShadow === 'none' &&
                style.backgroundColor === 'rgba(0, 0, 0, 0)' && style.cursor !== 'pointer';
        }), true);
        for (const selector of ['.hero-actions a', '.editorial-actions a', '[data-activity]', '[data-role]']) {
            for (const control of await page.locator(selector).all()) await checkCentered(control);
        }
        const hero = page.getByRole('link', { name: 'Create a family profile' });
        await hero.press('Tab');
        await hero.focus();
        assert.equal(await hero.evaluate(el => el.matches(':focus-visible')), true);
        assert.equal(await hero.locator('.cs-entry-cue').evaluate(el => getComputedStyle(el).opacity), '1');
        await checkCentered(hero);
        await page.locator('[data-activity=make]').press('Space');
        assert.equal(await page.locator('[data-activity=make]').getAttribute('aria-pressed'), 'true');

        const disclosure = page.locator('.editorial-demo > summary');
        await checkCentered(disclosure);
        await disclosure.press('Enter');
        assert.equal(await disclosure.evaluate(el => el.parentElement.open), true);
        for (const tab of await page.locator('[data-workspace]').all()) await checkCentered(tab);
        const workspaceAction = page.locator('#workspace-action');
        for (const [key, target] of [
            ['learning', 'student.html?demo=1'], ['continuity', 'matching.html?demo=1'],
            ['contribution', '/contributions.html'], ['community', 'pods.html?demo=1'],
        ]) {
            const tab = page.locator('[data-workspace=' + key + ']');
            await tab.press('Space');
            assert.equal(await tab.getAttribute('aria-pressed'), 'true');
            assert.equal(await workspaceAction.getAttribute('href'), target);
            await workspaceAction.hover();
            await checkCentered(workspaceAction);
        }
        for (const [role, target] of [['educator', '/contributions.html'], ['supporter', '/contributions.html'], ['family', '/signup.html']]) {
            const tab = page.locator('[data-role=' + role + ']');
            await tab.click();
            assert.equal(await tab.getAttribute('aria-pressed'), 'true');
            const link = page.locator('#participate-action');
            assert.equal(await link.getAttribute('href'), target);
            await checkCentered(link);
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        const screenshots = process.env.CS_READABILITY_SCREENS;
        if (screenshots && [390, 1440].includes(width)) {
            fs.mkdirSync(screenshots, { recursive: true });
            for (const [name, locator] of [
                ['hero', page.locator('.editorial-hero')], ['technology', page.locator('.editorial-human')],
                ['demo', page.locator('#experience')], ['roles', page.locator('#participate')],
            ]) {
                await locator.screenshot({ path: path.join(screenshots, engine + '-' + name + '-' + width + '.png') });
            }
        }
        await workspaceAction.click();
        await page.waitForURL(base + '/pods.html?demo=1');
        await page.goto(base + '/');
        await hero.press('Enter');
        await page.waitForURL(base + '/signup.html');
        console.log('PASS ' + engine + ' homepage and embedded demo at ' + width + ' CSS px');
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(base + '/');
        const photo = page.locator('.hero-photo-window');
        await photo.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
        await page.waitForFunction(() => document.querySelector('.hero-photo-window').style.getPropertyValue('--photo-offset'));
        const initial = await photo.evaluate(el => el.style.getPropertyValue('--photo-offset'));
        await page.evaluate(() => scrollBy({ top: 90, behavior: 'instant' }));
        await page.waitForFunction(before => {
            const offset = document.querySelector('.hero-photo-window').style.getPropertyValue('--photo-offset');
            return offset && offset !== before;
        }, initial);
        console.log('PASS ' + engine + ' hero still responds to scroll at ' + width + ' CSS px');
    }
    assert.deepEqual(errors, []);
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
}).finally(async () => {
    await browser?.close();
    server.close();
});
