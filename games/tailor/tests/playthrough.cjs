// Run against a server rooted at the repository root. Requires Playwright.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const path = require('node:path');
const os = require('node:os');

(async () => {
    const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    try {
        const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const base = process.env.TAILOR_URL || 'http://127.0.0.1:8765/games/tailor/';
        await page.addInitScript(() => localStorage.setItem('lets_tailor_prologue_read', 'true'));
        await page.goto(base + 'tailor.html', { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => !!window.tailorApp);
        const initial = await page.evaluate(() => JSON.stringify(tailorStore.currentDress.mannequin));
        assert.equal(await page.evaluate(() => tailorStore.currentDress.cutting.accuracy), 0);
        await page.screenshot({ path: path.join(os.tmpdir(), 'tailor-workshop.png') });
        await page.click('#btnNextStep');
        await page.click('[title="鼠尾草淡绿"]');
        await page.click('#btnNextStep');
        await page.waitForTimeout(150);
        assert.equal(await page.evaluate(() => JSON.stringify(tailorStore.currentDress.mannequin)), initial, 'Entering cutting must preserve shape');
        assert.equal(await page.isDisabled('#btnNextStep'), true);
        const points = await page.evaluate(() => {
            const ws = tailorApp.cuttingWs;
            const rect = ws.canvas.getBoundingClientRect();
            return ws.contourSlices.map(s => ({ x: rect.left + s.targetX / ws.canvas.width * rect.width, y: rect.top + s.y / ws.canvas.height * rect.height }));
        });
        await page.mouse.move(points[0].x, points[0].y);
        await page.mouse.down();
        for (const p of points.slice(1)) await page.mouse.move(p.x, p.y, { steps: 2 });
        await page.mouse.up();
        await page.click('#btnActionUnfold');
        await page.waitForTimeout(800);
        const cutting = await page.evaluate(() => tailorStore.currentDress.cutting);
        assert.ok(cutting.completed && cutting.accuracy >= 85, JSON.stringify(cutting));
        await page.screenshot({ path: path.join(os.tmpdir(), 'tailor-cutting.png') });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(150);
        assert.equal(await page.evaluate(() => tailorStore.currentDress.cutting.accuracy), cutting.accuracy);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(350);
        assert.equal(await page.evaluate(() => tailorStore.currentStep), 2);
        assert.equal(await page.evaluate(() => tailorStore.currentDress.cutting.accuracy), cutting.accuracy);
        await page.click('#btnNextStep');
        await page.waitForTimeout(150);
        assert.equal(await page.isDisabled('#btnNextStep'), true);
        await page.focus('#btnSewingPedal');
        await page.keyboard.down('Space');
        await page.waitForTimeout(400);
        assert.ok(await page.evaluate(() => tailorApp.sewingWs.isPedalDown && tailorApp.sewingWs.sewProgress > 0));
        await page.keyboard.up('Space');
        assert.equal(await page.evaluate(() => tailorApp.sewingWs.isPedalDown), false);
        await page.click('#btnResetSewing');
        assert.equal(await page.evaluate(() => tailorApp.sewingWs.sewSpeed), 0);
        // Deterministic simulation compares held pedal with controlled speed, at 60 and 120 Hz.
        const scores = await page.evaluate(() => {
            const ws = tailorApp.sewingWs;
            const simulate = (controlled, dt) => {
                ws.resetWorkspace();
                let ticks = 0;
                while (ws.sewProgress < 100 && ticks++ < 20000) {
                    ws.isPedalDown = controlled ? ws.sewSpeed < ws.targetSpeed() : true;
                    ws.update(dt);
                }
                return { score: ws.accuracyScore, seconds: ticks * dt, completed: tailorStore.currentDress.sewing.completed };
            };
            return { held: simulate(false, 1 / 60), controlled: simulate(true, 1 / 60), fastDisplay: simulate(true, 1 / 120) };
        });
        assert.ok(scores.controlled.completed);
        assert.ok(scores.controlled.score > scores.held.score + 20, JSON.stringify(scores));
        assert.ok(Math.abs(scores.controlled.seconds - scores.fastDisplay.seconds) < .2);
        await page.screenshot({ path: path.join(os.tmpdir(), 'tailor-mobile.png') });
        await page.click('#btnNextStep');
        const id = await page.evaluate(() => tailorStore.currentDress.id);
        await page.click('#btnFinishDress');
        await page.waitForURL('**/runway.html');
        assert.equal(await page.evaluate(() => tailorStore.currentDress.id), id);
        await page.click('#btnBackToTailor');
        await page.waitForURL('**/tailor.html');
        assert.equal(await page.evaluate(() => tailorStore.currentDress.id), id);
        await page.click('#btnFinishDress');
        await page.waitForURL('**/runway.html');
        await page.click('#btnAuction');
        await page.waitForURL('**/auction.html');
        assert.equal(await page.evaluate(() => tailorStore.currentDress.id), id);
        await page.click('#btnHammer');
        const coins = await page.evaluate(() => tailorStore.state.coins);
        assert.equal(await page.evaluate(() => tailorStore.settleDress(tailorStore.currentDress, 9999)), false);
        assert.equal(await page.evaluate(() => tailorStore.state.coins), coins);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForURL('**/tailor.html');
        assert.equal(await page.evaluate(() => tailorStore.state.coins), coins);
        assert.notEqual(await page.evaluate(() => tailorStore.currentDress.id), id);
        assert.equal(await page.evaluate(() => tailorStore.currentDress.cutting.completed), false);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        assert.deepEqual(errors, []);
        console.log('PASS: shape preservation, tracing, resize/reload, sewing skill/FPS, runway roundtrip, single settlement', scores);
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
