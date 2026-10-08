import test from 'node:test';
import assert from 'node:assert/strict';

// Exercise actual UI handlers, including pointer taps and the moment the result
// dialog opens, without depending on browser support for injected touch input.
test('last double-tapped cow renders before results; finished boards remain read-only for review', async t => {
  class Element {
    constructor() {
      this.listeners = {}; this.dataset = {}; this.children = []; this.attributes = {};
      this.textContent = ''; this.hidden = false; this.open = false;
      this.style = { setProperty() {} };
      this.classList = { add() {}, remove() {}, toggle() {} };
    }
    addEventListener(name, listener) { this.listeners[name] = listener; }
    setAttribute(name, value) { this.attributes[name] = value; }
    replaceChildren(...children) { this.children = children; }
    contains(element) { return this.children.includes(element); }
    closest() { return this; }
    focus() {}
    setPointerCapture() {}
    showModal() { this.open = true; this.onShow?.(); }
    close() { this.open = false; }
    click() { this.listeners.click(); }
  }
  const elements = new Map(), get = id => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id);
  };
  const easy = new Element(); easy.dataset.level = 'easy';
  const survival = new Element(); survival.dataset.mode = 'survival';
  const daily = new Element(); daily.dataset.mode = 'daily';
  const vibrations=[];
  const replacements = {
    navigator: { vibrate: pattern => { vibrations.push(pattern); return true; } },
    document: {
      getElementById: get, createElement: () => new Element(), body: new Element(),
      addEventListener() {}, elementFromPoint: x => get('board').children[x],
      querySelectorAll: query => query === '[data-level]' ? [easy] : query === '[data-mode]' ? [survival, daily] : [...elements.values()].filter(e => e.open),
    },
    window: { addEventListener() {} },
    localStorage: { getItem: key => key === 'find-cow-vibration' ? null : 'false', setItem() {} },
    Worker: class {
      postMessage(data) {
        const size = typeof data === 'number' ? data : 12;
        const cols = [...Array.from({length:size / 2}, (_, i) => i * 2 + 1), ...Array.from({length:size / 2}, (_, i) => i * 2)];
        this.puzzle = { size, regions: Array.from({length:size ** 2}, (_, i) => Math.floor(i / size)), solution: cols.map((col, row) => row * size + col) };
        queueMicrotask(() => this.onmessage({ data: this.puzzle }));
      }
      terminate() {}
    },
  };
  for (const [key, value] of Object.entries(replacements)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    t.after(() => original ? Object.defineProperty(globalThis, key, original) : delete globalThis[key]);
  }
  t.mock.timers.enable({ apis: ['setInterval'] });
  let stamp = 0;
  t.mock.method(performance, 'now', () => stamp);
  await import('./game.mjs');
  const answer = [1, 9, 17, 18, 26, 34];
  const tap = cell => {
    const event = { pointerType: 'touch', pointerId: 1, isPrimary: true, target: get('board').children[cell], clientX: cell, clientY: 0, preventDefault() {} };
    get('board').listeners.pointerdown(event); get('board').listeners.pointerup(event);
    get('board').listeners.lostpointercapture();
  };
  const snapshot = () => get('board').children.map(e => [e.textContent, e.className, e.disabled]);
  easy.click(); await Promise.resolve();
  tap(answer[0]);assert.equal(vibrations.at(-1),25);
  tap(answer[0]);assert.equal(vibrations.at(-1),50);
  for (const cell of answer.slice(0, -1)) { tap(cell); tap(cell); }
  const last = answer.at(-1); tap(last);
  assert.match(get('board').children[last].className, /excluded/);
  get('result-dialog').onShow = () => {
    assert.equal(get('board').children[last].textContent, '🐮');
    assert.ok(get('board').children.every(e => e.disabled));
  };
  tap(last);
  assert.equal(get('result-dialog').open, true);
  get('review').click(); assert.equal(get('result-dialog').open, false);
  assert.equal(get('review-tools').hidden, false);
  const won = snapshot(); tap(0); assert.deepEqual(snapshot(), won);
  assert.equal(get('game-tools').hidden, true);

  get('result-dialog').onShow = null;
  get('review-next').click(); await Promise.resolve();
  for (const cell of [0, 2, 3]) { tap(cell); tap(cell); }
  assert.equal(get('result-dialog').open, true);
  get('review').click();
  assert.equal(get('board').children.filter(e => e.textContent === '🐮').length, 6);
  const lost = snapshot(); tap(1); assert.deepEqual(snapshot(), lost);

  get('result-home').click(); survival.click(); await Promise.resolve();
  for (const cell of answer) { tap(cell); tap(cell); }
  assert.equal(get('again').textContent, '下一关');
  assert.equal(get('board').children.filter(e => e.textContent === '🐮').length, 6);
  get('review').click();
  assert.match(get('round').textContent, /第 1 关/);
  get('review-next').click(); await Promise.resolve();
  assert.match(get('round').textContent, /第 2 关/);
  assert.equal(get('review-tools').hidden, true);
  get('result-home').click(); daily.click(); await Promise.resolve();
  assert.equal(get('board').children.length, 144);
  assert.equal(get('timer').textContent, '03:00');
  assert.equal(get('hint').hidden, true);
  tap(0);
  stamp = 180000; t.mock.timers.tick(200);
  assert.equal(get('continue-daily').hidden, false);
  assert.equal(get('board').children.filter(e => e.textContent === '🐮').length, 0);
  assert.match(get('board').children[0].className, /excluded/);
  get('continue-daily').click();
  stamp = 190000; t.mock.timers.tick(200);
  assert.equal(get('timer').textContent, '03:10');
  assert.ok(get('board').children.every(e => !e.disabled));
  for (let row = 0; row < 12; row++) {
    const col = row < 6 ? row * 2 + 1 : (row - 6) * 2;
    tap(row * 12 + col); tap(row * 12 + col);
  }
  assert.equal(get('result-dialog').open, true);
  assert.equal(get('again').textContent, '再来一局');
  get('review').click();
  assert.equal(get('board').children.filter(e => e.textContent === '🐮').length, 12);
  assert.ok(get('board').children.every(e => e.disabled));
  get('result-home').click();
  assert.equal(get('daily-stars').hidden, false);
  assert.equal(get('daily-stars').textContent, '★★☆');
});
