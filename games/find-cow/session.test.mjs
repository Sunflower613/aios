import test from 'node:test';
import assert from 'node:assert/strict';
import { Session, CHALLENGE_MS } from './session.mjs';

const board = (lives = 3, size = 6, state = 'won') => ({ lives, state, found: new Set(Array.from({ length: size }, (_, i) => i)) });

test('classic sizes and completion stop the run and timer', () => {
  for (const [level, size] of [['easy', 6], ['medium', 8], ['hard', 10]]) {
    const run = new Session('classic', level); assert.equal(run.size, size);
    run.resume(100); assert.equal(run.finishBoard(board(3, size), 2100), 'end');
    assert.equal(run.state, 'won'); assert.equal(run.cows, size);
    assert.equal(run.duration(9000), 2000);
  }
});

test('timed runs retain countdown across boards but pause while generating', () => {
  const run = new Session('timed'); assert.equal(run.size, 8);
  run.resume(0);
  const first = board(1, 8);
  assert.equal(run.finishBoard(first, 25_000), 'next');
  assert.equal(run.lives, 3); assert.equal(run.completed, 1);
  assert.equal(run.finishBoard(first, 26_000), 'ignored');
  assert.equal(run.remaining(80_000), CHALLENGE_MS - 25_000);
  run.resume(80_000);
  assert.equal(run.remaining(90_000), 145_000);
  assert.equal(run.expire(234_999), false);
  assert.equal(run.expire(235_000), true);
  assert.equal(run.state, 'timeout'); assert.equal(run.remaining(999_999), 0);
  assert.equal(run.finishBoard(board(3, 8), 235_000), 'ignored');
});

test('survival carries hearts between stages, raises size, and ends on loss', () => {
  const run = new Session('survival');
  for (let i = 0; i < 6; i++) {
    assert.equal(run.size, i < 2 ? 6 : i < 5 ? 8 : 10);
    run.resume(i * 1000);
    assert.equal(run.finishBoard(board(2, run.size), i * 1000 + 900), 'next');
    assert.equal(run.lives, 2);
  }
  assert.equal(run.completed, 6); assert.equal(run.cows, 46);
  assert.equal(run.finishBoard(board(0, 2, 'lost'), 7000), 'end');
  assert.equal(run.state, 'lost'); assert.equal(run.cows, 48);
  assert.equal(run.completed, 6);
});

test('a deadline cannot be bypassed by submitting a win at the deadline', () => {
  const run = new Session('timed'); run.resume(0);
  assert.equal(run.finishBoard(board(3, 8), CHALLENGE_MS), 'end');
  assert.equal(run.completed, 0); assert.equal(run.state, 'timeout');
});

test('a delayed browser tick still reports exactly three minutes at timeout', () => {
  const run = new Session('timed'); run.resume(0);
  assert.equal(run.expire(CHALLENGE_MS + 15_000), true);
  assert.equal(run.duration(CHALLENGE_MS + 30_000), CHALLENGE_MS);
});
