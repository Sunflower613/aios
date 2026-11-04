import test from 'node:test';
import assert from 'node:assert/strict';
import { yrcChart } from './device-library.mjs';
test('browser YRC preserves repeated character onsets and sustained sentence tails', () => {
  const chart = yrcChart('[0,2000](0,200,0)哈(200,1600,0)哈', 3, 'hash');
  assert.deepEqual(chart.words.map(w => [w.char,w.start,w.end]), [['哈',0,.2],['哈',.2,1.8]]);
  assert.equal(chart.audioSha256,'hash'); assert.deepEqual(chart.beats,[]);
});
test('browser YRC rejects pseudo-word timing, empty charts, zero lengths and out-of-audio timestamps', () => {
  for (const text of ['[0,1000](0,1000,0)你好','[0,1000](0,0,0)好','[0,4000](0,4000,0)好','[0,1000](0,500,0)有限公司']) assert.throws(() => yrcChart(text, 3, 'hash'));
});

test('known malformed line is repaired once for its exact recording, preserving manual edits', async () => {
  const { repairKnownTiming } = await import('./timing-corrections.mjs');
  const { default: fixes } = await import('./timing-corrections.json', { with: { type: 'json' } });
  const fix = fixes[0];
  const chart = { audioSha256: fix.audioSha256, lines: [{ text: fix.text, time: 207.35 }],
    words: [...fix.text].map((char, i) => ({ char, line: 0, start: fix.original[i]/1000, end: fix.original[i+1]/1000 })) };
  const unrelated = structuredClone(chart); unrelated.audioSha256 = 'other-recording';
  assert.equal(repairKnownTiming(unrelated), false);
  const manual = structuredClone(chart); manual.words[1].start += .01;
  assert.equal(repairKnownTiming(manual), false);
  assert.equal(repairKnownTiming(chart), true);
  assert.ok(Math.abs(chart.words[8].end - chart.words[0].start - 5.46) < 1e-6);
  assert.equal(chart.review.required, true);
  assert.equal(repairKnownTiming(chart), false);
});

 test('Japanese YRC retains kana groups and long vowels at provider timestamps', () => {
  const chart = yrcChart('[0,2000](0,500,0)きみ(500,500,0)の(1000,1000,0)スター', 3, 'hash');
  assert.deepEqual(chart.words.map(word => word.char), ['きみ', 'の', 'スター']);
  assert.deepEqual(chart.words.map(word => word.start), [0, .5, 1]);
 });
