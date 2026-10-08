import test from 'node:test';
import assert from 'node:assert/strict';
import { TouchInput } from './touch.mjs';

function setup() {
  const calls = []; let stamp = 0;
  const input = new TouchInput((cell, action) => calls.push([cell, action]), () => stamp);
  return { input, calls, time: value => { stamp = value; }, tap: cell => { input.begin(1, cell, cell * 30 + 15, 15); input.end(1, cell); } };
}
test('single tap excludes and rapid second tap confirms a cow only on the same cell', () => {
  const s = setup(); s.tap(1); s.time(200); s.tap(1);
  assert.deepEqual(s.calls, [[1, 'toggle'], [1, 'cow']]);
  s.time(210); s.tap(2); s.time(250); s.tap(3);
  assert.deepEqual(s.calls.slice(2), [[2, 'toggle'], [3, 'toggle']]);
});
test('two separated taps toggle exclusion twice instead of confirming', () => {
  const s = setup(); s.tap(1); s.time(500); s.tap(1);
  assert.deepEqual(s.calls, [[1, 'toggle'], [1, 'toggle']]);
});
test('fast swipes include crossed cells once, with no confirmation on lift', () => {
  const s = setup(); const at = x => x >= 0 && x < 180 ? Math.floor(x / 30) : null;
  s.input.begin(1, 0, 15, 15); s.input.move(1, 165, 15, at);
  s.input.move(1, 15, 15, at); s.input.end(1, 0);
  assert.deepEqual(s.calls, Array.from({length:6}, (_, i) => [i, 'exclude']));
  s.time(50); s.tap(0); assert.deepEqual(s.calls.at(-1), [0, 'toggle']);
});
test('cancelled gestures, a different pointer and releases outside the board do not mark cows', () => {
  const s = setup(); s.tap(0); s.input.reset(); s.time(50); s.tap(0);
  assert.deepEqual(s.calls, [[0, 'toggle'], [0, 'toggle']]);
  s.input.begin(1, 3, 100, 15); s.input.end(2, 3);
  assert.equal(s.calls.length, 2); s.input.end(1, null); assert.equal(s.calls.length, 2);
});
test('a timeout during a swipe may cancel the gesture without crashing', () => {
  let input;
  input = new TouchInput(() => input.reset(), () => 0);
  input.begin(1, 0, 0, 0);
  assert.doesNotThrow(() => input.move(1, 50, 0, () => 1));
  assert.equal(input.gesture, null);
});
