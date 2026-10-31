import test from 'node:test';
import assert from 'node:assert/strict';
import { Transport } from './transport.mjs';

function setup() {
  const audio = { currentTime: 0, duration: 100, paused: true, playCount: 0,
    play() { this.paused = false; this.playCount++; return Promise.resolve(); }, pause() { this.paused = true; } };
  const pending = new Map(); let id = 0;
  const timers = { setTimeout(fn) { pending.set(++id, fn); return id; }, clearTimeout(key) { pending.delete(key); } };
  return { audio, pending, transport: new Transport(audio, timers) };
}
test('gates pause at the next lyric without skipping any part of the audio', async () => {
  const { audio, transport } = setup();
  transport.seek(2); transport.play(3, 1); await Promise.resolve();
  audio.currentTime = 3.008; transport.checkGate();
  assert.equal(audio.paused, true); assert.equal(audio.currentTime, 3);
  transport.play(4, 1.5); await Promise.resolve();
  assert.equal(audio.currentTime, 3); assert.equal(audio.paused, false);
});
test('changing speed retains a single stream, its current position, and pitch preservation', async () => {
  const { audio, transport, pending } = setup();
  transport.play(3, 1); await Promise.resolve(); audio.currentTime = .5;
  transport.play(4, 2); await Promise.resolve();
  assert.equal(transport.audio, audio); assert.equal(audio.currentTime, .5);
  assert.equal(audio.playbackRate, 2); assert.equal(audio.preservesPitch, true); assert.equal(pending.size, 1);
});
test('manual pause cancels gate scheduling and resume continues at the same position', async () => {
  const { audio, transport, pending } = setup(); transport.play(20); await Promise.resolve();
  audio.currentTime = 7; transport.pause(); assert.equal(pending.size, 0);
  transport.play(20); await Promise.resolve(); assert.equal(audio.currentTime, 7);
});
test('a paused stale play promise cannot resurrect a timer', async () => {
  const { audio, transport, pending } = setup(); let resolve;
  audio.play = () => new Promise(r => resolve = r);
  transport.play(20); transport.pause(); resolve(); await Promise.resolve();
  assert.equal(pending.size, 0); assert.equal(audio.paused, true);
});
