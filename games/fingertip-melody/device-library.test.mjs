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
