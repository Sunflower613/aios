import test from 'node:test';
import assert from 'node:assert/strict';
import { PastureAudio } from './audio.mjs';

function context() {
  return {
    state: 'suspended', currentTime: 0, destination: {}, tones: 0,
    async resume() { this.state = 'running'; },
    async suspend() { this.state = 'suspended'; },
    async close() { this.state = 'closed'; },
    createGain() {
      return { connect() {}, disconnect() {}, gain: { value: 0, setValueAtTime(value) { this.value = value; }, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} } };
    },
    createOscillator() {
      this.tones++;
      return { frequency: { setValueAtTime() {} }, connect() {}, disconnect() {}, start() {}, stop() {} };
    }
  };
}

test('audio stays uninitialized until interaction and unavailable audio is harmless', async () => {
  let created = 0;
  const audio = new PastureAudio(() => { created++; throw Error('unsupported'); });
  audio.play('correct'); assert.equal(created, 0);
  await assert.doesNotReject(() => audio.unlock());
  assert.equal(created, 1); audio.dispose();
});

test('music and effects switches control independent outputs', async () => {
  const ctx = context(), audio = new PastureAudio(() => ctx);
  try {
    await audio.unlock(); assert.equal(audio.loop, null);
    audio.setMusic(true); assert.notEqual(audio.loop, null);
    audio.setEffects(false);
    const before = ctx.tones; audio.play('correct'); assert.equal(ctx.tones, before);
    assert.equal(audio.fx.gain.value, 0); assert.ok(audio.bgm.gain.value > 0);
    audio.setMusic(false); assert.equal(audio.loop, null); assert.equal(audio.bgm.gain.value, 0);
    audio.setEffects(true); audio.play('correct'); assert.equal(ctx.tones, before + 2);
  } finally { audio.dispose(); }
});

test('backgrounding silences both channels and halts music scheduling', async () => {
  const ctx = context(), audio = new PastureAudio(() => ctx);
  try {
    audio.setMusic(true); await audio.unlock();
    audio.setVisible(false);
    assert.equal(audio.fx.gain.value, 0); assert.equal(audio.bgm.gain.value, 0);
    assert.equal(audio.loop, null); assert.equal(ctx.state, 'suspended');
    const before = ctx.tones; audio.play('wrong'); assert.equal(ctx.tones, before);
    audio.setVisible(true); await audio.unlock();
    assert.equal(ctx.state, 'running'); assert.notEqual(audio.loop, null);
  } finally { audio.dispose(); }
});

test('fast drag effects are throttled without suppressing a cow confirmation', async () => {
  const ctx = context(), audio = new PastureAudio(() => ctx);
  try {
    await audio.unlock(); audio.play('mark'); audio.play('mark');
    assert.equal(ctx.tones, 1);
    audio.play('correct'); assert.equal(ctx.tones, 3);
    ctx.currentTime = 0.06; audio.play('mark'); assert.equal(ctx.tones, 4);
  } finally { audio.dispose(); }
});
