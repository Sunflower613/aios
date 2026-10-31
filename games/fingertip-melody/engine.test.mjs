import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { parseLrc, makeChart, layoutChart, Round, RhythmRound, ratingFor } from './engine.mjs';

function fixture(texts = ['春风吹到我的窗前', '月光陪我唱到天明']) {
  const words = []; let time = 2;
  texts.forEach((text, line) => [...text].forEach((char, i) => { const duration = [.18, .35, .72, .26][i % 4]; words.push({ char, start: time, end: time + duration, line }); time += duration + .08; }));
  return { version: 2, words, lines: texts.map(text => ({ text })) };
}
test('ratings use unrounded accuracy and phi requires every note perfect with no wrong taps', () => {
  const round = (perfect, good = 0, wrong = 0) => ({ notes: Array(100), perfect, good, wrong });
  assert.equal(ratingFor(round(100)), 'φ');
  assert.equal(ratingFor(round(99)), 'V');
  assert.equal(ratingFor(round(100, 0, 1)), 'V');
  assert.equal(ratingFor(round(95)), 'V');
  assert.equal(ratingFor(round(90)), 'S');
  assert.equal(ratingFor(round(80)), 'A');
  assert.equal(ratingFor(round(70)), 'B');
  assert.equal(ratingFor(round(69)), 'C');
  assert.equal(ratingFor(round(60)), 'C');
  assert.equal(ratingFor(round(59)), 'F');
  assert.equal(ratingFor({ notes: [], perfect: 0, good: 0, wrong: 0 }), 'F');
});
test('metadata, trailing companies, artists and rights notices are not playable', () => {
  const lines = parseLrc('[offset:100]\n[00:01]原唱：歌手\n[00:02]某某音乐有限公司\n[00:03]演唱：某某\n[00:04]本作品经过授权\n[00:05]OP:某某\n[00:06][00:08]花开，花落！');
  assert.deepEqual(lines.filter(l => l.playable).map(l => l.time), [6.1, 8.1]);
  assert.equal(parseLrc('[00:00.4]编曲 Music Arranged by：阿瑞')[0].playable, false);
  const cached = fixture(['编曲阿瑞', '春风吹来']);
  cached.lines[0].text = '编曲 Music Arranged by：阿瑞';
  assert.equal(makeChart(cached, 100).map(n => n.char).join(''), '春风吹来');
});
test('unmeasured, reversed and nonfinite timings are rejected; measured lengths survive unchanged', () => {
  assert.throws(() => makeChart([], 100));
  const input = fixture(); const notes = makeChart(input, 100);
  assert.deepEqual(notes.map(n => [n.time, n.end]), input.words.map(w => [w.start, w.end]));
  for (const end of [NaN, Infinity, 0]) { const data = fixture(); data.words[0].end = end; assert.throws(() => makeChart(data, 100)); }
});
test('within each phrase notes move one neighbouring lane, repeated characters stay put', () => {
  const data = fixture(['啦啦风吹到我的窗前', '明月照山岗']);
  const notes = makeChart(data, 100, 345);
  assert.equal(notes[0].lane, notes[1].lane);
  for (let i = 1; i < notes.length; i++) if (notes[i].line === notes[i - 1].line) {
    assert.equal(Math.abs(notes[i].lane - notes[i - 1].lane), notes[i].char === notes[i - 1].char ? 0 : 1);
  }
  assert.deepEqual(notes, makeChart(data, 100, 345));
});
test('repeated lyrics and detected melodic phrases reuse the same lane path', () => {
  const data = fixture(['春风吹到窗前', '月光照进梦里', '春风吹到窗前']);
  data.lines[0].melodyId = 1; data.lines[1].melodyId = 1;
  const notes = makeChart(data, 100, 17);
  const paths = [0, 1, 2].map(line => notes.filter(n => n.line === line).map(n => n.lane));
  assert.deepEqual(paths[0], paths[1]); assert.deepEqual(paths[0], paths[2]);
});
test('short visual notes overlap across lanes without moving vocal timing; repeated words keep their color', () => {
  const notes = [0, .05, .1, .15].map((time, i) => ({ time, end: time + .02, lane: 0, line: 0, char: i < 2 ? '啦' : '风' }));
  const laid = layoutChart(notes, 3);
  assert.equal(laid[0].lane, laid[1].lane);
  assert.notEqual(laid[1].lane, laid[2].lane);
  assert.equal(laid[0].color, laid[1].color);
  assert.deepEqual(laid.map(n => [n.time, n.end]), notes.map(n => [n.time, n.end]));
  for (const n of laid) assert.ok((n.displayEnd - n.time) * 90 >= 20 - 1e-8);
  assert.deepEqual(laid, layoutChart(notes, 3));
  const varied = layoutChart(Array.from({length: 30}, (_, i) => ({time:i, end:i+.1, lane:0, line:0, char:String(i)})));
  assert.ok(new Set(varied.map(n => n.color)).size > 1);
  assert.equal(new Set(varied.map(n => n.lane)).size, 1);
});

test('score mode can miss an entire song and still accept later notes', () => {
  const notes = makeChart(fixture(), 100);
  const r = new Round(notes);
  r.expire(notes.at(-1).time - .5);
  assert.ok(r.misses > 5);
  assert.equal(r.hit(notes.at(-1).lane, notes.at(-1).time).grade, 'perfect');
  r.expire(100); assert.equal(r.notes.filter(n => n.status === 'pending').length, 0);
});
test('one press never consumes two identical consecutive characters', () => {
  const r = new Round([{ time: 2, lane: 0 }, { time: 2.1, lane: 0 }]);
  r.hit(0, 2); assert.equal(r.perfect, 1); assert.equal(r.notes[1].status, 'pending');
  r.hit(0, 2.1); assert.equal(r.perfect, 2);
});
test('rhythm mode waits indefinitely, wrong lanes do not advance, taps control speed', () => {
  const notes = [{ char: '花', time: 2, end: 2.6, lane: 0 }, { char: '开', time: 3, end: 3.6, lane: 1 }, { char: '了', time: 4, end: 4.6, lane: 2 }];
  const r = new RhythmRound(notes);
  assert.equal(r.expire(999), 0); assert.equal(r.misses, 0);
  for (let i = 0; i < 20; i++) r.tap(3, i, 2);
  assert.equal(r.next.char, '花');
  assert.equal(r.tap(0, 25, 2).grade, 'perfect');
  assert.equal(r.tap(1, 25.5, 2.5).rate, 2);
  r.resume(); assert.equal(r.tap(2, 100, 4).rate, 2); assert.equal(r.next, undefined);
});
test('rapid tapping cannot unlock an entire song ahead of the audio', () => {
  const r = new RhythmRound([{ time: 2, lane: 0 }, { time: 5, lane: 1 }]);
  r.tap(0, 0, 2); assert.equal(r.tap(1, .1, 2).grade, 'early'); assert.equal(r.next.time, 5);
});
test('local charts match the downloaded audio and contain measured varying durations', async t => {
  let library;
  try { library = JSON.parse(await readFile(new URL('./media/library.json', import.meta.url))); }
  catch (e) { if (e.code === 'ENOENT') { t.skip('Local media absent'); return; } throw e; }
  for (const song of library) {
    if (song.available === false || song.playable === false) { assert.equal(song.chart, undefined); continue; }
    assert.ok(song.chart, 'Run align.py before integration testing');
    const chart = JSON.parse(await readFile(new URL(song.chart, import.meta.url)));
    const bytes = await readFile(new URL(song.audio, import.meta.url));
    assert.equal(chart.audioSha256, createHash('sha256').update(bytes).digest('hex'));
    const notes = makeChart(chart, chart.duration, Number(song.sourceId));
    assert.ok(notes.length > 0);
    if (song.source !== 'upload') {
      assert.ok(notes.length > 50); assert.ok(chart.beats.length > 30);
      assert.ok(new Set(notes.map(n => (n.end - n.time).toFixed(2))).size > 10);
    }
    for (const note of notes) assert.ok(chart.lines[note.line].playable);
  }
});
