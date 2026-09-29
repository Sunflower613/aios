import test from 'node:test';
import assert from 'node:assert/strict';

// Minimal DOM adapter keeps interval lifecycle tests independent of a browser.
class Element {
  constructor() {
    this.listeners = {};
    this.attributes = {};
    this.style = {};
    this.dataset = {};
    this.children = [];
    this.textContent = '';
    this.classList = { add() {}, remove() {} };
  }
  addEventListener(name, listener) { this.listeners[name] = listener; }
  setAttribute(name, value) { this.attributes[name] = value; }
  replaceChildren(...children) { this.children = children; }
  scrollIntoView() {}
  click() { return this.listeners.click(); }
}

test('auto makes one action per second, pauses, and clears timers on restart/difficulty/end', async context => {
  const elements = new Map();
  const get = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
  const originalDocument = globalThis.document;
  globalThis.document = { getElementById: get, createElement: () => new Element() };
  context.after(() => { globalThis.document = originalDocument; });
  get('difficulty').value = 'easy';
  get('mode').value = 'random';
  get('log-panel').hidden = true;
  let seed = 42;
  context.mock.method(Math, 'random', () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; });
  context.mock.timers.enable({ apis: ['setInterval', 'Date'] });
  await import('./game.mjs');
  const board = () => get('board').children.map(b => `${b.className}:${b.textContent}`).join('|');
  get('auto').click();
  const untouched = board();
  context.mock.timers.tick(999);
  assert.equal(board(), untouched);
  context.mock.timers.tick(1);
  assert.notEqual(board(), untouched);
  const first = board();
  get('assist').click();
  assert.equal(get('assist').attributes['aria-pressed'], 'true');
  assert.ok(get('board').children.some(b => String(b.textContent).includes('%')));
  get('assist').click();
  assert.equal(board(), first);
  context.mock.timers.tick(999);
  assert.equal(board(), first);
  context.mock.timers.tick(1);
  assert.notEqual(board(), first);
  get('auto').click();
  const paused = board();
  context.mock.timers.tick(5000);
  assert.equal(board(), paused);
  get('auto').click();
  get('restart').click();
  const reset = board();
  context.mock.timers.tick(3000);
  assert.equal(board(), reset);
  assert.equal(get('timer').textContent, '000');
  assert.equal(get('auto').attributes['aria-pressed'], 'false');
  get('auto').click();
  get('difficulty').value = 'hard';
  get('difficulty').listeners.change();
  assert.equal(get('board').children.length, 480);
  const hard = board();
  context.mock.timers.tick(3000);
  assert.equal(board(), hard);
  get('difficulty').value = 'easy';
  get('difficulty').listeners.change();
  get('auto').click();
  for (let i = 0; i < 200 && get('auto').attributes['aria-pressed'] === 'true'; i++) context.mock.timers.tick(1000);
  assert.equal(get('auto').attributes['aria-pressed'], 'false');
  assert.ok(!get('status').textContent.includes('踩到地雷'));
  const ended = board();
  context.mock.timers.tick(3000);
  assert.equal(board(), ended);
  // Instant solve consumes no fake-clock time, and repeated solves at a dead
  // end cannot mutate the board or start a delayed operation.
  get('restart').click();
  const beforeSolve = Date.now();
  await get('solve').click();
  assert.equal(Date.now(), beforeSolve);
  assert.ok(!get('status').textContent.includes('踩到地雷'));
  const solved = board();
  get('log-toggle').click();
  assert.equal(get('log-panel').hidden, false);
  assert.equal(get('log-toggle').attributes['aria-expanded'], 'true');
  const entries = get('log-list').children.map(item => item.textContent);
  assert.ok(entries.some(text => /一键解题 · .*（\d+ 行 \d+ 列）/.test(text)));
  assert.ok(entries.some(text => text.startsWith('第 1 局')));
  get('log-toggle').click();
  assert.equal(get('log-panel').hidden, true);
  assert.equal(board(), solved);
  await get('solve').click();
  assert.equal(board(), solved);
  context.mock.timers.tick(3000);
  assert.equal(board(), solved);
  get('restart').click();
  get('auto').click();
  get('mode').value = 'no-guess';
  get('mode').listeners.change();
  assert.equal(get('auto').attributes['aria-pressed'], 'false');
  const fresh = board();
  // Reset while asynchronous validation is pending must discard its result.
  const pending = get('solve').click();
  assert.equal(get('solve').disabled, true);
  get('restart').click();
  await pending;
  assert.equal(board(), fresh);
  assert.equal(get('timer').textContent, '000');
  assert.equal(get('solve').disabled, false);
  // No-guess instant solve must reach a win, even with a manual misflag.
  get('board').children[1].listeners.contextmenu({ preventDefault() {} });
  await get('solve').click();
  assert.ok(get('status').textContent.startsWith('恭喜'));
  assert.equal(get('solve').disabled, true);
  const won = board(), time = get('timer').textContent;
  context.mock.timers.tick(3000);
  assert.equal(board(), won);
  assert.equal(get('timer').textContent, time);
});
